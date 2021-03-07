import json

from django.conf import settings
from django.db import models
from django.utils.functional import cached_property


class PollResponse(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    poll = models.ForeignKey("Poll", related_name="responses", on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="poll_responses",
        on_delete=models.CASCADE,
    )
    response = models.CharField(max_length=16384)

    @cached_property
    def __json__(self):
        return json.loads(self.response)


class Poll(models.Model):
    poll_id = models.CharField(max_length=1024)
    enabled = models.BooleanField(default=False)
    show_results = models.BooleanField(default=False)

    def add_response(self, user, response):
        resp = PollResponse.objects.create(
            poll=self, user=user, response=json.dumps(response)
        )
        return resp

    def __json__(self):
        return dict(
            enabled=self.enabled,
            show_results=self.show_results,
            responses=[r.__json__ for r in self.responses.all()],
        )
