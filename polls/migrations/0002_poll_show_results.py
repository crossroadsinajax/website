# Generated by Django 3.0.4 on 2020-05-10 08:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='poll',
            name='show_results',
            field=models.BooleanField(default=False),
        ),
    ]