from django.db import migrations

def create_site(apps, schema_editor):
    Site = apps.get_model("sites", "Site")
    # Update or create the site with Render domain
    Site.objects.update_or_create(
        id=1,
        defaults={
            "domain": "macu-platform.onrender.com",
            "name": "Macu Platform"
        }
    )

class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_customuser_address_customuser_is_verified_and_more"),
        ("sites", "0002_alter_domain_unique"),  # ensure the Sites app migration is applied
    ]

    operations = [
        migrations.RunPython(create_site),
    ]