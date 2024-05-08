from django.contrib import admin
from django.urls import path

from core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('profile/<int:user_id>/', views.user_profile_view,
         name='user_profile'),
    path('fetch', views.fetch_page_view, name='fetch_page')
]
