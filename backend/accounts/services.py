# backend/accounts/services.py

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

from accounts.models import Customer

User = get_user_model()


def create_customer_service(*, name, email, phone="", address="", password=None):
    email = (email or "").strip().lower()

    if not email:
        raise ValueError("Email is required")

    password = password or "123456"

    try:
        with transaction.atomic():

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": name or "",
                },
            )

            if created:
                user.set_password(password)
                user.save()
            else:
                if name and user.first_name != name:
                    user.first_name = name
                    user.save()

            customer = Customer.objects.filter(user=user).first()

            if customer:
                return customer, False  # already exists

            customer = Customer.objects.create(
                user=user,
                phone=phone,
                address=address,
            )

            return customer, True  # created

    except IntegrityError:
        customer = Customer.objects.get(user__email=email)
        return customer, False