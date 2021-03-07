from django import forms

from prayer import models


class PrayerRequestForm(forms.ModelForm):
    class Meta:
        model = models.PrayerRequest
        fields = [
            "body_visibility",
            "provided_name",
            "body",
            "note",
        ]

    VISIBILITY_CHOICES = [
        ("", "Only you"),
        ("member", "Only Crossroads members"),
        ("prayer_team", "Only Crossroads prayer team members"),
    ]
    body = forms.CharField(
        label="Prayer request",
        max_length=8192,
        widget=forms.Textarea(
            attrs={
                "rows": 3,
                "placeholder": "Your prayer request or praise report",
            }
        ),
    )
    note = forms.CharField(
        label="Prayer note",
        required=False,
        max_length=8192,
        widget=forms.Textarea(
            attrs={
                "rows": 3,
                "placeholder": "Any follow-up information about the prayer request",
            }
        ),
    )
    body_visibility = forms.ChoiceField(
        choices=VISIBILITY_CHOICES,
        label="Who can see your submission",
        initial="member",
    )
    provided_name = forms.CharField(label="Name", max_length=48, required=False)
    provided_name.widget.attrs.update(
        {
            "rows": 1,
            "placeholder": "Name (optional)",
        }
    )
