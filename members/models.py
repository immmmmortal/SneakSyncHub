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
            raise ValueError("The Email field must be set")
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

    SUBSCRIPTION_CHOICES = [
        ("free", "Free"),
        ("premium", "Premium"),
    ]
    subscription = models.CharField(
        max_length=10,
        choices=SUBSCRIPTION_CHOICES,
        default="free",
    )

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
    rate_counter = models.IntegerField(default=0)
    rate_limit = models.IntegerField(default=10)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", default="default_profile_picture.jpg"
    )
    scraped_articles_history = models.ManyToManyField(
        Shoe, related_name="scraped_articles_history", blank=True
    )
    scraped_articles = models.ManyToManyField(Shoe, related_name="scraped_articles")

    objects = CustomUserManager()

    telegram_chat_id = models.CharField(
        max_length=50, null=True, blank=True
    )  # Store Telegram chat ID
    telegram_username = models.CharField(max_length=50, null=True, blank=True)

    def generate_verification_code(self):
        import random

        code = str(random.randint(100000, 999999))  # Generate a random 6-digit code
        self.telegram_verification_code = code
        self.save()
        return code

    def __str__(self):
        return self.user.email


class ShoeNotificationPreference(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="notification_preferences"
    )
    shoe = models.ForeignKey(
        Shoe, on_delete=models.CASCADE, related_name="notification_preferences"
    )
    desired_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    class Meta:
        unique_together = (
            "user",
            "shoe",
        )  # Ensure a user can only set preferences for a shoe once

    def __str__(self):
        return f"Preference for {self.shoe.name} by {self.user.email}"

    def get_user_preference_price(self):
        """
        Returns the user's desired price for the shoe and the final price to show
        based on whether there is a sale price or not.
        """
        # Determine which price to use: sale price if available, otherwise regular price
        final_price = (
            self.shoe.sale_price
            if self.shoe.sale_price and self.shoe.sale_price < self.shoe.price
            else self.shoe.price
        )

        return {
            "desired_price": self.desired_price,
            "final_price": final_price,
        }
