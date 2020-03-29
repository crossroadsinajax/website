# Generated by Django 3.0.4 on 2020-03-28 22:25

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('prayer', '0002_prayerrequest_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prayerrequestreact',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pr_reacts', to=settings.AUTH_USER_MODEL),
        ),
    ]