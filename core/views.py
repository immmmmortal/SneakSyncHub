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


class ShoeDetailedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, shoe_article):
        try:
            shoe = Shoe.objects.get(article=shoe_article)
            serializer = ShoeSerializer(shoe)
            return Response(serializer.data)
        except Shoe.DoesNotExist:
            return Response({'detail': 'Not found.'},
                            status=status.HTTP_404_NOT_FOUND)


class ParsedShoeDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, shoe_id):
        try:
            user_profile = get_user_profile(request)

            # Get the shoe instance associated with the user's profile
            shoe = user_profile.scraped_articles.get(id=shoe_id)

            # Remove the shoe from the user's scraped_articles
            user_profile.scraped_articles.remove(shoe)

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Shoe.DoesNotExist:
            return Response({'detail': 'Not found.'},
                            status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found.'},
                            status=status.HTTP_404_NOT_FOUND)


class SearchSuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = UserProfile.objects.get(user=request.user)

        # Get user's scraped articles and scraped articles history
        scraped_articles = user_profile.scraped_articles.all()
        scraped_articles_history = user_profile.scraped_articles_history.all()

        # Get the last 4 scraped articles from history, excluding those in scraped_articles
        last_scraped_articles = scraped_articles_history.exclude(
            id__in=scraped_articles.values_list('id', flat=True)
        ).order_by('-id')[:4]

        # If there are less than 4 articles, fill the rest with most popular articles
        if len(last_scraped_articles) < 4:
            # Calculate how many more articles are needed
            needed_articles = 4 - len(last_scraped_articles)

            # Get most popular articles (excluding those already in scraped_articles or last_scraped_articles)
            most_popular_articles = Shoe.objects.exclude(
                id__in=scraped_articles.values_list('id', flat=True)
            ).exclude(
                id__in=last_scraped_articles.values_list('id', flat=True)
            ).order_by('-count')[:needed_articles]

            # Combine the last scraped articles with most popular ones to meet the total requirement
            last_scraped_articles = list(last_scraped_articles) + list(
                most_popular_articles)

        # If nothing is in scraped_articles or scraped_articles_history, show 6 most popular
        if not scraped_articles.exists() and not scraped_articles_history.exists():
            most_popular_articles = Shoe.objects.order_by('-count')[:6]
            suggestions = [{'article': article.article} for article in
                           most_popular_articles]
            return Response({
                'last_scraped_articles': [],
                'most_popular_articles': suggestions,
            })

        # Prepare the response data
        last_scraped_data = [{'article': article.article} for article in
                             last_scraped_articles]

        # Fetch additional 2 most popular articles if needed (total 6 results)
        if len(last_scraped_data) < 6:
            additional_popular_articles = Shoe.objects.exclude(
                id__in=scraped_articles.values_list('id', flat=True)
            ).exclude(
                id__in=[article['article'] for article in
                        last_scraped_data]
            ).order_by('-count')[:(6 - len(last_scraped_data))]

            popular_data = [{'article': article.article} for article in
                            additional_popular_articles]
        else:
            popular_data = []

        return Response({
            'last_scraped_articles': last_scraped_data,
            'most_popular_articles': popular_data,
        })


class ClearUserParsedArticles(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_profile = get_user_profile(request)
        user_profile.scraped_articles.all().delete()
        return Response(status=status.HTTP_200_OK)


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
            product_info = scraper.get_product_info()

            price_decimal = Decimal(
                product_info["price"].replace("$", "").replace(",", "")
            )

            new_article = Shoe(
                url=product_info["url"],
                price=price_decimal,
                image=product_info["image_url"],
                name=product_info["name"],
                article=article,
                description=product_info["description"],
                sizes=product_info["sizes"],
                parsed_from="Nike"
            )

            new_article.count += 1
            try:
                new_article.save(user_profile=user_profile)
            except Exception as e:
                return Response({"statusText": str(e)},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            serializer = ShoeSerializer(new_article)
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)
        else:
            existing_article.count += 1
            existing_article.save()

            # Article already exists, add it to the user's profile
            user_profile.scraped_articles.add(existing_article)
            serializer = ShoeSerializer(existing_article)
            return Response(serializer.data, status=status.HTTP_200_OK)


class ShoesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        scraped_articles = Shoe.objects.all()
        serializer = ShoeSerializer(scraped_articles, many=True)
        return Response(serializer.data)


class DeleteShoeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, shoe_id):
        Shoe.objects.get(id=shoe_id).delete()
        return Response(status=status.HTTP_200_OK)
