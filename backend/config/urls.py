# backend/config/urls.py
from django.conf import settings
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token

from users.views import CustomVerifyEmailView

# --- Language switcher URL ---
urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),  # enables set_language view
]

# --- Main URL patterns wrapped in i18n_patterns ---
urlpatterns += i18n_patterns(
    # Django admin
    path("admin/", admin.site.urls),

    # Accounts (signup, login, etc.)
    path("accounts/", include("accounts.urls")),
    path("accounts/", include("allauth.urls")),  

    # Orders
    path("orders/", include("orders.urls")),

    # Products
    path("products/", include("products.urls")),
    
    # Homepage and static pages
    path("", include("pages.urls")),

    # Core API router with versioning
    path("api/", include("api.urls")),

    # Token authentication endpoint
    path("api/token/", obtain_auth_token),

    # dj-rest-auth endpoints
    path("api/auth/", include("dj_rest_auth.urls")),

    path(
        "api/auth/registration/account-confirm-email/<str:key>/",
        CustomVerifyEmailView.as_view(),
        name="account_confirm_email"
    ),

    # dj-rest-auth registration endpoints
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),

    # DRF browsable API login/logout
    path('api-auth/', include('rest_framework.urls')),
)

# --- Serve media files during development ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    # --- Django Debug Toolbar URLs ---
    import debug_toolbar  
    urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]  