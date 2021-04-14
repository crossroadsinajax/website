from .base import *  # noqa

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "(n(9#@@keu0+$2l6fo6lnjrugimt@g5sn&&*2wnslfk3-_djg#"

# SECURITY WARNING: define the correct hosts in production!
ALLOWED_HOSTS = ["0.0.0.0", "localhost"]

RUM_APP_ID = "23a0f3c3-09fc-4c27-ae76-d147e820a3ac"
RUM_CLIENT_TOKEN = "pub7c18ec5932f220e2a42e9ca8a3e1b7c1"

try:
    from .local import *  # noqa
except ImportError:
    pass
