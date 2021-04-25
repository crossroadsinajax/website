from django import template
from django.core import exceptions

from prayer import forms, models

register = template.Library()


@register.inclusion_tag("prayer_requests.html", takes_context=True)
def user_prayer_requests(context, req_user):
    user = context.request.user
    if not user.is_authenticated or user != req_user:
        raise exceptions.PermissionDenied("")
    context["prayer_requests"] = models.PrayerRequest.for_user(user)
    return context


@register.inclusion_tag("prayer_requests.html", takes_context=True)
def prayer_requests(context, prayer_requests=None, service_page=None):
    user = context.request.user

    if not user.is_authenticated:
        raise exceptions.PermissionDenied("")

    if prayer_requests is None:
        prayer_requests = models.PrayerRequest.crossroads_requests_for_user(
            user
        ).filter(state=models.PrayerRequest.STATE_ACTIVE)

    context["prayer_requests"] = prayer_requests
    context["service_page"] = service_page
    return context


@register.inclusion_tag("prayer_requests.html", takes_context=True)
def answered_prayer_requests(context):
    user = context.request.user

    if not user.is_authenticated:
        raise exceptions.PermissionDenied("")

    context["prayer_requests"] = models.PrayerRequest.crossroads_requests_for_user(
        user
    ).filter(state=models.PrayerRequest.STATE_ANSWERED)
    return context


@register.inclusion_tag("prayer_form.html")
def prayer_request_form():
    return {"form": forms.PrayerRequestForm()}


@register.inclusion_tag("prayer_form.html")
def public_prayer_request_form():
    return {"form": forms.PrayerRequestForm()}
