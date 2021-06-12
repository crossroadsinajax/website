import os

from .base import *  # noqa

DEBUG = False

ALLOWED_HOSTS = [
    "crossroadsajax.church",
]


# These are mounted by docker secrets.
# They are defined in prod.yml.
def read_secret(secret) -> str:
    with open(f"/run/secrets/{secret}") as f:
        return f.read().strip()


DD_API_KEY = read_secret("datadog_api_key")
os.environ["DD_API_KEY"] = DD_API_KEY

SECRET_KEY = read_secret("django_secret")

POSTMARK_API_KEY = read_secret("postmark_api_key")

RUM_APP_ID = "9c74cba4-819c-48e4-be27-23494a1eda0f"  # nosec
RUM_CLIENT_TOKEN = "pubc904a1cc67eb3c421ed9a30fb4c45f05"  # nosec
