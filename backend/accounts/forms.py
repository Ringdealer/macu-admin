from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserChangeForm, UserCreationForm


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = get_user_model()
        fields = (
            "username",
            "email",
            "phone_number",
            "address",
        )

    def clean_phone_number(self):
        phone = self.cleaned_data.get("phone_number")
        if phone and not phone.isdigit():
            raise forms.ValidationError("Phone number must contain digits only.")
        return phone


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = get_user_model()
        fields = (
            "username",
            "email",
            "phone_number",
            "address",
            "is_active",
            "is_verified",
        )
