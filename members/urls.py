from django.urls import path

from members import views

urlpatterns = [
    path("profile",
         views.UserProfileView.as_view()),
    path("logout", views.LogoutView.as_view()),
    path('signup', views.SignupUserView.as_view()),
    path('login', views.LoginUserView.as_view()),
]
