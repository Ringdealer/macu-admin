#backend\api\v1\admin\analytics\views.py
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import get_dashboard_analytics


class DashboardAnalyticsView(APIView):

    def get(self, request):
        period = request.query_params.get("period", "year")

        data = get_dashboard_analytics(period=period)

        return Response(data)