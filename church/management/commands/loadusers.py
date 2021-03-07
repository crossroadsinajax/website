import argparse
import json
import secrets

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Load users [(name, email)] from a json file"

    def add_arguments(self, parser):
        parser.add_argument("file", type=argparse.FileType("r"))

    def handle(self, *args, **options):
        f = options["file"]

        from church.models import User

        nusers = 0
        with f:
            data = json.load(f)
            for username, firstname, lastname, email in data:
                token = secrets.token_hex(8)
                nusers += 1
                try:
                    User.objects.get(email=email)
                except User.DoesNotExist:
                    User.objects.create(
                        username=username,
                        first_name=firstname,
                        last_name=lastname,
                        email=email,
                        token=token,
                    )

        self.stdout.write(self.style.SUCCESS(f"Successfully created {nusers} users"))
