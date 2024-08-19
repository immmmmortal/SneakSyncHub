from django.urls import path
from rest_framework import routers

from core import views

router = routers.DefaultRouter()

urlpatterns = [
    path("api/", views.HomeView.as_view(), name="home"),
    path("api/fetch", views.FetchPageView.as_view(), name="fetch_page"),
    path('api/shoes', views.ShoesView.as_view(), name="view_shoes"),
    path('api/shoes/clear', views.ClearUserParsedArticles.as_view(),
         name="clear_user_parsed_articles"),
    path('api/shoes/<int:id>/delete/',
         views.ParsedShoeDeleteAPIView.as_view(),
         name='shoe-delete'),
    path('api/shoes/<int:id>/', views.ShoeDetailedAPIView.as_view(),
         name='shoe-detail'),
]
