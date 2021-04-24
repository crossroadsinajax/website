from django import http

from prayer import models
from utils import views as viewtils


@viewtils.authenticated
def prayer_request_react(request, pr_id, emoji):
    pr = models.PrayerRequest.objects.get(pk=pr_id)
    existing_reacts = models.PrayerRequestReact.objects.filter(
        item=pr, type=emoji, user=request.user
    )
    if len(existing_reacts):
        for r in existing_reacts:
            r.delete()
        return http.HttpResponseRedirect(
            request.META.get("HTTP_REFERER") + "#prayer-requests"
        )
    models.PrayerRequestReact.objects.create(item=pr, type=emoji, user=request.user)
    return http.HttpResponseRedirect(
        request.META.get("HTTP_REFERER") + "#prayer-requests"
    )
