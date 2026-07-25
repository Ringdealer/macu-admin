# backend/api/v1/admin/analytics/services.py
from collections import defaultdict
from datetime import timedelta

from django.db.models import Sum

from orders.models import Order, OrderItem

from .selectors import get_orders_for_period
from .utils import get_period_start


# -------------------------
# PERIOD BUCKET HELPERS 
# -------------------------
def get_period_bucket(date, period):
    """
    Normalizes grouping for charts
    """
    if period == "year":
        return date.strftime("%Y-%m")  # monthly buckets

    if period == "month":
        return date.strftime("%Y-%m-%d")  # daily buckets

    if period == "week":
        return date.strftime("%Y-%m-%d")  # daily buckets

    return date.strftime("%Y-%m-%d")


# -------------------------
# TOP PRODUCTS
# -------------------------

def build_top_selling_products(current_orders, previous_orders):
    current = defaultdict(lambda: {"name": "", "qty": 0})
    previous = defaultdict(lambda: 0)

    # -------------------
    # CURRENT PERIOD
    # -------------------
    for order in current_orders:
        for item in order.order_items.all():
            if not item.product:
                continue

            pid = item.product_id

            if not current[pid]["name"]:
                current[pid]["name"] = item.product.name

            current[pid]["qty"] += item.quantity or 0

    # -------------------
    # PREVIOUS PERIOD
    # -------------------
    for order in previous_orders:
        for item in order.order_items.all():
            if not item.product:
                continue

            pid = item.product_id
            previous[pid] += item.quantity or 0

    result = []

    for pid, data in current.items():
        current_qty = data["qty"]
        previous_qty = previous.get(pid, 0)

        delta = current_qty - previous_qty

        percent_change = (delta / previous_qty * 100) if previous_qty > 0 else None

        result.append(
            {
                "name": data["name"],
                # keep legacy
                "qty": current_qty,
                "current_qty": current_qty,
                "previous_qty": previous_qty,
                "delta": delta,
                "percent_change": percent_change,
                "is_new": previous_qty == 0 and current_qty > 0,
                "is_increased": delta > 0,
                "is_decreased": delta < 0,
                "is_flat": delta == 0,
            }
        )

    result.sort(key=lambda x: x["current_qty"], reverse=True)

    return result[:10]


# -------------------------
# CATEGORY PERFORMANCE
# -------------------------
def build_category_performance(orders):
    category_totals = defaultdict(float)

    for order in orders:
        for item in order.order_items.all():
            product = item.product
            if not product:
                continue

            category = (
                product.category.parent.name
                if product.category and product.category.parent
                else (product.category.name if product.category else "Uncategorized")
            )

            revenue = (item.quantity or 0) * float(product.price or 0)
            category_totals[category] += revenue

    result = [
        {
            "category": category,
            "revenue": revenue,
        }
        for category, revenue in category_totals.items()
    ]

    result.sort(key=lambda x: x["revenue"], reverse=True)

    return result


# -------------------------
# CATEGORY PRODUCTS
# -------------------------


def get_product_category_share():
    """
    Returns product category distribution based on sold quantity.
    """

    qs = (
        OrderItem.objects.values("product__category__name")
        .annotate(total=Sum("quantity"))
        .order_by("-total")
    )

    return [
        {
            "category": item["product__category__name"] or "Unknown",
            "value": item["total"] or 0,
        }
        for item in qs
    ]


# -------------------------
# COMPUTE PREVIOUS PERIOD RANGE
# -------------------------


def get_previous_period_start(start_date, period):
    """
    Returns start date of previous equivalent period
    """

    if period == "year":
        return start_date.replace(year=start_date.year - 1)

    if period == "month":
        # naive month shift (safe enough for analytics)
        month = start_date.month - 1
        year = start_date.year

        if month == 0:
            month = 12
            year -= 1

        return start_date.replace(year=year, month=month)

    if period == "week":
        return start_date - timedelta(days=7)

    return start_date - timedelta(days=30)


# -------------------------
# ANALYTICS ORCHESTRATOR
# -------------------------
def get_dashboard_analytics(period="year"):
    base_qs = Order.objects.all()

    period_start = get_period_start(period, base_qs)

    orders = get_orders_for_period(period_start)

    previous_start = get_previous_period_start(period_start, period)

    previous_orders = (
        Order.objects.filter(
            created_at__gte=previous_start, created_at__lt=period_start
        )
        .select_related("customer")
        .prefetch_related(
            "order_items__product",
            "order_items__product__category",
        )
    )

    # -------------------------
    # PERIOD METADATA
    # -------------------------
    period_meta = None

    if orders.exists():
        latest_order = orders.order_by("-created_at").first()
        now = latest_order.created_at

        if period == "year":
            period_meta = {
                "type": "year",
                "year": now.year,
            }

        elif period == "month":
            period_meta = {
                "type": "month",
                "year": now.year,
                "month": now.month,
            }

        elif period == "week":
            period_meta = {
                "type": "week",
                "start": period_start.date().isoformat(),
                "end": now.date().isoformat(),
            }

    return {
        "period": period,
        "period_label": None,
        "period_range": None,
        "period_meta": period_meta,
        "sales_trend": build_sales_trend(orders, period),
        "top_selling_products": build_top_selling_products(orders, previous_orders),
        "category_performance": build_category_performance(orders),
        "category_revenue_over_time": build_category_revenue_over_time(orders, period),
        "customers_trend": build_customers_trend(orders, period),
        "category_share": get_product_category_share(),
    }


# -------------------------
# CATEGORY REVENUE OVER TIME
# -------------------------
def build_category_revenue_over_time(orders, period):
    timeline = defaultdict(lambda: defaultdict(float))

    for order in orders:
        # ✅ FIX: use real period instead of hardcoding "year"
        bucket = get_period_bucket(order.created_at, period)

        for item in order.order_items.all():
            product = item.product
            if not product:
                continue

            category = (
                product.category.parent.name
                if product.category and product.category.parent
                else (product.category.name if product.category else "Uncategorized")
            )

            revenue = (item.quantity or 0) * float(product.price or 0)

            timeline[bucket][category] += revenue

    result = []
    for bucket, categories in sorted(timeline.items()):
        row = {"period": bucket}
        row.update(categories)
        result.append(row)

    return result


# -------------------------
# ORDERS AND REVENUE TRENDS
# -------------------------


def build_sales_trend(orders, period):
    timeline = defaultdict(
        lambda: {
            "orders": 0,
            "revenue": 0.0,
        }
    )

    for order in orders:
        bucket = get_period_bucket(order.created_at, period)

        timeline[bucket]["orders"] += 1

        for item in order.order_items.all():
            product = item.product
            if not product:
                continue

            timeline[bucket]["revenue"] += (item.quantity or 0) * float(
                product.price or 0
            )

    result = []

    for bucket, values in sorted(timeline.items()):
        result.append(
            {
                "period": bucket,
                "orders": values["orders"],
                "revenue": round(values["revenue"], 2),
            }
        )

    return result


# -------------------------
# CUSTOMER TRENDS
# -------------------------


def build_customers_trend(orders, period):
    """
    Counts unique customers per period bucket
    """
    timeline = defaultdict(set)

    for order in orders:
        bucket = get_period_bucket(order.created_at, period)

        # use customer id to avoid duplicates
        if order.customer_id:
            timeline[bucket].add(order.customer_id)

    result = []

    for bucket, customers in sorted(timeline.items()):
        result.append(
            {
                "period": bucket,
                "customers": len(customers),
            }
        )

    return result



