#backend/products/models.py
import uuid

from cloudinary.models import CloudinaryField  
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone  # for safe default values


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children"
    )

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0.0
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )

    stock = models.PositiveIntegerField(default=0)
    available = models.BooleanField(default=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    image = CloudinaryField('image', blank=True, null=True)

    
    characteristics = models.JSONField(blank=True, null=True)  
    origin_country = models.CharField(max_length=100, blank=True, null=True)  

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=["available"]),
            models.Index(fields=["price"]),
        ]

    def save(self, *args, **kwargs):
        if self.price < 0:
            raise ValueError("Price cannot be negative.")

        if self.stock is not None:
            self.available = self.stock > 0

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.uuid})"

    # -------------------------
    # 🆕 INVENTORY INTELLIGENCE
    # -------------------------
    @property
    def reserved_stock(self):  
        from django.db.models import Sum  

        from orders.models import OrderItem  

        reserved = OrderItem.objects.filter(
            product=self,
            order__status="pending"
        ).aggregate(total=Sum("quantity"))["total"]

        return reserved or 0

    @property
    def available_stock(self):  
        return self.stock - self.reserved_stock


# -------------------------
# 🆕 STOCK HISTORY MODEL
# -------------------------
class StockMovement(models.Model):
    MANUAL = "manual"
    ORDER = "order"
    RESTOCK = "restock"
    SYSTEM = "system"

    REASON_CHOICES = [
        (MANUAL, "Ajuste manual"),
        (ORDER, "Pedido"),
        (RESTOCK, "Reabastecimiento"),
        (SYSTEM, "Sistema"),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="stock_movements"
    )

    old_stock = models.IntegerField()
    new_stock = models.IntegerField()
    change = models.IntegerField()

    reason = models.CharField(
        max_length=50,
        choices=REASON_CHOICES,
        default=MANUAL
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} ({self.change})"

    # 🆕 Spanish label for frontend (optional but recommended)
    @property
    def reason_display_es(self):
        return dict(self.REASON_CHOICES).get(self.reason, self.reason)