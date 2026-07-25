#backend/api/v1/admin/viewsets.py
import logging
import re
import uuid

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Case, CharField, F, Sum, Value, When
from django.db.models.functions import Concat
from django.utils import timezone
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import (
    SAFE_METHODS,
    AllowAny,
    IsAdminUser,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from accounts.models import Customer
from communications.models import ActivityLog, AdminNote, Notification
from communications.services import dispatch_notification, log_activity
from orders.models import Order, OrderItem
from products.models import Category, Product, StockMovement

from .serializers import (
    ActivityLogSerializer,
    AdminNoteSerializer,
    CategorySerializer,
    CustomerSerializer,
    NotificationSerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
    StockMovementSerializer,
)

logger = logging.getLogger(__name__)


# =========================================================
# CATEGORIES
# =========================================================


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read for everyone authenticated,
    but write only for admin/staff.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return request.user and request.user.is_staff


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer

    # control access
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    pagination_class = None


# =========================================================
# COMMUNICATIONS
# =========================================================
class NotificationViewSet(ReadOnlyModelViewSet):
    queryset = Notification.objects.select_related(
        "customer", "order"
    ).all().order_by("-created_at")

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    # -------------------------
    # ADMIN RETRY BUTTON
    # -------------------------
    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def retry(self, request, pk=None):
        notification = self.get_object()

        if notification.status == "sent":
            return Response(
                {"detail": "Notification already sent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notification.retry_count = 0
        notification.status = "pending"
        notification.last_attempt_at = timezone.now()
        notification.save(update_fields=[
            "retry_count",
            "status",
            "last_attempt_at"
        ])

        dispatch_notification(notification)

        return Response({
            "detail": "Retry executed",
            "status": notification.status,
            "response": notification.response,
        })


class AdminNoteViewSet(ModelViewSet):
    queryset = AdminNote.objects.select_related(
        "order", "created_by"
    ).all().order_by("-created_at")

    serializer_class = AdminNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        order_id = self.request.query_params.get("order")
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        return queryset


# =========================================================
# FILTERS
# =========================================================
class StrictOrderingFilter(OrderingFilter):
    ORDERING_ALIASES = {}

    def remove_invalid_fields(self, queryset, ordering, view, request):

        valid_fields = [
            field[0] if isinstance(field, (tuple, list)) else field
            for field in view.ordering_fields
        ]

        translated = []

        for field in ordering:
            descending = field.startswith("-")
            stripped = field.lstrip("-")

            orm_field = self.ORDERING_ALIASES.get(
                stripped,
                stripped,
            )

            if orm_field not in valid_fields:
                raise ValidationError(
                    f"Invalid ordering field: {stripped}"
                )

            translated.append(
                f"-{orm_field}" if descending else orm_field
            )

        return translated


class ProductFilter(filters.FilterSet):
    price_min = filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.CharFilter(field_name="category_id", lookup_expr="iexact")
    available = filters.BooleanFilter(field_name="available")

    class Meta:
        model = Product
        fields = ["category", "available", "price_min", "price_max"]


class OrderFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    payment_status = filters.CharFilter(field_name="payment_status", lookup_expr="iexact")

    class Meta:
        model = Order
        fields = ["status", "payment_status"]


# =========================================================
# PRODUCT
# =========================================================
class ProductViewSet(ModelViewSet):
    queryset = (
    Product.objects
    .select_related("category", "category__parent")
    .annotate(
        category_name=F("category__name"),
        parent_category_name=F("category__parent__name"),
    )
)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, StrictOrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description"]

    ordering_fields = [
    "name",
    "price",
    "available",
    "created_at",
    "stock",
    "category_name",
    "parent_category_name",
]
    ordering = ["name"]

    def get_serializer_context(self):
        return {"request": self.request}

    # -------------------------
    # 🔥 AUDIT: PRODUCT CREATE
    # -------------------------
    def perform_create(self, serializer):
        product = serializer.save()

        # ✅ enforce availability rule
        if product.stock is not None:
            product.available = product.stock > 0
            product.save(update_fields=["available"])

        log_activity(
            user=self.request.user,
            action="product_create",
            instance=product,
            description=
                f"Product '{product.name}' created "
                f"(price={product.price}, stock={product.stock})"
        )

    # -------------------------
    # 🔥 AUDIT: PRODUCT UPDATE (WITH DIFF)
    # -------------------------
    def perform_update(self, serializer):
        instance = self.get_object()

        old_data = {
            "name": instance.name,
            "price": instance.price,
            "stock": instance.stock,
            "available": instance.available,
        }

        product = serializer.save()

        # ✅ enforce availability rule on update
        if product.stock is not None:
            product.available = product.stock > 0
            product.save(update_fields=["available"])

        new_data = {
            "name": product.name,
            "price": product.price,
            "stock": product.stock,
            "available": product.available,
        }

        changes = []
        for field in old_data:
            if old_data[field] != new_data[field]:
                changes.append(f"{field}: {old_data[field]} → {new_data[field]}")

        description = "No changes"
        if changes:
            description = " | ".join(changes)

        log_activity(
            user=self.request.user,
            action="product_update",
            instance=product,
            description=description
        )

    # -------------------------
    # AUDIT: PRODUCT DELETE
    # -------------------------
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        log_activity(
            user=request.user,
            action="product_delete",
            instance=instance,
            description=f"Product '{instance.name}' deleted"
        )

        return super().destroy(request, *args, **kwargs)


# =========================================================
# ORDER PAGINATION
# =========================================================
class CustomerOrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


# =========================================================
# ORDER
# =========================================================
class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomerOrderPagination

    filter_backends = [DjangoFilterBackend, SearchFilter, StrictOrderingFilter]
    filterset_class = OrderFilter
    search_fields = [
    "uuid",
    "customer__user__first_name",
    "customer__user__last_name",
    "customer__user__username",
    "customer__user__email",
]

    ordering_fields = [
    "id",
    "created_at",
    "status",
    "payment_status",
    "customer_name",
    "total",
]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        customer = getattr(user, "customer", None)

        if user.is_staff or user.is_superuser:
            return Order.objects.all().select_related(
    "customer"
).prefetch_related(
    "order_items__product__category__parent"
).annotate(
    customer_name=Case(
        When(
            customer__user__first_name__isnull=False,
            customer__user__first_name__gt="",
            then=Concat(
                F("customer__user__first_name"),
                Value(" "),
                F("customer__user__last_name"),
            ),
        ),
        default=F("customer__user__username"),
        output_field=CharField(),
    ),
    total=Sum(
        F("order_items__product__price") *
        F("order_items__quantity")
    ),
)

        if customer:
            return Order.objects.filter(customer=customer).select_related(
    "customer"
).prefetch_related(
    "order_items__product"
)

        return Order.objects.none()

    def perform_create(self, serializer):
        customer = getattr(self.request.user, "customer", None)

        if not customer:
            raise PermissionDenied("El usuario no tiene perfil de cliente asociado.")

        order_items_data = self.request.data.get("order_items", [])

        if not order_items_data:
            raise ValidationError("El pedido debe contener al menos un producto.")

        with transaction.atomic():
            for item in order_items_data:
                product_id = item.get("product")
                quantity = item.get("quantity", 0)

                product = Product.objects.only(
                    "id", "name", "available", "stock"
                ).filter(id=product_id).first()

                if not product:
                    raise ValidationError(f"Producto con id {product_id} no existe.")

                if not product.available:
                    raise ValidationError(f"El producto '{product.name}' no está disponible.")

                if quantity > product.stock:
                    raise ValidationError(
                        f"No hay suficiente stock para '{product.name}'. "
                        f"Disponible: {product.stock}"
                    )

            serializer.save(customer=customer)

    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        print(queryset.first())

        return super().list(request, *args, **kwargs)
    
    # -------------------------
    # AUDIT + NOTIFICATION
    # -------------------------
    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status

        order = serializer.save()
        new_status = order.status

        # AUDIT LOG
        log_activity(
            user=self.request.user,
            action="order_update",
            instance=order,
            description=f"Order {order.id} updated ({old_status} → {new_status})"
        )

        # NOTIFICATION ON STATUS CHANGE
        if old_status != new_status:
            Notification.objects.create(
                order=order,
                customer=order.customer,
                type="whatsapp",
                message=f"Tu pedido {order.uuid} cambió a {new_status}",
                status="pending"
            )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        log_activity(
            user=request.user,
            action="order_delete",
            instance=instance,
            description=f"Order {instance.id} deleted"
        )

        return super().destroy(request, *args, **kwargs)


# =========================================================
# ORDER ITEMS
# =========================================================
class OrderItemViewSet(ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        order_id = self.kwargs.get("order_pk")

        return OrderItem.objects.filter(
            order_id=order_id
        ).select_related(
            "product", "order"
        ).order_by("id")


# =========================================================
# LOW STOCK
# =========================================================
class LowStockViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    http_method_names = ["get"]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return Product.objects.none()

        return Product.objects.filter(
            stock__lte=10
        ).select_related(
            "category"
        ).order_by("stock")


# backend/api/v1/admin/viewsets.py

# =========================================================
# CUSTOMER
# =========================================================
class CustomerViewSet(ModelViewSet):
    queryset = (
    Customer.objects
    .select_related("user")
    .annotate(
    customer_name=Case(
        When(
            user__first_name__isnull=False,
            user__first_name__gt="",
            then=Concat(
                F("user__first_name"),
                Value(" "),
                F("user__last_name"),
            ),
        ),
        default=F("user__username"),
        output_field=CharField(),
    ),
)
    .all()
    .order_by("customer_name")
)

    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        StrictOrderingFilter,
    ]

    search_fields = [
    "user__first_name",
    "user__last_name",
    "user__username",
    "user__email",
    "phone",
    "address",
]

    ordering_fields = [
        "customer_name",
        "user__email",
        "phone",
        "address",
        "user__is_verified",
    ]

    ordering = ["customer_name", "id"]

    
    def normalize_phone(self, phone):  
        if not phone:  
            return ""  

        phone = str(phone).strip()  

        # Remove everything except digits
        digits = re.sub(r"\D", "", phone)  

        if not digits:  
            return ""  

        # Always store normalized international format
        return f"+{digits}"  

    def create(self, request, *args, **kwargs):
        User = get_user_model()
        data = request.data

        name = data.get("name")
        email = data.get("email")
        phone = self.normalize_phone(data.get("phone", ""))  
        address = data.get("address", "")
        password = data.get("password")

        email = (email or "").strip().lower()

        with transaction.atomic():

            if email:
                user, _ = User.objects.get_or_create(
                    email=email,
                    defaults={
                        "username": email,
                        "first_name": name or "",
                    }
                )
            else:
                user = User.objects.create(
                    username=f"customer_{uuid.uuid4().hex[:8]}",
                    first_name=name or ""
                )

            if password:
                user.set_password(password)
                user.save()

            customer, created = Customer.objects.get_or_create(
                user=user,
                defaults={
                    "phone": phone,
                    "address": address,
                }
            )

            if not created:
                customer.phone = phone or customer.phone
                customer.address = address or customer.address
                customer.save()

        serializer = self.get_serializer(customer)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
# =========================================================
# STOCK MOVEMENTS
# =========================================================
class StockMovementViewSet(ReadOnlyModelViewSet):
    serializer_class = StockMovementSerializer

    def get_queryset(self):
        queryset = StockMovement.objects.all().order_by("-created_at")

        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return queryset
    







# -------------------------
# ACTIVITY LOGS (AUDIT)
# -------------------------
class ActivityLogViewSet(ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related("user").all().order_by("-created_at")
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()

        model = self.request.query_params.get("model")
        object_id = self.request.query_params.get("object_id")
        user_id = self.request.query_params.get("user")

        if model:
            queryset = queryset.filter(model_name=model)

        if object_id:
            queryset = queryset.filter(object_id=object_id)

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset