# Generated by Django 3.1.7 on 2021-03-14 20:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0008_chatlog'),
    ]

    operations = [
        migrations.DeleteModel(
            name='ChatLog',
        ),
    ]
