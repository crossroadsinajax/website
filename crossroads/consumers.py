from typing import Dict, Union, Type
import json
import logging

import channels
from channels.generic.websocket import AsyncWebsocketConsumer
from ddtrace import tracer
from ddtrace.constants import SPAN_MEASURED_KEY


log = logging.getLogger(__name__)


# TODO extend AsyncWebsocketConsumer with management utils
"""
class ChannelManager:
    # maintain real-time stats about a chatroom

    rooms = dict()

    @classmethod
    def get_or_create_room(cls, room):
        if room not in cls.rooms:
            cls.rooms[room] = dict(users=dict(),)
        return cls.rooms[room]

    @classmethod
    def register(cls, room, user):
        room = cls.get_or_create_room(room)
        user_meta = room["users"].get(user.username, dict(count=0))
        user_meta["count"] = user_meta["count"] + 1
        room["users"][user.username] = user_meta

    @classmethod
    def deregister(cls, room, user):
        room = cls.get_or_create_room(room)
        user_meta = room["users"].get(user.username)
        if not user_meta:
            return
        user_meta["count"] = user_meta["count"] - 1

    @classmethod
    def user_list(cls, room):
        room = cls.get_or_create_room(room)
        users = room["users"]
        return [
            dict(username=username, count=meta["count"])
            for username, meta in users.items()
            if meta["count"] > 0
        ]
"""


class ConsumerRegistry:

    _registry = dict()

    def __contains__(self, app: Union[str, "SubConsumer"]):
        if isinstance(app, str):
            return app in self._registry
        elif isinstance(app, SubConsumer):
            return app in self._registry.values()

        raise NotImplementedError

    def register(self, cls):
        assert cls.app_name is not None, "app name must be defined"
        assert cls.app_name not in registry, "app names must be unique"
        assert cls.channel_layer is None, "This is to be set by Consumer"
        assert cls.channel_name is None, "This is to be set by Consumer"
        self._registry[cls.app_name] = cls
        return cls

    def resolve(self, event: dict):
        # Routes an event based on its type to the appropriate Consumer

        split_type = event["type"].split(".")
        if len(split_type) < 2:
            return None

        namespace = split_type[0]

        for app_name, cls in self._registry.items():
            if namespace == app_name:
                return cls
        return None


registry = ConsumerRegistry()


class SubConsumer:
    # TODO: user metrics
    app_name = None
    channel_layer = None
    channel_name = None

    def __init__(self, channel_layer, channel_name, send):
        assert self.channel_layer is None, "This is to be set by Consumer"
        assert self.channel_name is None, "This is to be set by Consumer"
        self.channel_layer = channel_layer
        self.channel_name = channel_name
        self.send = send

    def _group_name(self, name: str):
        return f"{self.app_name}.{name}"

    async def send_json(self, data: dict):
        await self.send(text_data=json.dumps(data))

    async def group_join(self, group: str):
        await self.channel_layer.group_add(self._group_name(group), self.channel_name)

    async def group_leave(self, group: str):
        await self.channel_layer.group_discard(
            self._group_name(group), self.channel_name
        )

    async def group_send(self, group: str, data: dict):
        await self.channel_layer.group_send(self._group_name(group), data)

    async def receive(self, data):
        # Called when data received from websocket
        raise NotImplementedError

    async def handle(self, data):
        # Called when broadcast
        raise NotImplementedError


class Consumer(AsyncWebsocketConsumer):
    """
    Events:
        init
        user_connect
        user_disconnect
    """

    _sub_consumers: Dict[Type[SubConsumer], SubConsumer] = {}

    def __init__(self, *args, **kwargs):
        self._sub_consumers = dict(self._sub_consumers)
        super().__init__(*args, **kwargs)

    def subcons(self, event):
        # Returns the SubConsumer instance for an event
        cls = registry.resolve(event)

        if not cls:
            return None

        subcons = self._sub_consumers.get(cls, None)
        if not subcons:
            # create a new SubConsumer
            subcons = cls(self.channel_layer, self.channel_name, self.send)
            self._sub_consumers[cls] = subcons

        return subcons

    async def connect(self):
        # Occurs when a user connects to the websocket

        self.group_name = "global"
        self.path = self.scope["path"]

        with tracer.trace("ws.connect") as span:

            user = await channels.auth.get_user(self.scope)
            span.set_tag("user", user.username)

            log.info("user %r connected to global websocket", user)

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        with tracer.trace("ws.disconnect") as span:
            user = await channels.auth.get_user(self.scope)
            span.set_tag("user", user.username)

            for sub in self._sub_consumers.values():
                await sub.receive(user, dict(type=f"{sub.app_name}.disconnect"))

            # Leave room group
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data: str):
        with tracer.trace("ws.receive") as span:
            try:
                event = json.loads(text_data)
            except Exception:
                log.error("json decode failed for event %r", text_data, exc_info=True)
                return

            _type = event.get("type")
            if not _type:
                log.error("No type provided for event %r", text_data)
                return

            span.set_tag("type", _type)

            user = await channels.auth.get_user(self.scope)
            span.set_tag("user", user.username)

            consumer = self.subcons(event)

            if not consumer:
                log.error("No consumer found for event %r", text_data)
                return

            span.resource = consumer.app_name

            await consumer.receive(user, event)

    async def dispatch(self, event):
        with tracer.trace("ws.dispatch") as span:
            span.set_tag(SPAN_MEASURED_KEY)
            span.resource = event.get("type", span.resource)

            consumer = self.subcons(event)
            if not consumer:
                span._ignore_exception(channels.exceptions.StopConsumer)
                await super().dispatch(event)
                return

            span.set_tag("consumer.app_name", consumer.app_name)
            span.set_tag("consumer.channel_name", consumer.channel_name)

            with tracer.trace("get_user"):
                user = await channels.auth.get_user(self.scope)
            span.set_tag("user", str(user))

            with tracer.trace("ws.handle"):
                await consumer.handle(user, event)
