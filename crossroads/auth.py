import logging

from django.core.exceptions import PermissionDenied
from django.contrib.auth import authenticate, login
from django.http import HttpResponseRedirect

from church.models import User


log = logging.getLogger(__name__)


class TokenBackend:
    def authenticate(self, request, token=None):
        if not token:
            return

        try:
            user = User.objects.get(token=token)
            log.info("user %r authenticated via token", user)
            return user
        except User.DoesNotExist:
            return

    def get_user(self, user_id):
        return User.objects.get(pk=user_id)


class AuthenticationMiddleware:
    """Authenticate a user via a token provided in the URL.
    """
    TOKEN = "mem"  # Query param to use to authenticate with

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method != "GET" or self.TOKEN not in request.GET:
            return self.get_response(request)

        token = request.GET[self.TOKEN]

        user = authenticate(request, token=token)
        login(request, user)
        return HttpResponseRedirect(request.path_info)
