# Generated by Django 3.0.3 on 2020-02-28 19:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='thread_id',
            field=models.CharField(default=None, max_length=128),
            preserve_default=False,
        ),
    ]
