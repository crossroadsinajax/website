# Generated by Django 3.0.3 on 2020-03-06 05:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prayer', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='prayerrequest',
            name='note',
            field=models.CharField(default='', max_length=16384),
        ),
    ]
