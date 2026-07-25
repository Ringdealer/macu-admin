# backend/communications/models.py

from django.conf import settings
from django.db import models

from accounts.models import Customer


class Notification(models.Model):
    TYPE_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("sms", "SMS"),
        ("email", "Email"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pendiente"),
        ("sent", "Enviado"),
        ("failed", "Fallido"),
    ]

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True
    )

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    response = models.TextField(blank=True, null=True)

    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)  
    last_attempt_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} → {self.customer} ({self.status})"


class AdminNote(models.Model):
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="communication_notes", 
        db_index=True
    )

    note = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_notes_created"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note {self.id} (Order {self.order_id})"
    
class ActivityLog(models.Model):
    ACTION_TYPES = [
    ("order_update", "Actualización de pedido"),
    ("stock_change", "Cambio de stock"),
    ("product_create", "Creación de producto"),
    ("product_update", "Actualización de producto"),
    ("product_delete", "Eliminación de producto"),
]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs"
    )

    action = models.CharField(max_length=50, choices=ACTION_TYPES)

    model_name = models.CharField(max_length=50)  # Order, Product, etc
    object_id = models.IntegerField()

    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} by {self.user}"