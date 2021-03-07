from django import forms

from wagtail.users import forms as wtforms

from . import models


class UserEditForm(forms.ModelForm):
    class Meta:
        model = models.User
        fields = [
            "first_name",
            "last_name",
            "email",
            "subscribe_daily_email",
        ]

    first_name = forms.CharField(label="First name", max_length=48, required=True)
    first_name.widget.attrs.update(
        {
            "rows": 1,
            "placeholder": "First name",
        }
    )
    last_name = forms.CharField(label="Last name", max_length=48, required=True)
    last_name.widget.attrs.update(
        {
            "rows": 1,
            "placeholder": "Last name",
        }
    )
    email = forms.EmailField(label="Email", max_length=100, required=True)
    email.widget.attrs.update(
        {
            "rows": 1,
            "placeholder": "Email",
        }
    )
    subscribe_daily_email = forms.BooleanField(
        label="Subscribe to daily email", required=False
    )


class CustomUserCreationForm(wtforms.UserCreationForm):
    pass
