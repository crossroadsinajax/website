from typing import TYPE_CHECKING

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core import exceptions
from django.conf import settings
from django.db import models
from django.db.models import QuerySet
from django.dispatch import receiver

if TYPE_CHECKING:
    from church.models import User


class PrayerRequestReact(models.Model):
    item = models.ForeignKey(
        "PrayerRequest", related_name="reacts", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="pr_reacts", on_delete=models.CASCADE
    )
    type = models.CharField(max_length=16)


class PrayerRequest(models.Model):
    BODY_VISIBILITY_CHOICES = [
        ("", "Only you"),
        ("member", "Only Crossroads members"),
        ("prayer_team", "Only Crossroads prayer team members"),
    ]
    STATE_ACTIVE = "ACT"
    STATE_INACTIVE = "INA"
    STATE_RESOLVED = "RES"
    STATE_CHOICES = [
        (STATE_ACTIVE, "Active"),
        (STATE_INACTIVE, "Inactive"),
        (STATE_RESOLVED, "Resolved"),
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    body_visibility = models.CharField(
        max_length=32, choices=BODY_VISIBILITY_CHOICES, default=""
    )
    author = models.ForeignKey(settings.AUTH_USER_MODEL, models.CASCADE)
    include_name = models.BooleanField(default=True)
    email = models.EmailField(blank=True, max_length=254)
    provided_name = models.CharField(max_length=64, default="")
    body = models.CharField(max_length=16384)
    note = models.CharField(
        max_length=16384, default=""
    )  # additional comments or resolution of the prayer
    state = models.CharField(max_length=3, choices=STATE_CHOICES, default=STATE_ACTIVE)

    @classmethod
    def for_user(cls, user: "User") -> QuerySet:
        prayer_requests = cls.objects.filter(author=user)
        return prayer_requests

    @classmethod
    def crossroads_requests_for_user(cls, user: "User") -> QuerySet:
        groups = [g.name for g in user.groups.all()]
        prayer_requests = cls.objects.filter(
            models.Q(body_visibility__in=groups) | models.Q(author=user)
        )
        return prayer_requests

    @classmethod
    def get_for_user(cls, pk: int, user: "User") -> "PrayerRequest":
        pr = cls.objects.get(pk=pk)
        if pr.author != user:
            raise exceptions.PermissionDenied("")
        return pr

    @property
    def prayer_react_count(self) -> int:
        return len(PrayerRequestReact.objects.filter(type="🙏", item=self))

    @property
    def praise_react_count(self) -> int:
        return len(PrayerRequestReact.objects.filter(type="🙌", item=self))

    def safe_delete(self, user: "User") -> None:
        # TODO: does allow other users (eg prayer team) to delete requests
        if self.author is user or user.has_perm("prayer.delete_prayerrequest"):
            self.delete()
        else:
            raise PermissionError

    def safe_resolve(self, user: "User") -> None:
        if self.author is user or user.has_perm("prayer.change_prayerrequest"):
            self.state = self.STATE_RESOLVED
            self.save()
        else:
            raise PermissionError

    def safe_activate(self, user: "User") -> None:
        if self.author is user or user.has_perm("prayer.change_prayerrequest"):
            self.state = self.STATE_ACTIVE
            self.save()
        else:
            raise PermissionError

    def react(self, user: "User", react: str) -> None:
        assert user.is_authenticated
        existing_reacts = PrayerRequestReact.objects.filter(
            item=self, type=react, user=user
        )
        if len(existing_reacts):
            for r in existing_reacts:
                r.delete()
            return
        PrayerRequestReact.objects.create(item=self, type=react, user=user)

    def react_count(self, emoji: str):
        return len(PrayerRequestReact.objects.filter(type=emoji, item=self))


@receiver(models.signals.post_delete, sender=PrayerRequest)
@receiver(models.signals.post_save, sender=PrayerRequest)
@receiver(models.signals.post_save, sender=PrayerRequestReact)
@receiver(models.signals.post_delete, sender=PrayerRequestReact)
def prayer_update(sender, instance, *args, **kwargs):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        "prayer.prayer",
        {
            "type": "prayer.update",
        },
    )
