from django.contrib import admin
from django.urls import path

from members import views

urlpatterns = [
    path("signup", views.signup_user, name="signup"),
    path("signup_success", views.signup_success, name="signup_success"),
    path("login", views.login_view, name="login"),
    path("user_profile/<int:user_id>", views.user_profile_view, name="user_profile"),
    path("logout", views.logout_view, name="logout"),
]
