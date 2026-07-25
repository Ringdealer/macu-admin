# backend/api/v1/filters.py
from django_filters import rest_framework as filters

from orders.models import Order
from products.models import Product


class ProductFilter(filters.FilterSet):
    price_min = filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = filters.NumberFilter(field_name="price", lookup_expr='lte')
    category_id = filters.NumberFilter(method="filter_category")
    available = filters.BooleanFilter(field_name="available")

    class Meta:
        model = Product
        fields = ["category_id", "available", "price_min", "price_max"]

    def filter_category(self, queryset, name, value):
        from products.models import Category

        try:
            category = Category.objects.get(id=value)
        except Category.DoesNotExist:
            return queryset.none()

        child_ids = list(
            Category.objects.filter(parent=category)
            .values_list("id", flat=True)
        )

        category_ids = [category.id] + child_ids

        return queryset.filter(category_id__in=category_ids)

class OrderFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")
    payment_status = filters.CharFilter(field_name="payment_status", lookup_expr="iexact")

    class Meta:
        model = Order
        fields = ["status", "payment_status"]