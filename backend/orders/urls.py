#backend/orders/urls.py
from django.urls import path

# Views replaced by API ViewSets; these are legacy, may be removed
from .views import OrderCreateView, OrderDetailView, OrderListView

urlpatterns = [
    path("", OrderListView.as_view(), name="orders-list"),
    path("create/", OrderCreateView.as_view(), name="orders-create"),
    # Use UUID for safer public URLs
    path("<uuid:uuid>/", OrderDetailView.as_view(), name="orders-detail"),
]

# ✅ Note: consider switching to DRF routers instead of manual URL patterns