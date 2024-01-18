# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(admin.ModelAdmin):
    pass


# Register the custom user admin
admin.site.register(CustomUser, CustomUserAdmin)
