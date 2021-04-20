import logging

from crossroads.consumers import SubConsumer, registry


log = logging.getLogger(__name__)


@registry.register
class ServiceConsumer(SubConsumer):

    app_name = "service"

    async def receive(self, user, event):
        _type = event["type"]

        if _type == "service.connect":
            self.group_name = str(event["id"])
            await self.group_join(self.group_name)
            log.info("%r joined service %r", user, self.group_name)
        elif _type == "service.disconnect":
            await self.group_leave(self.group_name)
        else:
            log.error("")

    async def handle(self, user, event):
        await self.send_json(event)


@registry.register
class PrayerConsumer(SubConsumer):

    app_name = "prayer"

    async def receive(self, user, event):
        _type = event["type"]

        if _type == "prayer.connect":
            self.group_name = "prayer"
            await self.group_join(self.group_name)
            log.info("%r joined prayer %r", user, self.group_name)
        elif _type == "prayer.disconnect":
            await self.group_leave(self.group_name)
        else:
            raise NotImplementedError

    async def handle(self, user, event):
        await self.send_json(event)
