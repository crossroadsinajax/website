# Generated by Django 3.0.4 on 2020-03-28 03:57

from django.db import migrations, models
import secrets


def get_token():
    return secrets.token_hex(8)

class Migration(migrations.Migration):

    dependencies = [
        ('church', '0009_auto_20200321_1531'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='token',
            field=models.CharField(default=get_token, max_length=32),
            preserve_default=False,
        ),
    ]
