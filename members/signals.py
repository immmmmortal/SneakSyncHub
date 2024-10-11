from django.conf import settings
from django.db.models.signals import m2m_changed
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from .models import CustomUser
from .models import UserProfile, Shoe


@receiver(m2m_changed, sender=UserProfile.scraped_articles.through)
def add_to_scraped_articles_history(sender, instance, action, **kwargs):
    if action == 'post_add':
        scraped_articles = kwargs.get('pk_set')
        if scraped_articles:
            instance.scraped_articles_history.add(*scraped_articles)
            instance.save()


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


@receiver(post_save, sender=Shoe)
def add_article_to_user_profile(sender, instance, created, **kwargs):
    user_profile = kwargs.get(
        'user_profile')  # Get the user_profile from kwargs
    if created and user_profile:
        user_profile.scraped_articles.add(instance)
