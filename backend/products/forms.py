from django import forms
from django.utils.translation import gettext_lazy as _

from .models import Product


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ["name", "description", "category", "price", "available"]

        labels = {
            "name": _("Product Name"),
            "description": _("Description"),
            "category": _("Category"),
            "price": _("Price"),
            "available": _("Available"),
        }

        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
            "price": forms.NumberInput(attrs={"step": "0.01"}),
        }

    def clean_price(self):
        price = self.cleaned_data.get("price")
        if price <= 0:
            raise forms.ValidationError(_("Price must be greater than zero."))
        return price