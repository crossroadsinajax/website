import base64
import os

import yarl
from ddtrace import tracer
from django.contrib.staticfiles import finders
from postmark.core import PMMail

from church.models import DailyReadingPage, ServicePage, User


def _find_attachments(date: str):
    # Find attachments for the given date
    # They should be placed in the directory static/attachments/<YYYY><MM><DD>
    path = finders.find(f"attachments/{date}")

    if isinstance(path, list):
        raise NotImplementedError

    if not path:
        return []

    files = [
        os.path.join(path, f)
        for f in os.listdir(path)
        if os.path.isfile(os.path.join(path, f))
    ]
    return files


def send_service(users):
    service_page = ServicePage.current_service_page()
    guest_next_service_link = User.get_guest_next_service_link()

    attachments = []
    for f in service_page.email_attachments:
        with f.file as file:
            data = file.read()

        encoded_file = base64.b64encode(data).decode()
        attachments.append(encoded_file)

    for user in users:
        # Skip sending to users without emails
        if not user.email:
            continue

        with tracer.trace("email.send") as span:
            span.set_tag("user.username", user.username)
            span.set_tag("user.email", user.email)
            m = PMMail(
                to=f"{user.first_name} {user.last_name} <{user.email}>",
                sender="Lynn Jackson lynn@crossroadsajax.church",
                template_id="19602506",
                template_model=dict(
                    company_name="Crossroads Church",
                    company_address="520 Westney Rd S, Ajax, ON L1S 6W6",
                    first_name=user.first_name,
                    last_name=user.last_name,
                    date=service_page.date.strftime("%A %B %d, %Y"),
                    stream_link=user.get_next_service_link(),
                    guest_stream_link=guest_next_service_link,
                    services_link=user.get_services_link(),
                    foreword=service_page.description,  # Note that this is HTML
                ),
            )
            m.send()


def send_daily_reading(users):
    page = DailyReadingPage.objects.live().order_by("-date").first()
    guest = User.objects.get(username="guest")
    guest_link = yarl.URL(f"https://crossroadsajax.church{page.url}").with_query(
        dict(mem=guest.token)
    )

    for user in users:
        # Skip sending to users without emails
        if not user.email:
            continue

        link = yarl.URL(f"https://crossroadsajax.church{page.url}").with_query(
            dict(mem=user.token)
        )

        m = PMMail(
            to=f"{user.first_name} {user.last_name} <{user.email}>",
            sender="Abigail Jallim abby@crossroadsajax.church",
            template_id="22851084",
            template_model=dict(
                company_name="Crossroads Church",
                company_address="520 Westney Rd S, Ajax, ON L1S 6W6",
                first_name=user.first_name,
                title=page.title,
                date=page.date.strftime("%A %B %d, %Y"),
                page_link=str(link),
                guest_page_link=str(guest_link),
            ),
        )
        m.send()
