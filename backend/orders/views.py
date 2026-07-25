from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView

from .forms import OrderForm
from .models import Order


class OrderCreateView(LoginRequiredMixin, CreateView):
    model = Order
    form_class = OrderForm
    template_name = "orders/order_form.html"
    success_url = reverse_lazy("orders-list")
    extra_context = {
        "page_title": _("Crear Nuevo Pedido")
    }

    def form_valid(self, form):
        # Assign current logged-in customer automatically
        form.instance.customer = self.request.user.customer
        return super().form_valid(form)


class OrderListView(LoginRequiredMixin, ListView):
    model = Order
    template_name = "orders/order_list.html"
    context_object_name = "orders"
    extra_context = {
        "page_title": _("Lista de Pedidos")
    }

    def get_queryset(self):
        user = self.request.user

        # Staff users can see all orders
        if user.is_staff:
            return Order.objects.all()

        # Safe customer access
        customer = getattr(user, "customer", None)

        if customer:
            return Order.objects.filter(customer=customer)

        return Order.objects.none()


class OrderDetailView(LoginRequiredMixin, DetailView):
    model = Order
    template_name = "orders/order_detail.html"
    context_object_name = "order"
    slug_field = "uuid"
    slug_url_kwarg = "uuid"

    def get_object(self, queryset=None):
        obj = super().get_object()
        user = self.request.user

        if user.is_staff:
            return obj

        customer = getattr(user, "customer", None)

        if customer and obj.customer == customer:
            return obj

        raise PermissionDenied("You do not have permission to view this order.")