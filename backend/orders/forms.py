from django import forms
from django.forms import inlineformset_factory
from django.utils.translation import gettext_lazy as _

from .models import Order, OrderItem


# Form for creating/updating an Order
class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ["customer", "status", "payment_status"]  # allow editing statuses
        labels = {
            "customer": _("Customer"),
            "status": _("Status"),
            "payment_status": _("Payment Status"),
        }


# Form for individual OrderItems
class OrderItemForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = ["product", "quantity"]
        labels = {
            "product": _("Product"),
            "quantity": _("Quantity"),
        }

    def clean_quantity(self):
        quantity = self.cleaned_data.get("quantity")
        if quantity <= 0:
            raise forms.ValidationError(_("Quantity must be at least 1."))
        return quantity


# Inline formset to manage multiple OrderItems in a single order
OrderItemFormSet = inlineformset_factory(
    Order,
    OrderItem,
    form=OrderItemForm,
    extra=1,
    can_delete=True,
)