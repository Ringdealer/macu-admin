from django.urls import path

from .views import SignupPageView  # keep original import

urlpatterns = [
    path("signup/", SignupPageView.as_view(), name="signup"),
    # Future URLs can be added here, e.g. login, profile
    # path("login/", LoginPageView.as_view(), name="login"),
    # path("profile/", ProfilePageView.as_view(), name="profile"),
]