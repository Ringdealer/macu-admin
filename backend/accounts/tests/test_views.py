from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

User = get_user_model()

'''
class SignupPageTests(TestCase):

    def setUp(self):
        self.signup_url = reverse("signup")
        self.valid_user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "phone_number": "1234567890",
            "address": "123 Test Street",
            "password1": "ComplexPass123!",
            "password2": "ComplexPass123!",
        }

    def test_signup_page_status_code(self):
        response = self.client.get(self.signup_url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "registration/signup.html")

    def test_signup_form_creates_user(self):
        self.client.post(self.signup_url, self.valid_user_data)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.first().email, "testuser@example.com")

    def test_signup_redirects_to_login(self):
        response = self.client.post(self.signup_url, self.valid_user_data)
        self.assertRedirects(response, reverse("login"))

    def test_signup_invalid_form(self):
        invalid_data = self.valid_user_data.copy()
        invalid_data["password2"] = "wrongpassword"

        response = self.client.post(self.signup_url, invalid_data)

        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(response.status_code, 200) '''

class SignupPageTests(TestCase):
    username = "newuser"
    email = "newuser@email.com"

    def setUp(self):
        url = reverse("account_signup")
        self.response = self.client.get(url)

    def test_signup_template(self):
        self.assertEqual(self.response.status_code, 200)
        self.assertTemplateUsed(self.response, "account/signup.html")
        self.assertContains(self.response, "Sign Up")
        self.assertNotContains(self.response, "Hi there! I should not be on the page.")

    def test_signup_form(self):
        new_user = get_user_model().objects.create_user(self.username, self.email)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(new_user.username, self.username)
        self.assertEqual(new_user.email, self.email)