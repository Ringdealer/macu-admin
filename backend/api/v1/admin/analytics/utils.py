#backend\api\v1\admin\analytics\utils.py
from datetime import timedelta

from django.utils import timezone

VALID_PERIODS = {
    "week",
    "month",
    "year",
}


def get_period_start(period, queryset=None):
    """
    Returns a safe period start.

    If queryset is provided, we anchor the period to data
    to avoid empty dashboards when there is a gap in recent activity.
    """

    now = timezone.now()

    # -------------------------
    # DATASET-ANCHORED MODE (RECOMMENDED)
    # -------------------------
    if queryset is not None and queryset.exists():
        latest_date = queryset.order_by("-created_at").values_list(
            "created_at",
            flat=True
        ).first()

        # normalize to timezone-aware datetime
        now = latest_date or now

    # -------------------------
    # PERIOD LOGIC
    # -------------------------
    if period == "week":
        return now - timedelta(days=7)

    if period == "month":
        return now.replace(day=1)

    return now.replace(
        month=1,
        day=1,
    )