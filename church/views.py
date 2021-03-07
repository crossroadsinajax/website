from django import http, shortcuts
from django.core import exceptions
from django.urls import reverse

from church import forms, models
from prayer import models as pr_models
from utils import views as viewtils


def profile(request):
    if not request.user.is_authenticated:
        return http.HttpResponseRedirect(reverse("login"))
    return shortcuts.render(
        request, "profile.html", {"form": forms.UserEditForm(instance=request.user)}
    )


def prayer_requests_page(request):
    return shortcuts.render(request, "church/prayer_requests_page.html", {})


@viewtils.authenticated
def add_pr_to_next_service(request, pr_id):
    pr = pr_models.PrayerRequest.get_for_user(pr_id, request.user)

    # sp = models.ServicePage.next_service_page()
    sp = models.ServicePage.current_service_page()
    sp.prayer_requests.add(pr)
    return http.HttpResponseRedirect(request.META.get("HTTP_REFERER"))


@viewtils.authenticated
def rm_pr_from_service(request, pr_id, sp_id):
    pr = pr_models.PrayerRequest.get_for_user(pr_id, request.user)
    sp = models.ServicePage.objects.get(pk=sp_id)
    sp.prayer_requests.remove(pr)
    return http.HttpResponseRedirect(request.META.get("HTTP_REFERER"))


def edit_user(request):
    user = request.user

    if not user.is_authenticated:
        raise exceptions.PermissionDenied("")

    if request.method == "POST":
        form = forms.UserEditForm(request.POST)

        if form.is_valid():
            user.first_name = form.cleaned_data["first_name"]
            user.last_name = form.cleaned_data["last_name"]
            user.email = form.cleaned_data["email"]
            user.subscribe_daily_email = form.cleaned_data["subscribe_daily_email"]
            user.save()
            return http.HttpResponseRedirect(reverse("profile"))
        else:
            raise NotImplementedError("Form validation failures %s" % form.errors)
