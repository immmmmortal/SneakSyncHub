from django.conf import settings
# core/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from core.models import Shoe
from core.tasks import update_price_history
from .models import CustomUser, UserProfile


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


@receiver(post_save, sender=Shoe)
def update_scraped_articles_history(sender, instance, **kwargs):
    user_profiles = UserProfile.objects.all()
    for profile in user_profiles:
        profile.add_to_history(instance.article)


@receiver(post_save, sender=Shoe)
def create_shoe_price_history(sender, instance, created, **kwargs):
    if created:
        # Call the Celery task to update the price history
        update_price_history.delay()
