from django import http

from prayer import models
from utils import views as viewtils


@viewtils.authenticated
def delete_prayer_request(request, pr_id):
    pr = models.PrayerRequest.get_for_authed_user(pr_id, request.user)
    pr.delete()
    return http.HttpResponseRedirect(
        request.META.get("HTTP_REFERER") + "#prayer-requests"
    )


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


@viewtils.authenticated
def prayer_request_mv_to_jar(request, pr_id):
    pr = models.PrayerRequest.get_for_user(pr_id, request.user)
    pr.state = models.PrayerRequest.STATE_ANSWERED
    pr.save()
    return http.HttpResponseRedirect(request.META.get("HTTP_REFERER"))


@viewtils.authenticated
def prayer_request_rm_from_jar(request, pr_id):
    pr = models.PrayerRequest.get_for_user(pr_id, request.user)
    pr.state = models.PrayerRequest.STATE_ACTIVE
    pr.save()
    return http.HttpResponseRedirect(request.META.get("HTTP_REFERER"))
