from django.urls import path
from rest_framework import routers

from core import views

router = routers.DefaultRouter()

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("fetch", views.FetchPageView.as_view(), name="fetch_page"),
    path('shoes', views.ShoesView.as_view(), name="view_shoes"),
]
