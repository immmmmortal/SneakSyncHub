# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver

# Import from the notifications module to avoid circular import
from core.telegram_bot.notifications import notify_user
from members.models import ShoeNotificationPreference
from core.models import Shoe


@receiver(post_save, sender=Shoe)
def check_price_and_notify(sender, instance, **kwargs):
    if "update_fields" in kwargs and (
        "price" in kwargs["update_fields"] or "sale_price" in kwargs["update_fields"]
    ):
        preferences = ShoeNotificationPreference.objects.filter(shoe=instance)

        for preference in preferences:
            if "sale_price" in kwargs["update_fields"] and instance.sale_price:
                if instance.sale_price <= preference.desired_price:
                    notify_user(preference.user, instance)

            if "price" in kwargs["update_fields"]:
                if instance.price <= preference.desired_price:
                    notify_user(preference.user, instance)
