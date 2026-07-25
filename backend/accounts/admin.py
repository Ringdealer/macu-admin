# backend/accounts/admin.py

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from accounts.services import create_customer_service  

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import Customer

CustomUser = get_user_model()


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = (
        "username",
        "email",
        "phone_number",
        "is_staff",
        "is_superuser",
        "is_verified",
    )

    list_filter = (
        "is_staff",
        "is_superuser",
        "is_verified",
    )

    fieldsets = UserAdmin.fieldsets + (
        (None, {"fields": ("phone_number", "address", "is_verified")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {"fields": ("phone_number", "address", "is_verified")}),
    )

    search_fields = (
        "username",
        "email",
        "phone_number",
    )

    ordering = ("username",)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "phone",
        "address",
    )

    search_fields = (
        "user__username",
        "user__email",
        "phone",
    )

    list_select_related = ("user",)

    autocomplete_fields = ("user",)

    # 🔥 SAFE ALIGNMENT WITH API
    def save_model(self, request, obj, form, change):  
        """
        Ensure admin uses same logic as API when creating customers.
        """
        if not change:
            # Only on CREATE (not update)

            data = form.cleaned_data

            customer, _ = create_customer_service(
                name=obj.user.first_name if obj.user else "",
                email=obj.user.email if obj.user else None,
                phone=data.get("phone"),
                address=data.get("address"),
            )

            obj.pk = customer.pk  # reuse created one
            return

        super().save_model(request, obj, form, change)