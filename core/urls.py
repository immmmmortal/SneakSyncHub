from django.urls import path
from rest_framework import routers

from core import views

router = routers.DefaultRouter()

urlpatterns = [
    path("", views.HomeView.as_view()),
    path("fetch", views.FetchPageView.as_view()),
    path('shoes', views.ShoesView.as_view()),
    path('shoes/clear', views.ClearUserParsedArticles.as_view()),
    path('shoes/<int:shoe_id>/delete',
         views.ParsedShoeDeleteAPIView.as_view()),
    path('shoes/<int:shoe_id>', views.ShoeDetailedAPIView.as_view()),
    path('search/<str:query>/', views.ShoeSearchView.as_view()),
    path('shoes/<int:shoe_id>/remove', views.DeleteShoeView.as_view())
]
