from decimal import Decimal

import lorem
from django.shortcuts import render  # type: ignore
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from core.models import Shoe
from core.scraping.scrape import ScrapeByArticleNike
from core.utils import get_user_profile
from restapi.serializers import ShoeSerializer


class HomeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        msg = lorem.text()
        return Response({"title": msg})


class ClearUserParsedArticles(APIView):
    def post(self, request):
        user_profile = get_user_profile(request)
        user_profile.scraped_articles.delete()
        return Response(status=status.HTTP_200_OK)


class ShoesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        scraped_articles = Shoe.objects.all()
        serializer = ShoeSerializer(scraped_articles, many=True)
        return Response(serializer.data)


class FetchPageView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, format=None) -> Response:
        user_profile = get_user_profile(request)
        scraped_articles_history = user_profile.scraped_articles.all()
        article_data = ShoeSerializer(scraped_articles_history,
                                      many=True)
        return Response(
            {"article_data": article_data.data, }
        )

    def post(self, request) -> Response:
        user_profile = get_user_profile(request)
        article = request.data.get("article")
        parsed_articles = Shoe.objects.all()

        if "clear_articles" in request.data:
            user_profile.scraped_articles.clear()
            return Response(status=status.HTTP_204_NO_CONTENT)

        if not parsed_articles.filter(article=article).exists():
            scraper = ScrapeByArticleNike(article)
            article_info = scraper.scrape()

            price_decimal = Decimal(
                article_info["price"].replace("$", "").replace(",",
                                                               "")
            )

            new_article = Shoe(
                url=article_info["url"],
                price=price_decimal,
                image=article_info["product_image_url"],
                name=article_info["colorway_name"],
                article=article,
                sizes=article_info["sizes"],
            )
            new_article.save()

            user_profile.scraped_articles.add(new_article)

            serializer = ShoeSerializer(new_article)
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)

        else:
            desired_article = Shoe.objects.get(article=article)
            user_profile.scraped_articles.add(desired_article)
            serializer = ShoeSerializer(desired_article)
            return Response(serializer.data,
                            status=status.HTTP_200_OK)
