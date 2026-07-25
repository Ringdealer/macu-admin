#backend\api\v1\admin\analytics\selectors.py
from orders.models import Order


def get_orders_for_period(start_date):
    return (
        Order.objects
        .filter(created_at__gte=start_date)
        .select_related("customer")
        .prefetch_related(
            "order_items__product",
            "order_items__product__category",
        )
    )