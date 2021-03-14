from .base import *  # noqa

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "(n(9#@@keu0+$2l6fo6lnjrugimt@g5sn&&*2wnslfk3-_djg#"

# SECURITY WARNING: define the correct hosts in production!
ALLOWED_HOSTS = ["0.0.0.0", "localhost"]

try:
    from .local import *  # noqa
except ImportError:
    pass
