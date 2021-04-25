import logging

from channels.db import database_sync_to_async as dbstoa

from crossroads.consumers import SubConsumer, registry
from polls import models

log = logging.getLogger(__name__)


@registry.register
class PollConsumer(SubConsumer):

    app_name = "polls"

    async def receive(self, user, event):
        if not user.is_authenticated:
            return

        _type = event["type"]

        if _type == "polls.connect":
            self.poll_id = event["poll_id"]
            self.group_name = self.poll_id

            self.poll, _ = await dbstoa(models.Poll.objects.get_or_create)(
                poll_id=self.poll_id,
            )

            log.info("user %r connected to poll %r", user, self.poll_id)

            # Join room group
            await self.group_join(self.group_name)

            poll_json = await dbstoa(self.poll.__json__)()
            await self.send_json(
                {
                    "type": "polls.update",
                    **poll_json,
                }
            )

            responses = await dbstoa(models.PollResponse.objects.filter)(
                poll=self.poll, user=user
            )
            nresponses = await dbstoa(responses.count)()
            if nresponses > 0:
                await self.send_json(
                    {
                        "type": "polls.disable",
                    }
                )

        elif _type == "polls.toggle":
            # TODO: permissions
            self.poll.enabled = not self.poll.enabled
            await dbstoa(self.poll.save)()

            poll_json = await dbstoa(self.poll.__json__)()
            await self.group_send(
                self.group_name,
                dict(
                    type="polls.update",
                    **poll_json,
                ),
            )

        elif _type == "polls.toggleResults":
            self.poll.show_results = not self.poll.show_results
            await dbstoa(self.poll.save)()

            poll_json = await dbstoa(self.poll.__json__)()
            await self.group_send(
                self.group_name,
                dict(
                    type="polls.update",
                    **poll_json,
                ),
            )

        elif _type == "polls.submit":
            cpy = dict(event)
            del cpy["type"]
            await dbstoa(self.poll.add_response)(user, cpy)

            await self.send_json(
                {
                    "type": "polls.disable",
                }
            )

            poll_json = await dbstoa(self.poll.__json__)()
            await self.group_send(
                self.group_name,
                dict(
                    type="polls.update",
                    **poll_json,
                ),
            )

    async def handle(self, user, event):
        await self.send_json(event)
