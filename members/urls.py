from django.urls import path

from members import views

urlpatterns = [
    path("profile",
         views.UserProfileView.as_view(), name="user_profile"),
    path("logout", views.LogoutView.as_view(), name="logout"),
    path('signin', views.CreateUserView.as_view(), name='create'),
    path('login', views.ObtainAccessToken.as_view(), name='token'),
]
