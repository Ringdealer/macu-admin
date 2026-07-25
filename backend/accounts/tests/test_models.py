from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()


class CustomUserModelTest(TestCase):
    """Meaningful tests for the CustomUser model."""

    def setUp(self):
        """Create a base sample user for tests that need it."""
        self.user = User.objects.create_user(
            username="ben",
            email="ben@example.com",
            password="testpass123",
            phone_number="123456789",
            address="Cuba"
        )

    def test_default_is_verified_false(self):
        """New users must not be verified by default."""
        self.assertFalse(self.user.is_verified)

    def test_optional_fields_can_be_blank(self):
        """Phone number and address can be left blank."""
        user = User.objects.create_user(
            username="maria",
            password="testpass123"
        )
        self.assertEqual(user.phone_number, "")
        self.assertEqual(user.address, "")

    def test_username_required(self):
        """Creating a user without a username should fail."""
        with self.assertRaises(TypeError):
            User.objects.create_user(password="123")

    def test_email_optional_for_creation(self):
        """Email can be optional if business rules allow."""
        user = User.objects.create_user(username="joe", password="123")
        self.assertEqual(user.email, "")

    def test_string_representation_returns_username(self):
        """__str__ method should return the username."""
        self.assertEqual(str(self.user), self.user.username)

    def test_superuser_creation(self):
        """Superuser must have is_staff and is_superuser True."""
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)

    
    def test_password_is_hashed(self):
        """Passwords should not be stored in plain text."""
        user = User.objects.create_user(username="alice", password="mysecret")
        self.assertNotEqual(user.password, "mysecret")
        self.assertTrue(user.check_password("mysecret"))

