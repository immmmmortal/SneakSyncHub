# Generated by Django 5.0.1 on 2024-09-11 14:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0005_shoe_description_shoe_details_shoe_features"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="shoe",
            name="details",
        ),
        migrations.RemoveField(
            model_name="shoe",
            name="features",
        ),
        migrations.AddField(
            model_name="shoe",
            name="benefits",
            field=models.JSONField(default=""),
            preserve_default=False,
        ),
    ]
