from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from rest_framework.authtoken.models import Token

from core.models import Shoe


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashing the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin, CustomUserManager):
    email = models.EmailField(unique=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    urls_parse_list = models.TextField(default="")
    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email


class UserProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name="user"
    )
    profile_picture = models.ImageField(
        upload_to="profile_pics/", default="default_profile_picture.jpg"
    )
    scraped_articles_history = models.ManyToManyField(Shoe,
                                                      related_name="scraped_articles_history",
                                                      blank=True)
    scraped_articles = models.ManyToManyField(
        Shoe,
        related_name="scraped_articles"
    )

    objects = CustomUserManager()

    def __str__(self):
        return self.user.email
