#backend/accounts/signals.py
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import Customer

User = get_user_model()

@receiver(post_save, sender=User)
def create_customer_for_new_user(sender, instance, created, **kwargs):
    """
    Automatically create a Customer profile whenever
    a new User is created.
    Safe against duplicate creation.
    """
    if created:
        Customer.objects.get_or_create(user=instance)