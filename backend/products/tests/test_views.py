'''from django.test import TestCase
from django.urls import reverse
from products.models import Product, Category
from decimal import Decimal
from django.contrib.auth import get_user_model  # use the custom user model
import uuid

User = get_user_model()  # unchanged: gets active user model


class ProductViewsTest(TestCase):

    def setUp(self):
        # create a test user using the custom user model
        self.user = User.objects.create_user(username="testuser", password="testpass")

        self.category = Category.objects.create(name="Books")

        self.product = Product.objects.create(
            name="Django Book",
            price=Decimal("29.99"),
            category=self.category,
            stock=5,  # unchanged: corrected field name
        )

    def test_login_required_redirect_product_list(self):
        # HTML view: unauthenticated users should be redirected to login
        response = self.client.get(reverse("products-list"))
        self.assertEqual(response.status_code, 302)  # unchanged
        self.assertIn("/accounts/login/", response.url)  # unchanged

    def test_login_required_redirect_product_detail(self):
        # HTML view: unauthenticated users redirected to login
        response = self.client.get(reverse("products-detail", args=[self.product.uuid]))
        self.assertEqual(response.status_code, 302)  # unchanged
        self.assertIn("/accounts/login/", response.url)  # unchanged

    def test_product_list_view_status_code(self):
        # login user to access HTML view
        self.client.login(username="testuser", password="testpass")
        response = self.client.get(reverse("products-list"))
        self.assertEqual(response.status_code, 200)  # unchanged

    def test_product_list_view_template(self):
        self.client.login(username="testuser", password="testpass")
        response = self.client.get(reverse("products-list"))
        self.assertTemplateUsed(response, "products/product_list.html")  # unchanged
        self.assertIn("products", response.context)  # unchanged
        self.assertIn(self.product, response.context["products"])  # unchanged
        self.assertEqual(response.context.get("page_title"), "Productos Disponibles")  # unchanged

    def test_product_detail_view_status_code(self):
        self.client.login(username="testuser", password="testpass")
        response = self.client.get(reverse("products-detail", args=[self.product.uuid]))
        self.assertEqual(response.status_code, 200)  # unchanged
        self.assertEqual(response.context["product"], self.product)  # unchanged
        self.assertTemplateUsed(response, "products/product_detail.html")  # unchanged

    def test_product_detail_view_404(self):
        self.client.login(username="testuser", password="testpass")
        fake_uuid = uuid.uuid4()
        response = self.client.get(reverse("products-detail", args=[fake_uuid]))
        self.assertEqual(response.status_code, 404)  # unchanged '''