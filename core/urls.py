from django.contrib import admin
from django.urls import path

from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('profile/', views.user_profile_view, name='user_profile'),
]
