# backend/api/v1/admin/routers.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .viewsets import (
    ActivityLogViewSet,
    AdminNoteViewSet,
    CategoryViewSet,
    CustomerViewSet,
    LowStockViewSet,
    NotificationViewSet,
    OrderViewSet,
    ProductViewSet,
    StockMovementViewSet,
)

# -------------------------
# ADMIN ROUTER
# -------------------------
router = DefaultRouter()  

router.register("notifications", NotificationViewSet, basename="admin-notifications")  
router.register("notes", AdminNoteViewSet, basename="admin-notes")  
router.register("customers", CustomerViewSet, basename="admin-customers")  
router.register("stock-movements", StockMovementViewSet, basename="admin-stock-movements")  
router.register("low-stock", LowStockViewSet, basename="admin-low-stock")  
router.register("activity-logs", ActivityLogViewSet, basename="admin-activity-logs")  
router.register(r"categories", CategoryViewSet, basename="categories")
router.register("orders", OrderViewSet, basename="admin-orders")
router.register(r"products", ProductViewSet, basename="admin-products")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/analytics/", include("api.v1.admin.analytics.urls")),
]