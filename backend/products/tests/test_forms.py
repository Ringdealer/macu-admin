from decimal import Decimal

from django.contrib.auth import get_user_model  # for future user-related tests
from django.test import TestCase

from products.forms import ProductForm
from products.models import Category

User = get_user_model()  # unchanged: gets accounts.CustomUser

class ProductFormTest(TestCase):

    def setUp(self):
        self.category = Category.objects.create(name="Electronics")

    def test_valid_form(self):
        form_data = {
            "name": "Smartphone",
            "description": "Latest model",
            "category": self.category.id,
            "price": Decimal("599.99"),
            "available": True,
        }

        form = ProductForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_price_must_be_positive(self):
        form_data = {
            "name": "Smartphone",
            "description": "Latest model",
            "category": self.category.id,
            "price": Decimal("0.00"),  # invalid
            "available": True,
        }

        form = ProductForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn("price", form.errors)

    def test_missing_required_field(self):
        form_data = {
            "description": "Missing name",
            "category": self.category.id,
            "price": Decimal("10.00"),
            "available": True,
        }

        form = ProductForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn("name", form.errors)

    def test_optional_category(self):
        form_data = {
            "name": "Gadget",
            "description": "No category",
            "price": Decimal("50.00"),
            "available": True,
        }

        form = ProductForm(data=form_data)
        self.assertTrue(form.is_valid())
        product = form.save(commit=False)
        self.assertIsNone(product.category)  # unchanged

    def test_description_widget_rows(self):
        form = ProductForm()
        self.assertEqual(
            form.fields["description"].widget.attrs.get("rows"), 4
        )  # unchanged: checks textarea rows

    def test_price_widget_step(self):
        form = ProductForm()
        self.assertEqual(
            form.fields["price"].widget.attrs.get("step"), "0.01"
        )  # unchanged: checks step attribute