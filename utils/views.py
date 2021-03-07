import functools

from django.core import exceptions


def authenticated(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        context = args[0]
        if hasattr(context, "user"):
            user = context.user
        elif hasattr(context, "request") and hasattr(context.request, "user"):
            user = context.request.user
        else:
            raise exceptions.PermissionDenied("")

        if not user.is_authenticated:
            raise exceptions.PermissionDenied("")
        return f(*args, **kwargs)

    return wrapper
