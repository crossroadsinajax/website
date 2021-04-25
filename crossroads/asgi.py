import os

import django
from ddtrace.contrib.asgi import TraceMiddleware
from django.conf.urls import url
from django.core.asgi import get_asgi_application

# Fetch Django ASGI application early to ensure AppRegistry is populated
# before importing consumers and AuthMiddlewareStack that may import ORM
# models.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crossroads.settings.prod")
django_asgi_app = get_asgi_application()
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

import chat.consumers  # noqa this import is required to register the chat consumer
import church.consumers  # noqa this import is required to register the chat consumer
import polls.consumers  # noqa this import is required to register the poll consumer

from . import consumers

django.setup()

application = ProtocolTypeRouter(
    {
        # Handle traditional http requests.
        "http": TraceMiddleware(django_asgi_app),
        # Handle websocket requests.
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    url(r"ws/", consumers.Consumer.as_asgi()),
                ]
            )
        ),
    }
)
