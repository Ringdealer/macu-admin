from django.test import SimpleTestCase, TestCase
from django.urls import resolve, reverse

from pages.views import AboutPageView, HomePageView


class HomePageTests(TestCase):

    def setUp(self):
        self.response = self.client.get(reverse("home"))

    def test_homepage_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_homepage_template_used(self):
        self.assertTemplateUsed(self.response, "pages/home.html")

    def test_homepage_contains_correct_html(self):
        self.assertContains(self.response, " Bienvenidos a MACU")

    def test_homepage_does_not_contain_incorrect_html(self):
        self.assertNotContains(self.response, "Hi there! I should not be on the page.")


class TestHomePageURL(SimpleTestCase):

    def test_homepage_resolves_to_homepageview(self):
        url = reverse("home")
        match = resolve(url)
        self.assertEqual(match.func.view_class, HomePageView)


class AboutPageTests(SimpleTestCase):

    def setUp(self):
        url = reverse("about")
        self.response = self.client.get(url)

    def test_aboutpage_status_code(self):
        self.assertEqual(self.response.status_code, 200)

    def test_aboutpage_template(self):
        self.assertTemplateUsed(self.response, "pages/about.html")

    def test_aboutpage_contains_correct_html(self):
        self.assertContains(self.response, "About")

    def test_aboutpage_does_not_contain_incorrect_html(self):
        self.assertNotContains(
            self.response,
            "Hi there! I should not be on the page."
        )

    def test_aboutpage_url_resolves_aboutpageview(self):
        url = reverse("about")
        view = resolve(url)
        self.assertEqual(
            view.func.__name__,
            AboutPageView.as_view().__name__
        )