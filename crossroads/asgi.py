import os

import django
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


class NoopLifespanApp:
    """
    Needed so that hypercorn doesn't display an error when using channels:
        https://github.com/django/channels/issues/1216
    """

    def __init__(self, scope):
        self.scope = scope

    async def __call__(self, receive, send):
        if self.scope["type"] == "lifespan":
            while True:
                message = await receive()
                if message["type"] == "lifespan.startup":
                    await send({"type": "lifespan.startup.complete"})
                elif message["type"] == "lifespan.shutdown":
                    await send({"type": "lifespan.shutdown.complete"})
                    return


application = ProtocolTypeRouter(
    {
        # Handle traditional http requests.
        "http": django_asgi_app,
        "lifespan": NoopLifespanApp,
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
