import os
from typing import List

from crossroads.dd import ddclient

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(PROJECT_DIR)

LOGGING = {
    "version": 1,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} [{name}] [{name}:{lineno}] - {message}",
            "style": "{",
        },
        "datadog": {
            "format": ddclient.log_format,
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "datadog": {
            "class": "crossroads.dd.DatadogLogHandler",
            "formatter": "datadog",
        },
    },
    "loggers": {
        "graphql": {"handlers": ["console", "datadog"], "level": "INFO"},
        "graphene": {"handlers": ["console", "datadog"], "level": "INFO"},
        "chat": {"handlers": ["console", "datadog"], "level": "INFO"},
        "church": {"handlers": ["console", "datadog"], "level": "INFO"},
        "crossroads": {"handlers": ["console", "datadog"], "level": "INFO"},
        "django": {
            "handlers": ["console", "datadog"],
            "level": "INFO",
        },
        "ddtrace": {"handlers": ["console", "datadog"], "level": "INFO"},
    },
    "root": {
        "handlers": ["console", "datadog"],
        "level": "INFO",
    },
}

INSTALLED_APPS = [
    "search",
    "chat",
    "church",
    "comments",
    "crossroads",
    "prayer",
    "polls",
    "wagtail.contrib.forms",
    "wagtail.contrib.redirects",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    "wagtail.snippets",
    "wagtail.documents",
    "wagtail.images",
    "wagtail.search",
    "wagtail.admin",
    "wagtail.core",
    "wagtailmedia",
    "modelcluster",
    "taggit",
    "django_extensions",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "graphene_django",
]

MIDDLEWARE = [
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "crossroads.auth.AuthenticationMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "wagtail.contrib.legacy.sitemiddleware.SiteMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
]

ROOT_URLCONF = "crossroads.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(PROJECT_DIR, "templates"),
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "crossroads.context_processors.settings_processor",
            ],
        },
    },
]


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    "default": {
        # "ENGINE": "django.db.backends.sqlite3",
        # "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "crossroads",
        "USER": "postgres",
        "PASSWORD": "password",
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "TIMEOUT": 60 * 60 * 5,  # 5 hours (arbitrary)
    }
}

SESSON_ENGINE = "django.contrib.sessions.backends.cached_db"

AUTH_USER_MODEL = "church.User"

# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTHENTICATION_BACKENDS = [
    "crossroads.auth.TokenBackend",
    "django.contrib.auth.backends.ModelBackend",
]


# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

SESSION_COOKIE_AGE = 2 * 365 * 24 * 60 * 60

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

STATICFILES_DIRS = [
    os.path.join(PROJECT_DIR, "static"),
]

# ManifestStaticFilesStorage is recommended in production, to prevent outdated
# Javascript / CSS assets being served from cache (e.g. after a Wagtail upgrade).
# See https://docs.djangoproject.com/en/3.0/ref/contrib/staticfiles/#manifeststaticfilesstorage
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"

STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATIC_URL = "/static/"

MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"


# Wagtail settings
WAGTAIL_SITE_NAME = "crossroads"
WAGTAIL_USER_EDIT_FORM = "church.forms.UserEditForm"
WAGTAIL_USER_CREATION_FORM = "church.forms.UserCreationForm"
WAGTAIL_USER_CUSTOM_FIELDS: List[str] = []

# Base URL to use when referring to full URLs within the Wagtail admin backend -
# e.g. in notification emails. Don't include '/admin' or a trailing slash
BASE_URL = "https://crossroadsajax.church"

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

ASGI_APPLICATION = "crossroads.asgi.application"
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}


EMAIL_BACKEND = "postmark.django_backend.EmailBackend"


class EMAIL_TEMPLATE:
    BULLETIN = "d-8922bc7108f440ac870da8d87b88eb86"
    SERVICE = "d-93ce2ee9a14b4ed7aa2248bb33a3767f"


GRAPHENE = dict(
    SCHEMA="crossroads.schema.schema",
    SCHEMA_OUTPUT="web/schema.json",
)

SECRET_KEY = os.getenv("DJANGO_SECRET")

POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")
POSTMARK_SENDER = "lynn@crossroadsajax.church"
POSTMARK_TEST_MODE = False
POSTMARK_TRACK_OPENS = False
