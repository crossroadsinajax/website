import json
from django.conf import settings


def settings_processor(request):
    return dict(
        settings=json.dumps(
            dict(
                DEBUG=settings.DEBUG,
            )
        ),
        version=settings.VERSION,
    )
