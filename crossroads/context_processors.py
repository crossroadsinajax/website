import json

from django.conf import settings


def settings_processor(request):
    return dict(
        settings=json.dumps(
            dict(
                PROD=not settings.DEBUG,
            )
        ),
        RUM_APP_ID=settings.RUM_APP_ID,
        RUM_CLIENT_TOKEN=settings.RUM_CLIENT_TOKEN,
        RUM_ENV=settings.RUM_ENV,
        RUM_SERVICE=settings.RUM_SERVICE,
        RUM_VERSION=settings.RUM_VERSION,
        version=settings.VERSION,
    )
