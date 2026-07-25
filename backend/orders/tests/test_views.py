'''from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from accounts.models import Customer
from orders.models import Order
from products.models import Product, Category
from decimal import Decimal
import uuid

User = get_user_model()


class OrderViewsTest(TestCase):

    def setUp(self):
        # Regular user
        self.user = User.objects.create_user(username="testuser", password="pass")
        self.customer = self.user.customer  # Customer created automatically by signal

        # Staff user
        self.staff_user = User.objects.create_user(
                    username="staffuser",
                    password="pass",
                    is_staff=True,
                )
        self.staff_customer = self.staff_user.customer  # Customer created automatically

        # Sample order for regular user
        self.order = Order.objects.create(customer=self.customer)

    # -------------------- Login required --------------------
    def test_login_required_redirect_order_list(self):
        response = self.client.get(reverse("orders-list"))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("account_login"), response.url)

    def test_login_required_redirect_order_detail(self):
        response = self.client.get(reverse("orders-detail", args=[self.order.uuid]))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("account_login"), response.url)

    # -------------------- Logged-in user access --------------------
    def test_order_list_view_for_logged_in_user(self):
        self.client.login(username="testuser", password="pass")
        response = self.client.get(reverse("orders-list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "orders/order_list.html")
        self.assertIn(self.order, response.context["orders"])
        self.assertEqual(response.context.get("page_title"), "Lista de Pedidos")

    def test_order_detail_view_for_owner(self):
        self.client.login(username="testuser", password="pass")
        response = self.client.get(reverse("orders-detail", args=[self.order.uuid]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "orders/order_detail.html")
        self.assertEqual(response.context["order"], self.order)

    # -------------------- Staff access --------------------
    def test_order_detail_view_for_staff_user(self):
        self.client.login(username="staffuser", password="pass")
        response = self.client.get(reverse("orders-detail", args=[self.order.uuid]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["order"], self.order)

    # -------------------- Permission denied --------------------
    def test_order_detail_permission_denied_for_other_user(self):
        # Create another regular user
        other_user = User.objects.create_user(username="otheruser", password="pass")
        other_customer = other_user.customer  # created automatically
        self.client.login(username="otheruser", password="pass")

        response = self.client.get(reverse("orders-detail", args=[self.order.uuid]))
        self.assertEqual(response.status_code, 403)

    # -------------------- 404 case --------------------
    def test_order_detail_view_404(self):
        self.client.login(username="testuser", password="pass")
        fake_uuid = uuid.uuid4()
        response = self.client.get(reverse("orders-detail", args=[fake_uuid]))
        self.assertEqual(response.status_code, 404)'''