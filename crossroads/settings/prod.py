from .base import *  # noqa

DEBUG = False

ALLOWED_HOSTS = [
    "crossroadsajax.church",
    "crossroadsinajax.xyz",
    "192.168.2.125",
]

LOGGING = {
    "version": 1,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
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
