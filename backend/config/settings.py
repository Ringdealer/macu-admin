# backend/config/settings.py

import os
from pathlib import Path

import cloudinary
import cloudinary.api
import cloudinary.uploader
import dj_database_url
from dotenv import load_dotenv

# ========================
# BASE DIRECTORY
# ========================

BASE_DIR = Path(__file__).resolve().parent.parent

# ========================
# ENVIRONMENT VARIABLES
# ========================

# Load .env only if it exists (for local development)
env_file = BASE_DIR.parent / ".env"
if env_file.exists():
    load_dotenv(env_file)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required.")

DEBUG = os.getenv("DEBUG", "False").lower() == "true"
DJANGO_ENV = os.getenv("DJANGO_ENV", "local")

# ========================
# FEATURE FLAGS
# ========================

FEATURE_EMAIL = False


# ======================================
# WHATSAPP CALLMEBOT AUTOMATIC MESSAGING
# ======================================

CALLMEBOT_PHONE = os.getenv("CALLMEBOT_PHONE", "")  
CALLMEBOT_APIKEY = os.getenv("CALLMEBOT_APIKEY", "") 

# ========================
# ALLOWED HOSTS
# ========================

if DEBUG:
    ALLOWED_HOSTS = ["*"]
else:
    allowed_hosts_env = os.getenv("ALLOWED_HOSTS")
    if not allowed_hosts_env:
        raise ValueError("ALLOWED_HOSTS must be set in production.")
    ALLOWED_HOSTS = [
        host.strip() for host in allowed_hosts_env.split(",") if host.strip()
    ]

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:5175",
    "https://macu-frontend.onrender.com",
    "https://macuexpress.com",
    "https://www.macuexpress.com",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
     "https://macu-admin.onrender.com",
]

# ========================
# APPLICATIONS
# ========================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",

    "accounts.apps.AccountsConfig",
    "pages.apps.PagesConfig",
    "products.apps.ProductsConfig",
    "orders.apps.OrdersConfig",
    "api.apps.ApiConfig",
    "communications.apps.CommunicationsConfig",
    
    "core",

    "crispy_forms",
    "crispy_tailwind",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
"allauth.socialaccount.providers.google",
    "anymail",
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "django_filters",
    "drf_spectacular",
    "corsheaders",
    "debug_toolbar",
    'cloudinary',
    'cloudinary_storage',
]

# ========================
# MIDDLEWARE
# ========================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

INTERNAL_IPS = ["127.0.0.1"]

# ========================
# TEMPLATES
# ========================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ========================
# DATABASE
# ========================

env = os.getenv("DJANGO_ENV", "local")

if env == "docker":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB"),
            "USER": os.getenv("POSTGRES_USER"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
            "HOST": os.getenv("POSTGRES_HOST"),
            "PORT": os.getenv("POSTGRES_PORT"),
        }
    }

elif env == "production":
    DATABASES = {
        "default": dj_database_url.config(
            default=os.getenv("DATABASE_URL"),
            conn_max_age=600,
            ssl_require=True,
        )
    }

elif env == "local":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

else:
    raise ValueError(f"Invalid DJANGO_ENV: {env}")

# ========================
# AUTH
# ========================

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "accounts.CustomUser"

# ========================
# INTERNATIONALIZATION
# ========================

LANGUAGE_CODE = "es"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [("es", "Español"), ("en", "English")]

LOCALE_PATHS = [BASE_DIR / "locale"]

# ========================
# STATIC
# ========================

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"

if DEBUG:
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"
else:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ========================
# MEDIA
# ========================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

MEDIA_CDN_URL = "https://macu-media.onrender.com"

# ========================
# REST FRAMEWORK
# ========================

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.UserRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"user": "100/minute"},
}

REST_AUTH = {
    "REGISTER_SERIALIZER": "api.v1.serializers.CustomRegisterSerializer",  

    "USER_DETAILS_SERIALIZER": "api.v1.serializers.CustomUserDetailsSerializer"
}


# ========================
# CRISPY FORMS
# ========================

CRISPY_ALLOWED_TEMPLATE_PACKS = "tailwind"
CRISPY_TEMPLATE_PACK = "tailwind"

# ========================
# ALLAUTH (IMPORTANT CHANGE)
# ========================

SITE_ID = 1

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

ACCOUNT_LOGIN_METHODS = {"username"}  
ACCOUNT_SIGNUP_FIELDS = ["username*", "password1*"]  
ACCOUNT_UNIQUE_EMAIL = False  




LOGIN_URL = "account_login"

ACCOUNT_EMAIL_VERIFICATION = "none"  
ACCOUNT_CONFIRM_EMAIL_ON_GET = False  

ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "https://macu-frontend.onrender.com/"
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = "https://macu-frontend.onrender.com/"

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

# ========================
# EMAIL (INFRASTRUCTURE READY - FEATURE DISABLED)
# ========================

if FEATURE_EMAIL:
    EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
    ANYMAIL = {
        "BREVO_API_KEY": os.environ.get("BREVO_API_KEY"),
    }

DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL")
SERVER_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL")



# ========================
# SECURITY
# ========================

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SPECTACULAR_SETTINGS = {
    "TITLE": "Macu Platform API",
    "DESCRIPTION": "REST API for the Macu e-commerce and administration platform.",
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ========================
# CLOUDINARY
# ========================

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'