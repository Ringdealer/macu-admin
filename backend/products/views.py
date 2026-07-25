from django.contrib.auth.mixins import LoginRequiredMixin  # for requiring login
from django.utils.translation import gettext_lazy as _
from django.views.generic import DetailView, ListView

from .models import Product


class ProductListView(LoginRequiredMixin, ListView):
    model = Product
    template_name = "products/product_list.html"
    context_object_name = "products"
    queryset = Product.objects.order_by('-created_at')  # optional ordering
    extra_context = {
        "page_title": _("Productos Disponibles")
    }


class ProductDetailView(LoginRequiredMixin, DetailView):
    model = Product
    template_name = "products/product_detail.html"
    context_object_name = "product"
    slug_field = "uuid"
    slug_url_kwarg = "uuid"