import logging
from collections import defaultdict
from typing import DefaultDict, TypedDict

from channels.db import database_sync_to_async as dbstoa
from ddtrace import tracer
from django.core import exceptions as exc

from chat import models
from crossroads.consumers import SubConsumer, registry

log = logging.getLogger(__name__)


class ChatManager:
    # maintain real-time stats about a chatroom

    class UserStats(TypedDict):
        count: int

    class Room(TypedDict):
        users: DefaultDict[str, "ChatManager.UserStats"]

    rooms: DefaultDict[str, Room] = defaultdict(
        lambda: {"users": defaultdict(lambda: {"count": 0})}
    )

    @classmethod
    def register(cls, room, user):
        room = cls.rooms[room]
        room["users"][user.username]["count"] += 1

    @classmethod
    def deregister(cls, room, user):
        room = cls.rooms[room]
        count = room["users"][user.username]["count"]
        if count > 0:
            room["users"][user.username]["count"] = count - 1

    @classmethod
    def user_list(cls, room):
        users = cls.rooms[room]["users"]
        return [
            dict(username=username, count=meta["count"])
            for username, meta in users.items()
            if meta["count"] > 0
        ]


@registry.register
class ChatConsumer(SubConsumer):

    app_name = "chat"

    @tracer.wrap()
    async def receive(self, user, event):
        if not user.is_authenticated:
            return

        span = tracer.current_span()

        _type = event["type"]
        span.resource = _type

        if _type == "chat.connect":
            self.chat_id = event["chat_id"]
            self.group_name = self.chat_id

            self.chat, _ = await dbstoa(models.Chat.objects.get_or_create)(
                chat_id=self.chat_id,
            )

            log.info("user %r connected to chat %r", user, self.chat_id)

            # Join room group
            await self.group_join(self.group_name)

            chat_json = await dbstoa(self.chat.__json__)()

            # Send initial chat data
            await self.send_json(
                {
                    "type": "chat.init",
                    "chat": chat_json,
                }
            )

            # Send update message
            ChatManager.register(self.chat_id, user)
            await self.group_send(
                self.group_name,
                {
                    "type": "chat.users_update",
                    "users": ChatManager.user_list(self.chat_id),
                },
            )

        # New chat message
        elif _type == "chat.message":
            body = event["body"]

            # Save the message
            try:
                msg = await dbstoa(self.chat.add_message)(body=body, user=user)
            except exc.PermissionDenied:
                log.warning("", exc_info=True)
            else:
                # Send message to room group
                msg_json = await dbstoa(msg.__json__)()
                await self.group_send(
                    self.group_name, {"type": "chat.message", "msg": msg_json}
                )

        # Delete chat message
        elif _type == "chat.message_delete":
            msg_id = event["msg_id"]

            try:
                await dbstoa(self.chat.delete_message)(user=user, msg_id=msg_id)
            except exc.PermissionDenied:
                log.warning(
                    "user %r tried to delete message %r", user, msg_id, exc_info=True
                )
            else:
                await self.group_send(
                    self.group_name, {"type": "chat.message_delete", "msg_id": msg_id}
                )

        elif _type == "chat.message_clear_all":
            msg_id = event["msg_id"]

            def clear_all():
                if not user.is_chatmod:
                    log.warning("%r tried to clear all messages", user)
                    return

                msg = models.ChatMessage.objects.get(pk=msg_id)
                msgs = models.ChatMessage.objects.filter(author=msg.author)
                return [m.id for m in msgs]

            msgs = await dbstoa(clear_all)()
            for mid in msgs:
                await self.group_send(
                    self.group_name, {"type": "chat.message_delete", "msg_id": mid}
                )

        # React to a chat message
        elif _type == "chat.react":
            msg_id = event["msg_id"]
            react = event["react"]
            span.set_tag("react", react)
            # Forward the react message to the rest of the clients
            msg = await dbstoa(models.ChatMessage.react)(user, msg_id, react)
            msg_json = await dbstoa(msg.__json__)()

            await self.group_send(
                self.group_name,
                dict(
                    type="chat.message_update",
                    msg=msg_json,
                ),
            )

        elif _type == "chat.toggle_tag":
            if not await dbstoa(user.has_perm)("chat.change_chatmessage"):
                log.warning("user %r tried to toggle pr without permissions", user)
                return

            msg_id = event["msg_id"]
            tag = f"#{event['tag']}"
            msg = await dbstoa(models.ChatMessage.toggle_tag)(tag, msg_id)
            msg_json = await dbstoa(msg.__json__)()
            await self.group_send(
                self.group_name,
                dict(
                    type="chat.message_update",
                    msg=msg_json,
                ),
            )

        # User disconnect
        elif _type == "chat.disconnect":
            ChatManager.deregister(self.chat_id, user)
            await self.group_leave(self.group_name)

            # Update room with user count
            await self.group_send(
                self.group_name,
                {
                    "type": "chat.users_update",
                    "users": ChatManager.user_list(self.chat_id),
                },
            )

    async def handle(self, user, event):
        span = tracer.current_span()
        span.set_tag("user", user)
        span.set_tag("type", event.get("type", None))
        await self.send_json(event)
