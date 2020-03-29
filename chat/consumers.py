import json
import logging

from asgiref.sync import async_to_sync
import channels
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from chat import models


log = logging.getLogger(__name__)

count = 0


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = await channels.auth.get_user(self.scope)
        if not user.is_authenticated:
            return

        global count
        count = count + 1

        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = f"chat_{self.chat_id}"

        self.chat, _ = await database_sync_to_async(models.Chat.objects.get_or_create)(
            chat_id=self.chat_id
        )

        log.info("user %r connected to chat %r", user, self.chat_id)

        # Join room group
        await self.channel_layer.group_add(self.chat_group_name, self.channel_name)

        await self.accept()

        json_msgs = await database_sync_to_async(self.chat.messages_json)()

        # Send initial chat data
        await self.send(text_data=json.dumps({"type": "chat_init", "msgs": json_msgs,}))

        # Send message to room group
        await self.channel_layer.group_send(
            self.chat_group_name, {"type": "count_update", "count": count,}
        )

    async def disconnect(self, close_code):
        user = await channels.auth.get_user(self.scope)
        if not user.is_authenticated:
            return

        global count
        count = count - 1

        # Leave room group
        await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

        await self.channel_layer.group_send(
            self.chat_group_name, {"type": "count_update", "count": count,}
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        user = await channels.auth.get_user(self.scope)

        if text_data_json["type"] == "chat_message":
            body = text_data_json["body"]

            # Save the message
            msg = await database_sync_to_async(self.chat.add_message)(
                body=body, author=user
            )

            # Send message to room group
            msg_json = await database_sync_to_async(msg.__json__)()
            await self.channel_layer.group_send(
                self.chat_group_name, {"type": "chat_message", **msg_json}
            )
        elif text_data_json["type"] == "chat_react":
            msg_id = text_data_json["msg_id"]
            react = text_data_json["react"]
            # Forward the react message to the rest of the clients
            msg = await database_sync_to_async(models.ChatMessage.react)(user, msg_id, react)
            msg_json = await database_sync_to_async(msg.__json__)()

            await self.channel_layer.group_send(self.chat_group_name, dict(
                type="chat_message_update",
                msg_id=msg_id,
                **msg_json,
            ))

        elif text_data_json["type"] == "chat_edit":
            pass

    # Receive message from room group
    async def chat_message_update(self, event):
        # Forward message to WebSocket
        await self.send(text_data=json.dumps(event))

    # Receive message from room group
    async def chat_message(self, event):
        # Forward message to WebSocket
        await self.send(text_data=json.dumps(event))

    async def count_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_connect(self, event):
        await self.send(text_data=json.dumps(event))