# backend/accounts/models.py

import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

# Validator for numeric phone numbers
phone_validator = RegexValidator(
    regex=r'^\+?\d{7,20}$',  # allows optional '+' and 7-20 digits
    message="Enter a valid phone number (digits only, optional leading '+')."
)

class CustomUser(AbstractUser):
    email = models.EmailField(blank=True, null=True)  

    phone_number = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_validator],  # enforce numeric-only
    )
    address = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=True)  

    class Meta:
        permissions = [
            ("can_manage_products", "Can manage products"),
            ("can_manage_orders", "Can manage all orders"),
        ]


class Customer(models.Model):
    # Public-safe identifier
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
    )

    # Links one-to-one with your existing CustomUser
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[phone_validator]
    )
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.uuid})"