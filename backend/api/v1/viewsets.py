# backend/api/v1/viewsets.py

import logging

from django.db import transaction
from django.db.models import Value
from django.db.models.functions import Concat
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from orders.models import Order, OrderItem
from products.models import Category, Product

# ---------------- FIX: ONLY IMPORT SERIALIZER (NO DUPLICATION) ----------------
from .serializers import (
    CategorySerializer,
    OrderItemSerializer,
    OrderSerializer,
    ProductSerializer,
    ProfileSerializer,
)

logger = logging.getLogger(__name__)


# =========================
# PROFILE VIEW
# =========================
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    # ---------------- GET PROFILE ----------------
    def get(self, request):
        # FIX: always use USER, not Customer
        serializer = ProfileSerializer(request.user) 
        return Response(serializer.data)

    # ---------------- UPDATE PROFILE ----------------
    def patch(self, request):
        serializer = ProfileSerializer(
            request.user, data=request.data, partial=True
        )  

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
        # ---------------- DELETE ACCOUNT ----------------
    def delete(self, request):
        user = request.user

        user.email = f"deleted_{user.id}@deleted.local"
        user.username = f"deleted_{user.id}"
        user.first_name = ""
        user.last_name = ""
        user.phone = None  # if exists
        user.address = ""
        user.is_active = False
        user.is_verified = False  # if you have this field

        user.save()

        
        return Response({"detail": "Account deleted successfully"})


# ---------------- Strict Ordering Filter ----------------
class StrictOrderingFilter(OrderingFilter):
    def remove_invalid_fields(self, queryset, ordering, view, request):
        valid_fields = [
            item[0]
            for item in self.get_valid_fields(queryset, view, {"request": request})
        ]

        for field in ordering:
            stripped = field.lstrip("-")
            if stripped not in valid_fields:
                raise ValidationError(f"Invalid ordering field: {stripped}")

        return ordering


# ---------------- Product Filter ----------------
class ProductFilter(filters.FilterSet):
    price_min = filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.CharFilter(field_name="category_id", lookup_expr="iexact")
    available = filters.BooleanFilter(field_name="available")

    class Meta:
        model = Product
        fields = ["category", "available", "price_min", "price_max"]


# ---------------- Order Filter ----------------
class OrderFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    payment_status = filters.CharFilter(field_name="payment_status", lookup_expr="iexact")

    class Meta:
        model = Order
        fields = ["status", "payment_status"]


# ---------------- Product ViewSet ----------------
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        StrictOrderingFilter,
    ]

    filterset_class = ProductFilter
    search_fields = ["name", "description"]

    ordering_fields = ["name", "price", "available", "created_at", "stock"]
    ordering = ["name"]

    def get_serializer_context(self):
        return {"request": self.request}
    
    # ---------------- Category ViewSet ----------------
    

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer



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
    search_fields = ["uuid"]

    ordering_fields = [
        "id",
        "created_at",
        "status",
        "payment_status",
        "customer_name",
    ]
    ordering = ["-created_at"]

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()

        customer = getattr(request.user, "customer", None)

        if not customer or order.customer != customer:
            raise PermissionDenied("No puedes cancelar este pedido.")

        if order.status != "pending":
            return Response(
                {"error": "Solo pedidos pendientes pueden cancelarse."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "cancelled"
        order.save(update_fields=["status"])

        return Response(
            {"message": "Pedido cancelado correctamente."},
            status=status.HTTP_200_OK,
        )

    def get_queryset(self):
        user = self.request.user
        customer = getattr(user, "customer", None)

        if user.is_staff or user.is_superuser:
            return (
                Order.objects.select_related(
                    "customer__user"
                )
                .prefetch_related(
                    "order_items__product__category__parent"
                )
                .annotate(
                    customer_name=Concat(
                        "customer__user__first_name",
                        Value(" "),
                        "customer__user__last_name",
                    )
                )
            )

        if customer:
            return (
                Order.objects.filter(customer=customer)
                .select_related(
                    "customer__user"
                )
                .prefetch_related(
                    "order_items__product__category__parent"
                )
                .annotate(
                    customer_name=Concat(
                        "customer__user__first_name",
                        Value(" "),
                        "customer__user__last_name",
                    )
                )
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

                try:
                    product = Product.objects.only(
                        "id", "name", "available", "stock"
                    ).get(id=product_id)
                except Product.DoesNotExist:
                    raise ValidationError(f"Producto con id {product_id} no existe.")

                if not product.available:
                    raise ValidationError(
                        f"El producto '{product.name}' no está disponible."
                    )

                if quantity > product.stock:
                    raise ValidationError(
                        f"No hay suficiente stock para '{product.name}'. "
                        f"Disponible: {product.stock}"
                        )

            serializer.save(customer=customer)

    def perform_update(self, serializer):
        user = self.request.user
        data = self.request.data.copy()

        if not user.is_staff:
            data.pop("status", None)
            data.pop("payment_status", None)

        serializer.save()

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Solo el staff puede eliminar pedidos.")

        logger.warning(f"Order deleted by user {request.user}")
        return super().destroy(request, *args, **kwargs)


# ---------------- OrderItem ViewSet ----------------
class OrderItemViewSet(ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        order_id = self.kwargs.get("order_pk")

        return (
            OrderItem.objects.filter(order_id=order_id)
            .select_related("product", "order")
            .order_by("id")
        )