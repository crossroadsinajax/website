from django import http, shortcuts
from django.core import exceptions

from prayer import forms, models
from utils import views as viewtils


@viewtils.authenticated
def delete_prayer_request(request, pr_id):
    pr = models.PrayerRequest.get_for_authed_user(pr_id, request.user)
    pr.delete()
    return http.HttpResponseRedirect(
        request.META.get("HTTP_REFERER") + "#prayer-requests"
    )


def submit_prayer_form(request, pr_id=None):
    if not request.user.is_authenticated:
        # TODO: handle anonymous requests
        raise exceptions.PermissionDenied("")

    if request.method == "POST":
        form = forms.PrayerRequestForm(request.POST)

        if form.is_valid():
            if pr_id:
                pr = models.PrayerRequest.objects.filter(pk=pr_id).update(
                    body_visibility=form.cleaned_data["body_visibility"],
                    body=form.cleaned_data["body"],
                    provided_name=form.cleaned_data["provided_name"],
                    note=form.cleaned_data["note"],
                )
                redirect = request.META.get("redirect", request.POST.get("next", "/"))
                return http.HttpResponseRedirect(redirect)
            else:
                models.PrayerRequest.objects.create(
                    author=request.user,
                    body_visibility=form.cleaned_data["body_visibility"],
                    body=form.cleaned_data["body"],
                    provided_name=form.cleaned_data["provided_name"],
                    note=form.cleaned_data["note"],
                )
                return http.HttpResponseRedirect(
                    request.META.get("HTTP_REFERER") + "#prayer-requests"
                )
        else:
            raise NotImplementedError("Form validation failures")
    else:
        if pr_id:
            # Edit form
            pr = models.PrayerRequest.objects.get(id=pr_id)
            form = forms.PrayerRequestForm(instance=pr)
        else:
            # New form
            pr = None
            form = forms.PrayerRequestForm()

        return shortcuts.render(
            request,
            "prayer_form.html",
            {
                "form": form,
                "pr": pr,
                "pr_id": pr_id,
                "redirect": request.GET.get("redirect", "/"),
            },
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
