#backend\api\v1\admin\analytics\urls.py
from django.urls import path

from .views import DashboardAnalyticsView

urlpatterns = [
    path("", DashboardAnalyticsView.as_view()),
]