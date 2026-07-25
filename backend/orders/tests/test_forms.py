from django.contrib.auth import get_user_model
from django.test import TestCase

from orders.forms import OrderForm
from products.models import Category, Product

User = get_user_model()


class OrderFormTest(TestCase):

    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

        # Customer is automatically created by the signal
        # So we retrieve it instead of creating it manually
        self.customer = self.user.customer

        # Create category
        self.category = Category.objects.create(
            name="Electronics"
        )

        # Create product
        self.product = Product.objects.create(
            name="Laptop",
            description="A powerful laptop",
            price=1000,
            category=self.category
        )

    def test_valid_order_form(self):
        """Test form is valid with correct data"""
        form_data = {
            "customer": self.customer.id,
            "status": "pending",
            "payment_status": "unpaid",
        }

        form = OrderForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_missing_customer(self):
        """Test form behavior without customer"""
        form_data = {
            "status": "pending",
            "payment_status": "unpaid",
        }

        form = OrderForm(data=form_data)
        self.assertFalse(form.is_valid())  # customer is required

    def test_labels(self):
        """Test field labels"""
        form = OrderForm()

        self.assertEqual(
            form.fields["customer"].label,
            "Customer"
        )

        self.assertEqual(
            form.fields["status"].label,
            "Estado"
        )

        self.assertEqual(
            form.fields["payment_status"].label,
            "Payment Status"
        )