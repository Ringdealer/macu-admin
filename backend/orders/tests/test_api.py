from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Customer, CustomUser
from orders.models import Order, OrderItem
from products.models import Product


class OrderAPITest(APITestCase):
    def setUp(self):
        # Clean all relevant tables to avoid UNIQUE constraint errors
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Product.objects.all().delete()
        Customer.objects.all().delete()
        CustomUser.objects.all().delete()

        # Create test user and authenticate
        self.user = CustomUser.objects.create_user(
            username="buyer",
            password="strongpass"
        )
        self.client.force_authenticate(user=self.user)

        # Create or reuse Customer (safe for unique constraint)
        self.customer, _ = Customer.objects.get_or_create(user=self.user)

        # Create test product
        self.product = Product.objects.create(
            name="Sugar",
            description="White sugar",
            price=10,
            stock=100
        )

        # Create a test order
        self.order = Order.objects.create(
            customer=self.customer,
            status="pending",
            payment_status="unpaid"
        )

        # Create a test order item
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2
        )

    def test_retrieve_order(self):
        """Test retrieving a single order"""
        url = reverse("orders-detail", kwargs={"pk": self.order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pending")
        self.assertEqual(response.data["payment_status"], "unpaid")

    def test_list_orders(self):
        """Test listing orders"""
        url = reverse("orders-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Only check that the test order exists
        order_ids = [o["id"] for o in response.data["results"]]
        self.assertIn(self.order.id, order_ids)

    def test_list_order_items(self):
        """Test listing items for a given order"""
        url = reverse("order-items-list", kwargs={"order_pk": self.order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Only check that the test order item exists
        item_ids = [i["id"] for i in response.data["results"]]
        self.assertIn(self.order_item.id, item_ids)