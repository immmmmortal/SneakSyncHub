from django.urls import path

from members import views

urlpatterns = [
    path("profile",
         views.UserProfileView.as_view(), name="user_profile"),
    path("logout", views.LogoutView.as_view(), name="logout"),
    path('create', views.SignUpUserView.as_view(), name='create'),
    path('login', views.LoginView.as_view(), name='login'),
]
