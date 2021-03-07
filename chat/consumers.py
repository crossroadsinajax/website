import logging

from channels.db import database_sync_to_async as dbstoa
from ddtrace import tracer
from django.core import exceptions as exc

from chat import models
from crossroads.consumers import SubConsumer, registry


log = logging.getLogger(__name__)


class ChatManager:
    # TODO move this to SubConsumer
    # maintain real-time stats about a chatroom

    rooms = dict()

    @classmethod
    def get_or_create_room(cls, room):
        if room not in cls.rooms:
            cls.rooms[room] = dict(
                users=dict(),
            )
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


@registry.register
class ChatConsumer(SubConsumer):

    app_name = "chat"

    async def receive(self, user, event):
        if not user.is_authenticated:
            return

        span = tracer.current_span()

        _type = event["type"]

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
            await self.log("user_connect", user=user)

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
                    self.group_name, {"type": "chat.message", **msg_json}
                )

        # Delete chat message
        elif _type == "chat.message_delete":
            msg_id = event["msg_id"]

            try:
                await dbstoa(self.chat.delete_message)(user=user, msg_id=msg_id)
            except exc.PermissionDenied:
                log.warning("", exc_info=True)
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
                    msg_id=msg_id,
                    **msg_json,
                ),
            )

        # Toggle a prayer request
        elif _type == "chat.toggle_pr":
            if not await dbstoa(user.has_perm)("chat.change_chatmessage"):
                log.info("user %r tried to toggle pr without permissions", user)
                return

            msg_id = event["msg_id"]
            tag = event["tag"]
            if tag == "pr":
                msg = await dbstoa(models.ChatMessage.toggle_tag)("#pr", msg_id)
            elif tag == "q":
                msg = await dbstoa(models.ChatMessage.toggle_tag)("#q", msg_id)
            else:
                log.error("user %r tried to toggle pr without permissions", user)
                return

            msg_json = await dbstoa(msg.__json__)()
            await self.group_send(
                self.group_name,
                dict(
                    type="chat.message_update",
                    msg_id=msg_id,
                    **msg_json,
                ),
            )

        # User disconnect
        elif _type == "chat.disconnect":
            ChatManager.deregister(self.chat_id, user)
            await self.log("user_disconnect", user=user)
            await self.group_leave(self.group_name)

            # Update room with user count
            await self.group_send(
                self.group_name,
                {
                    "type": "chat.users_update",
                    "users": ChatManager.user_list(self.chat_id),
                },
            )

    async def log(self, type, user=None, body=""):
        await dbstoa(self.chat.add_log)(
            type=type,
            body=body,
            user=user,
        )

        # Send log to room group
        # log_json = await database_sync_to_async(log.__json__)()
        # await self.channel_layer.group_send(
        #     self.chat_group_name, {"type": "log", **log_json}
        # )

    async def handle(self, user, event):
        await self.send_json(event)
