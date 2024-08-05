from django.urls import path
from rest_framework import routers

from core import views

router = routers.DefaultRouter()

urlpatterns = [
    path("api/", views.HomeView.as_view(), name="home"),
    path("api/fetch", views.FetchPageView.as_view(), name="fetch_page"),
    path('api/shoes', views.ShoesView.as_view(), name="view_shoes"),
]
