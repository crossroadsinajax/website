from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core import exceptions
from django.conf import settings
from django.db import models
from django.dispatch import receiver


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
    STATE_ANSWERED = "ANS"
    STATE_CHOICES = [
        (STATE_ACTIVE, "Active"),
        (STATE_ANSWERED, "Answered"),
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    body_visibility = models.CharField(
        max_length=32, choices=BODY_VISIBILITY_CHOICES, default=""
    )
    author = models.ForeignKey(settings.AUTH_USER_MODEL, models.CASCADE)
    provided_name = models.CharField(max_length=64, default="")
    body = models.CharField(max_length=16384)
    note = models.CharField(
        max_length=16384, default=""
    )  # additional comments or resolution of the prayer
    state = models.CharField(max_length=3, choices=STATE_CHOICES, default=STATE_ACTIVE)

    @classmethod
    def for_user(cls, user):
        prayer_requests = cls.objects.filter(author=user)
        return prayer_requests

    @classmethod
    def crossroads_requests_for_user(cls, user):
        groups = [g.name for g in user.groups.all()]
        prayer_requests = cls.objects.filter(
            models.Q(body_visibility__in=groups) | models.Q(author=user)
        )
        return prayer_requests

    def react_count(self, emoji):
        return len(PrayerRequestReact.objects.filter(type=emoji, item=self))

    @property
    def prayer_react_count(self):
        return len(PrayerRequestReact.objects.filter(type="🙏", item=self))

    @property
    def praise_react_count(self):
        return len(PrayerRequestReact.objects.filter(type="🙌", item=self))

    @classmethod
    def get_for_user(cls, pr_id, user):
        # Only returns the PR for pr_id if user owns it
        # else raises permission denied
        pr = cls.objects.get(pk=pr_id)
        if pr.author != user:
            raise exceptions.PermissionDenied("")
        return pr


@receiver(models.signals.post_save, sender=PrayerRequest)
def service_page_post_save(sender, instance, *args, **kwargs):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        "prayer",
        {
            "type": "prayer.update",
        },
    )
