import json

from django.conf import settings

from crossroads.dd import ddconfig


def settings_processor(request):
    return dict(
        settings=json.dumps(
            dict(
                PROD=not settings.DEBUG,
            )
        ),
        RUM_APP_ID=settings.RUM_APP_ID,
        RUM_CLIENT_TOKEN=settings.RUM_CLIENT_TOKEN,
        RUM_ENV=ddconfig.env,
        RUM_SERVICE=ddconfig.service,
        RUM_VERSION=ddconfig.version,
        version=ddconfig.version,
    )
