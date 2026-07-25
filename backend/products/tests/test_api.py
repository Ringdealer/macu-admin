from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from products.models import Category, Product


class ProductAPITest(APITestCase):
    def setUp(self):
        # Clean tables to ensure test independence
        Product.objects.all().delete()
        Category.objects.all().delete()

        # Create test user and authenticate
        self.user = CustomUser.objects.create_user(
            username="tester",
            password="strongpass"
        )
        self.client.force_authenticate(user=self.user)

        # Create test category
        self.category = Category.objects.create(name="Test Category")

        # Create test products
        self.product1 = Product.objects.create(
            name="Sugar",
            description="White sugar",
            price=10,
            stock=100,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name="Soap",
            description="Organic soap",
            price=5,
            stock=50,
            category=self.category
        )

    def test_retrieve_product(self):
        """Test retrieving a single product by ID"""
        url = reverse("products-detail", kwargs={"pk": self.product1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Sugar")

    def test_list_products_basic(self):
        """Test that the product list returns all products"""
        url = reverse("products-list") + "?page_size=100"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Only assert that products exist, not exact counts
        product_names = [p["name"] for p in response.data["results"]]
        self.assertIn("Sugar", product_names)
        self.assertIn("Soap", product_names)