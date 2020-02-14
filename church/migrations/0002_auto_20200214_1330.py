# Generated by Django 3.0.2 on 2020-02-14 13:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('church', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='servicepagebulletinitem',
            old_name='contact',
            new_name='contact_email',
        ),
        migrations.AddField(
            model_name='servicepagebulletinitem',
            name='contact_phone',
            field=models.CharField(default='', max_length=20),
            preserve_default=False,
        ),
    ]
