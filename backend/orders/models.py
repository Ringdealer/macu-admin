# backend/orders/models.py

import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from accounts.models import Customer
from products.models import Product


class Order(models.Model):
    # -------------------------
    # ORDER STATUS (SPANISH LABELS)
    # -------------------------
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_PACKED = "packed"
    STATUS_SHIPPED = "shipped"
    STATUS_IN_TRANSIT = "in_transit"
    STATUS_DELIVERED = "delivered"
    STATUS_RETURNED = "returned"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pendiente"),
        (STATUS_CONFIRMED, "Confirmado"),
        (STATUS_PACKED, "Empacado"),
        (STATUS_SHIPPED, "Enviado"),
        (STATUS_IN_TRANSIT, "En tránsito"),
        (STATUS_DELIVERED, "Entregado"),
        (STATUS_RETURNED, "Devuelto"),
        (STATUS_CANCELLED, "Cancelado"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "No pagado"),
        ("paid", "Pagado"),
        ("failed", "Fallido"),
    ]

    # -------------------------
    # CORE FIELDS
    # -------------------------
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid"
    )

    phone = models.CharField(max_length=30, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    admin_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    items = models.ManyToManyField(
        Product,
        through="OrderItem",
        related_name="orders"
    )

    class Meta:
        ordering = ["-created_at"]

    # -------------------------
    # SAFE STATUS TRANSITIONS
    # -------------------------
    ALLOWED_TRANSITIONS = {
        STATUS_PENDING: [STATUS_CONFIRMED, STATUS_CANCELLED],
        STATUS_CONFIRMED: [STATUS_PACKED, STATUS_CANCELLED],
        STATUS_PACKED: [STATUS_SHIPPED, STATUS_CANCELLED],
        STATUS_SHIPPED: [STATUS_IN_TRANSIT],
        STATUS_IN_TRANSIT: [STATUS_DELIVERED, STATUS_RETURNED],
        STATUS_DELIVERED: [STATUS_RETURNED],
    }

    def can_transition(self, new_status):
        return new_status in self.ALLOWED_TRANSITIONS.get(self.status, [])

    # -------------------------
    # STOCK RECOVERY
    # -------------------------
    def restore_stock(self):
        for item in self.order_items.select_related("product"):
            product = item.product
            product.stock += item.quantity
            product.save(update_fields=["stock"])

    # -------------------------
    # SAVE LOGIC
    # -------------------------
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None

        if not is_new:
            old = Order.objects.get(pk=self.pk)
            old_status = old.status

            # validate transition
            if old.status != self.status:
                if not old.can_transition(self.status):
                    raise ValidationError(
                        f"Transición no permitida: {old.status} → {self.status}"
                    )

                # restore stock if cancelled
                if self.status == self.STATUS_CANCELLED:
                    self.restore_stock()

        super().save(*args, **kwargs)

        # -------------------------
        # NOTIFICATIONS (SAFE IMPORT)
        # -------------------------
        if not is_new and old_status != self.status:
            try:
                from communications.services import send_order_notification
                send_order_notification(self)
            except Exception as e:
                print("Notification error:", e)

    def __str__(self):
        return f"Pedido {self.uuid}"


# -------------------------
# ORDER ITEMS
# -------------------------
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="order_items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["order", "product"],
                name="unique_order_product"
            )
        ]

    def save(self, *args, **kwargs):
        previous_quantity = 0

        if self.pk:
            previous_quantity = OrderItem.objects.get(pk=self.pk).quantity

        stock_difference = self.quantity - previous_quantity

        # 🔒 stock validation only when increasing quantity
        if stock_difference > 0 and stock_difference > self.product.stock:
            raise ValidationError(
                f"No hay suficiente stock para '{self.product.name}'. "
                f"Disponible: {self.product.stock}"
            )

        super().save(*args, **kwargs)

        # update stock
        if stock_difference > 0:
            self.product.stock -= stock_difference
        elif stock_difference < 0:
            self.product.stock += abs(stock_difference)

        self.product.save(update_fields=["stock"])

    def delete(self, *args, **kwargs):
        self.product.stock += self.quantity
        self.product.save(update_fields=["stock"])
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"