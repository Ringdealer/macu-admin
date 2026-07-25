import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from accounts.models import Customer
from communications.models import ActivityLog, Notification
from orders.models import Order, OrderItem
from products.models import Category, Product

from .config import (
    CUSTOMER_COUNT,
    ORDER_COUNT,
    ORDER_STATUS_DISTRIBUTION,
    PAYMENT_STATUS_DISTRIBUTION,
    SIMULATION_MONTHS,
)
from .distributions import weighted_choice
from .factories import (
    create_categories,
    create_customers,
    create_products,
)

User = get_user_model()


class SeedEngine:
    """
    Business Simulation V2
    """

    def run(self):
        random.seed(42)

        with transaction.atomic():

            self.reset_database()

            print("📦 Creating categories...")
            create_categories()

            print("🛒 Creating products...")
            products = create_products()

            print("👤 Creating customers...")
            customers = create_customers(CUSTOMER_COUNT)

            print("📦 Creating orders...")
            self.create_orders(customers, products)

        print("✅ SEED COMPLETED")

    # --------------------------------------------------
    # RESET
    # --------------------------------------------------

    def reset_database(self):

        print("🧹 Cleaning database (keeping admin users)...")

        ActivityLog.objects.all().delete()
        Notification.objects.all().delete()

        OrderItem.objects.all().delete()
        Order.objects.all().delete()

        Product.objects.all().delete()
        Category.objects.all().delete()
        Customer.objects.all().delete()

        User.objects.filter(is_superuser=False).delete()

    # --------------------------------------------------
    # ORDERS
    # --------------------------------------------------

    def create_orders(self, customers, products):

        days_back = SIMULATION_MONTHS * 30

        for _ in range(ORDER_COUNT):

            customer = random.choice(customers)

            status = weighted_choice(
                ORDER_STATUS_DISTRIBUTION
            )

            payment_status = weighted_choice(
                PAYMENT_STATUS_DISTRIBUTION
            )

            created_at = (
                timezone.now()
                - timedelta(
                    days=random.randint(0, days_back)
                )
            )

            order = Order.objects.create(
                customer=customer,
                phone=customer.phone,
                address=customer.address,
                status=status,
                payment_status=payment_status,
                created_at=created_at,
            )

            items_count = random.randint(1, 4)

            available_products = [
                p for p in products
                if p.stock > 0
            ]

            if not available_products:
                continue

            selected_products = random.sample(
                available_products,
                k=min(
                    items_count,
                    len(available_products)
                )
            )

            for product in selected_products:

                if product.stock <= 0:
                    continue

                quantity = min(
                    random.randint(1, 3),
                    product.stock
                )

                if quantity <= 0:
                    continue

                try:

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity
                    )

                    product.refresh_from_db()

                except Exception as e:

                    print(
                        f"Skipping item {product.name}: {e}"
                    )

                    continue

            # -----------------------------------
            # Notification
            # -----------------------------------

            if random.random() < 0.80:

                Notification.objects.create(
                    order=order,
                    customer=customer,
                    type=random.choice(
                        [
                            "email",
                            "whatsapp",
                            "sms",
                        ]
                    ),
                    status=random.choice(
                        [
                            "sent",
                            "pending",
                        ]
                    ),
                    message=f"Order {order.id} update",
                )

            # -----------------------------------
            # Activity Log
            # -----------------------------------

            ActivityLog.objects.create(
                user=customer.user,
                action="order_update",
                model_name="Order",
                object_id=order.id,
                description=f"Order {order.id} created",
            )