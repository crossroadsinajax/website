import logging

from channels.db import database_sync_to_async as sync2async

from crossroads.consumers import SubConsumer, registry
from prayer.models import PrayerRequest


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
        elif _type == "prayer.resolve":
            pk = int(event["id"])
            pr = await sync2async(PrayerRequest.objects.get)(pk=pk)
            try:
                await sync2async(pr.safe_resolve)(user)
            except PermissionError:
                log.warning("unauthenticated user attempted to resolve prayer request")
            else:
                log.info("user %r resolved prayer request %r", user, pk)
        elif _type == "prayer.activate":
            pk = int(event["id"])
            pr = await sync2async(PrayerRequest.objects.get)(pk=pk)
            try:
                await sync2async(pr.safe_activate)(user)
            except PermissionError:
                log.warning("unauthenticated user attempted to activate prayer request")
            else:
                log.info("user %r resolved prayer request %r", user, pk)
        elif _type == "prayer.delete":
            pk = int(event["id"])
            pr = await sync2async(PrayerRequest.objects.get)(pk=pk)
            try:
                await sync2async(pr.safe_delete)(user)
            except PermissionError:
                log.warning("unauthenticated user attempted to delete prayer request")
            else:
                log.info("user %r deleted prayer request %r", user, pk)
        elif _type == "prayer.disconnect":
            await self.group_leave(self.group_name)
        else:
            raise NotImplementedError("event type %r not handled" % _type)

    async def handle(self, user, event):
        await self.send_json(event)
