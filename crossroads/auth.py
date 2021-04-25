import logging

from django.contrib.auth import authenticate, login
from django.core.cache import cache
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
        if user_id in cache:
            return cache.get(user_id)
        else:
            user = User.objects.get(pk=user_id)
            cache.set(user_id, user)
            return user


class AuthenticationMiddleware:
    """Authenticate a user via a token provided in the URL."""

    PARAM = "mem"  # Query param to use to authenticate with

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method != "GET" or self.PARAM not in request.GET:
            return self.get_response(request)

        token = request.GET[self.PARAM]

        user = authenticate(request, token=token)
        if user:
            login(request, user)
            return HttpResponseRedirect(request.path_info)

        return self.get_response(request)
