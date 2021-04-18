from .base import *  # noqa


DEBUG = False

ALLOWED_HOSTS = [
    "crossroadsajax.church",
]


LOGGING = {
    "version": 1,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "chat": {"handlers": ["console"], "level": "WARN"},
        "church": {"handlers": ["console"], "level": "WARN"},
        "crossroads": {"handlers": ["console"], "level": "WARN"},
        "django": {
            "handlers": ["console"],
            "level": "WARN",
        },
        "ddtrace": {"handlers": ["console"], "level": "WARN"},
    },
}


# These are mounted by docker secrets.
# They are defined in prod.yml.
def read_secret(secret):
    with open(f"/run/secrets/{secret}") as f:
        return f.read().strip()


SECRET_KEY = read_secret("django_secret")

POSTMARK_API_KEY = read_secret("postmark_api_key")

RUM_APP_ID = "9c74cba4-819c-48e4-be27-23494a1eda0f"
RUM_CLIENT_TOKEN = "pubc904a1cc67eb3c421ed9a30fb4c45f05"
