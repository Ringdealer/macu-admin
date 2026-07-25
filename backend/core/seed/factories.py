# backend/core/seed/factories.py

import random

from faker import Faker

from accounts.models import Customer, CustomUser
from products.models import Category, Product

from .config import PRODUCT_CATEGORIES, PRODUCT_NAMES

fake = Faker()


# -------------------------
# CATEGORIES
# -------------------------

def create_categories():

    categories = []

    for name in PRODUCT_CATEGORIES:
        category, _ = Category.objects.get_or_create(
            name=name
        )

        categories.append(category)

    return categories


# -------------------------
# PRODUCTS
# -------------------------

def create_products():

    products = []

    categories = list(Category.objects.all())

    for category in categories:

        names = PRODUCT_NAMES[category.name]

        for product_name in names:

            product = Product.objects.create(
                name=product_name,
                description=f"Imported {product_name}",
                category=category,
                stock=random.randint(50, 300),
                price=random.randint(3, 40),
                origin_country=random.choice(
                    ["Spain", "Mexico", "Brazil", "USA"]
                ),
                characteristics={
                    "quality": "standard"
                }
            )

            products.append(product)

    return products


# -------------------------
# CUSTOMERS
# -------------------------

def create_customers(count):

    customers = []

    for _ in range(count):

        user = CustomUser.objects.create_user(
            username=fake.unique.user_name(),
            email=fake.unique.email(),
            password="test1234",
        )

        customer, created = Customer.objects.get_or_create(
            user=user,
            defaults={
                "phone": fake.msisdn()[:15],
                "address": fake.address(),
            }
        )

        customers.append(customer)

    return customers