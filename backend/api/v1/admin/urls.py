# backend/api/v1/admin/urls.py

from django.urls import include, path

from .routers import router

# -------------------------
# ADMIN API ROOT
# -------------------------
urlpatterns = [  
    path("", include(router.urls)), 
    path("analytics/", include("api.v1.admin.analytics.urls")), 
]