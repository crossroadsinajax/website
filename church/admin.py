import logging

from ddtrace import tracer
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserCreationForm

from . import email
from .models import User

log = logging.getLogger(__name__)


def daily_reading_email(modeladmin, request, queryset):
    try:
        email.send_daily_reading(queryset)
    except Exception as e:
        messages.error(request, f"Error: {e}")
    else:
        messages.success(request, f"{len(queryset)} email(s) sent successfully!")


def bulletin_email(modeladmin, request, queryset):
    try:
        email.send_bulletin(queryset)
    except Exception as e:
        messages.error(request, f"Error: {e}")
    else:
        messages.success(request, f"{len(queryset)} email(s) sent successfully!")


def service_email(modeladmin, request, queryset):
    with tracer.trace("email"):
        try:
            email.send_service(queryset)
        except Exception as e:
            log.exception("error sending service email")
            messages.error(request, f"Error: {e}")
        else:
            messages.success(request, f"{len(queryset)} email(s) sent successfully!")


class UserCreateForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
        )


class UserAdmin(DjangoUserAdmin):
    add_form = UserCreateForm
    fieldsets = DjangoUserAdmin.fieldsets + (  # type: ignore
        (
            "Authentication",
            dict(
                fields=("token",),
            ),
        ),
    )
    actions = [bulletin_email, service_email, daily_reading_email]


admin.site.register(User, UserAdmin)
