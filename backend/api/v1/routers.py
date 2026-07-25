#backend/api/v1/routers.py

from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .viewsets import (
    CategoryViewSet,
    OrderItemViewSet,
    OrderViewSet,
    ProductViewSet,
)

# -------------------------
# MAIN ROUTER
# -------------------------
router = DefaultRouter()

router.register("products", ProductViewSet, basename="products")
router.register("orders", OrderViewSet, basename="orders")
router.register(r"categories", CategoryViewSet)






# -------------------------
# NESTED ROUTES (ORDER ITEMS)
# -------------------------
orders_router = NestedDefaultRouter(router, "orders", lookup="order")

orders_router.register(
    "items",
    OrderItemViewSet,
    basename="order-items"
)