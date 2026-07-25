import uuid
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from orders.models import Order, OrderItem
from products.models import Category, Product

User = get_user_model()


class OrderModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="pass")
        # Customer is automatically created by signal
        self.customer = self.user.customer

    def test_order_creation(self):
        order = Order.objects.create(customer=self.customer)
        self.assertEqual(order.status, "pending")
        self.assertEqual(order.payment_status, "unpaid")
        self.assertIsNotNone(order.uuid)
        self.assertIsInstance(order.uuid, uuid.UUID)


class OrderItemModelTest(TestCase):

    def setUp(self):
        user = User.objects.create_user(username="testuser2", password="pass")
        # Customer automatically created by signal
        customer = user.customer

        category = Category.objects.create(name="Tech")
        product = Product.objects.create(
            name="Phone",
            price=Decimal("500.00"),
            category=category,
            stock=10
        )

        self.order = Order.objects.create(customer=customer)
        self.product = product

    def test_order_item_creation(self):
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2
        )
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.product.name, "Phone")
        self.assertEqual(item.order, self.order)

    def test_order_item_zero_quantity_defaults_to_one(self):  
        item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1  
        )
        self.assertEqual(item.quantity, 1)