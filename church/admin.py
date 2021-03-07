from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserCreationForm
from .models import User

from . import email


def bulletin_email(modeladmin, request, queryset):
    try:
        email.send_bulletin(queryset)
    except Exception as e:
        print(e)
        messages.error(request, f"Error: {e}")
    else:
        messages.success(request, f"{len(queryset)} email(s) sent successfully!")


def service_email(modeladmin, request, queryset):
    try:
        email.send_service(queryset)
    except Exception as e:
        print(e)
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
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Authentication",
            dict(
                fields=("token",),
            ),
        ),
    )
    actions = [bulletin_email, service_email]


admin.site.register(User, UserAdmin)
