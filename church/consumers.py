import logging

from crossroads.consumers import SubConsumer, registry


log = logging.getLogger(__name__)


@registry.register
class SlidesConsumer(SubConsumer):

    app_name = "slides"

    advance_requested = False

    async def receive(self, user, event):
        _type = event["type"]

        if _type == "slides.connect":
            await self.group_join("slides")
            await self.group_send(
                "slides", {"type": "slides.update", "requested": self.advance_requested}
            )
        elif _type == "slides.advance":
            self.advance_requested = True
            await self.group_send(
                "slides", {"type": "slides.update", "requested": self.advance_requested}
            )
        elif _type == "slides.reset":
            self.advance_requested = False
            await self.group_send(
                "slides", {"type": "slides.update", "requested": self.advance_requested}
            )
        elif _type == "slides.disconnect":
            await self.group_leave("slides")
            await self.group_send(
                "slides", {"type": "slides.update", "requested": self.advance_requested}
            )
        else:
            log.error("")

    async def handle(self, user, event):
        await self.send_json(event)
