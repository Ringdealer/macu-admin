# backend/users/views.py

from dj_rest_auth.registration.views import VerifyEmailView
from django.http import HttpResponseRedirect


class CustomVerifyEmailView(VerifyEmailView):
    def get(self, request, *args, **kwargs):
        self.kwargs["key"] = kwargs["key"]
        confirmation = self.get_object()
        confirmation.confirm(request)   # ← this is the missing step

        return HttpResponseRedirect("https://macu-frontend.onrender.com/login")