from django.core.management.base import BaseCommand

from core.seed.engine import SeedEngine


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        print("🚀 Starting full seed process...")
        SeedEngine().run()