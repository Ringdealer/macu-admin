from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.forms import CustomUserChangeForm, CustomUserCreationForm

User = get_user_model()


class CustomUserCreationFormTest(TestCase):
    """Tests for the CustomUserCreationForm."""

    def test_form_valid_data(self):
        """Form is valid when all required fields are provided."""
        form_data = {
            "username": "ben",
            "email": "ben@example.com",
            "phone_number": "123456789",
            "address": "Cuba",
            "password1": "strongpass123",
            "password2": "strongpass123",
        }
        form = CustomUserCreationForm(data=form_data)
        self.assertTrue(form.is_valid())
        user = form.save()
        self.assertEqual(user.username, "ben")
        self.assertEqual(user.email, "ben@example.com")
        self.assertEqual(user.phone_number, "123456789")
        self.assertEqual(user.address, "Cuba")

    def test_form_invalid_phone_number(self):
        """Form should be invalid if phone_number contains non-digits."""
        form_data = {
            "username": "ben",
            "email": "ben@example.com",
            "phone_number": "1234567a9",  # invalid
            "address": "Cuba",
            "password1": "strongpass123",
            "password2": "strongpass123",
        }
        form = CustomUserCreationForm(data=form_data)
        self.assertFalse(form.is_valid())  # form should reject invalid phone
        self.assertIn("phone_number", form.errors)

    def test_form_missing_optional_fields(self):
        """Form is valid even if optional fields are left blank."""
        form_data = {
            "username": "maria",
            "email": "",
            "phone_number": "",
            "address": "",
            "password1": "strongpass123",
            "password2": "strongpass123",
        }
        form = CustomUserCreationForm(data=form_data)
        self.assertTrue(form.is_valid())
        user = form.save()
        self.assertEqual(user.email, "")
        self.assertEqual(user.phone_number, "")
        self.assertEqual(user.address, "")

    def test_form_password_mismatch(self):
        """Form is invalid if passwords do not match."""
        form_data = {
            "username": "ben",
            "email": "ben@example.com",
            "password1": "password1",
            "password2": "password2",
        }
        form = CustomUserCreationForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn("password2", form.errors)


class CustomUserChangeFormTest(TestCase):
    """Tests for the CustomUserChangeForm."""

    def setUp(self):
        """Create a sample user to update."""
        self.user = User.objects.create_user(
            username="ben",
            email="ben@example.com",
            password="testpass123",
            phone_number="123456789",
            address="Cuba"
        )

    def test_form_valid_update(self):
        """Form allows updating fields correctly."""
        form_data = {
            "username": "ben_updated",
            "email": "ben_updated@example.com",
            "phone_number": "987654321",
            "address": "Mexico",
            "is_active": True,
            "is_verified": True,
        }
        form = CustomUserChangeForm(data=form_data, instance=self.user)
        self.assertTrue(form.is_valid())
        user = form.save()
        self.assertEqual(user.username, "ben_updated")
        self.assertEqual(user.email, "ben_updated@example.com")
        self.assertEqual(user.phone_number, "987654321")
        self.assertEqual(user.address, "Mexico")
        self.assertTrue(user.is_verified)

    def test_form_missing_required_fields(self):
        """Form is invalid if required fields are missing."""
        form_data = {
            "username": "",
            "email": "",
            "phone_number": "",
            "address": "",
            "is_active": True,
            "is_verified": True,
        }
        form = CustomUserChangeForm(data=form_data, instance=self.user)
        self.assertFalse(form.is_valid())
        self.assertIn("username", form.errors)