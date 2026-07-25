from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class AccountsAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )

    def test_authenticated_user_exists(self):
        self.assertEqual(User.objects.count(), 1)

    def test_login_with_valid_credentials(self):
        login = self.client.login(
            username="testuser",
            password="testpass123"
        )
        self.assertTrue(login)

    def test_login_with_invalid_credentials(self):
        login = self.client.login(
            username="testuser",
            password="wrongpass"
        )
        self.assertFalse(login)