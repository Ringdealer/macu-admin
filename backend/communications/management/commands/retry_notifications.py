from django.core.management.base import BaseCommand

from communications.services import retry_pending_notifications


class Command(BaseCommand):
    help = "Retry failed/pending notifications automatically"

    def handle(self, *args, **options):
        self.stdout.write("Running notification retry job...")
        retry_pending_notifications()
        self.stdout.write("Done.")