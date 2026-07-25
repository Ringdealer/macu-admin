# backend/api/v1/urls.py

# backend/api/v1/urls.py

from django.urls import include, path

from .routers import orders_router, router
from .viewsets import ProfileView  

urlpatterns = [
    path("", include(router.urls)),
    path("", include(orders_router.urls)),

    # PROFILE ENDPOINT
    path("profile/", ProfileView.as_view(), name="profile"),
    path("admin/", include("api.v1.admin.urls")),  
]