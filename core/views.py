from decimal import Decimal

import lorem
from django.shortcuts import render  # type: ignore
from elasticsearch_dsl import Q
from rest_framework import generics
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth.auth_utils import HttponlyCookieAuthentication
from core.models import Shoe
from core.scraping.scrape import NikeScraper
from core.utils import get_user_profile
from members.models import UserProfile
from restapi.serializers import ShoeSerializer
from .documents import ShoeDocument


class ShoeSearchView(generics.ListAPIView):
    serializer_class = ShoeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.kwargs.get('query')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        # Initialize the base Elasticsearch query
        elasticsearch_query = Q(
            "multi_match",
            query=query,
            fields=['name', 'article', 'sizes', 'parsed_from']
        )

        # Apply the price range filter if specified
        if min_price or max_price:
            price_filter = {}
            if min_price:
                price_filter['gte'] = float(min_price)
            if max_price:
                price_filter['lte'] = float(max_price)
            elasticsearch_query &= Q('range', price=price_filter)

        # Get the authenticated user
        user = self.request.user
        user_profile = UserProfile.objects.get(user=user)
        parsed_shoes_ids = [str(shoe.id) for shoe in
                            user_profile.scraped_articles.all()]

        # Initialize Elasticsearch search
        search = ShoeDocument.search().query(elasticsearch_query)

        if parsed_shoes_ids:
            search = search.query('ids', values=parsed_shoes_ids)

        return search.to_queryset()


class HomeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get('access_token')
        csrf_token = request.COOKIES.get('csrftoken')
        is_auth = request.COOKIES.get('is_authenticated')
        msg = lorem.text()
        return Response({"title": msg,
                         "access_token": access_token,
                         "csrf_token": csrf_token,
                         "is_authenticated": is_auth
                         })


class ShoeDetailedAPIView(APIView):
    def get(self, request, id):
        try:
            shoe = Shoe.objects.get(id=id)
            serializer = ShoeSerializer(shoe)
            return Response(serializer.data)
        except Shoe.DoesNotExist:
            return Response({'detail': 'Not found.'},
                            status=status.HTTP_404_NOT_FOUND)


class ParsedShoeDeleteAPIView(APIView):
    def delete(self, request, id):
        try:
            # Get the user profile from the request
            user_profile = get_user_profile(request)

            # Get the shoe instance associated with the user's profile
            shoe = user_profile.scraped_articles.get(id=id)

            # Remove the shoe from the user's scraped_articles
            user_profile.scraped_articles.remove(shoe)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Shoe.DoesNotExist:
            return Response({'detail': 'Not found.'},
                            status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found.'},
                            status=status.HTTP_404_NOT_FOUND)


class ClearUserParsedArticles(APIView):
    def delete(self, request):
        user_profile = get_user_profile(request)
        user_profile.scraped_articles.all().delete()
        return Response(status=status.HTTP_200_OK)


class ShoesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        scraped_articles = Shoe.objects.all()
        serializer = ShoeSerializer(scraped_articles, many=True)
        return Response(serializer.data)


class FetchPageView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [HttponlyCookieAuthentication]

    def get(self, request) -> Response:
        user_profile = get_user_profile(request)
        scraped_articles_history = user_profile.scraped_articles.all().order_by(
            '-created_at')
        article_data = ShoeSerializer(scraped_articles_history,
                                      many=True)
        return Response(
            {
                "article_data": article_data.data,
            }
        )

    def post(self, request) -> Response:
        user_profile = get_user_profile(request)
        article = request.data.get("article")

        existing_article = Shoe.objects.filter(article=article).first()

        if not existing_article:
            # Article does not exist, so scrape and add it
            scraper = NikeScraper(article)
            article_info = scraper.scrape()

            price_decimal = Decimal(
                article_info["price"].replace("$", "").replace(",", "")
            )

            new_article = Shoe(
                url=article_info["url"],
                price=price_decimal,
                image=article_info["product_image_url"],
                name=article_info["colorway_name"],
                article=article,
                sizes=article_info["sizes"],
                parsed_from="Nike"
            )
            new_article.save()

            user_profile.scraped_articles.add(new_article)

            serializer = ShoeSerializer(new_article)
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)
        else:
            # Article already exists, add it to the user's profile
            user_profile.scraped_articles.add(existing_article)
            serializer = ShoeSerializer(existing_article)
            return Response(serializer.data, status=status.HTTP_200_OK)
