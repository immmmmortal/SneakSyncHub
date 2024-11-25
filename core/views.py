import lorem
from django.core.cache import cache
from django.shortcuts import render  # type: ignore
from elasticsearch_dsl import Q
from rest_framework import generics
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth.auth_utils import HttponlyCookieAuthentication
from core.models import Shoe, ShoesNews
from core.utils import get_user_profile, filter_api_based_brands, scrapers_mapping
from members.models import UserProfile
from restapi.serializers import ShoeSerializer, ShoesNewsSerializer
from .documents import ShoeDocument
from .redis_utils.rate_limiter import rate_limit
from .scraping.product_service import ProductService, NikeSetup, AdidasSetup


class ShoeSearchView(generics.ListAPIView):
    serializer_class = ShoeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.kwargs.get("query")
        min_price = self.request.query_params.get("min_price", None)
        max_price = self.request.query_params.get("max_price", None)
        keyword = self.request.query_params.get("keyword", None)  # Can be
        # multiple keywords

        # Initialize the base Elasticsearch query (search by name,
        # article, sizes, parsed_from, and description)
        elasticsearch_query = Q(
            "multi_match",
            query=query,
            fields=["name", "description", "article", "sizes", "parsed_from"],
        )

        # Apply the price range filter if specified
        if min_price or max_price:
            price_filter = {}
            if min_price:
                price_filter["gte"] = float(min_price)
            if max_price:
                price_filter["lte"] = float(max_price)
            elasticsearch_query &= Q("range", price=price_filter)

        # Apply the keyword filter (searching for words in the
        # description)
        if keyword:
            keywords = keyword.split(",")  # Split the keyword parameter into a list
            keyword_queries = [Q("match", description=kw.strip()) for kw in keywords]
            # Use 'must' instead of 'should' to enforce that all
            # keywords must match
            elasticsearch_query &= Q("bool", must=keyword_queries)

        # Get the authenticated user
        user = self.request.user
        user_profile = UserProfile.objects.get(user=user)
        parsed_shoes_ids = [
            str(shoe.id) for shoe in user_profile.scraped_articles.all()
        ]

        # Initialize Elasticsearch search with the constructed query
        search = ShoeDocument.search().query(elasticsearch_query)

        # Optionally limit results to shoes in the user's parsed list
        if parsed_shoes_ids:
            search = search.query("ids", values=parsed_shoes_ids)

        return search.to_queryset()


class HomeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("access_token")
        csrf_token = request.COOKIES.get("csrftoken")
        is_auth = request.COOKIES.get("is_authenticated")
        msg = lorem.text()
        return Response(
            {
                "title": msg,
                "access_token": access_token,
                "csrf_token": csrf_token,
                "is_authenticated": is_auth,
            }
        )


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
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ShoesNewsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        news = ShoesNews.objects.all()
        serializer = ShoesNewsSerializer(news, many=True)
        return Response(serializer.data)


class TrendingShoesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Try to fetch the popular shoes from the cache
        cached_popular_shoes = cache.get("popular_shoes")

        if cached_popular_shoes:
            # If cache is found, return it
            return Response(cached_popular_shoes)

        # Otherwise, query the database for the most popular shoes
        popular_shoes = Shoe.objects.order_by("-count")[:10]

        # Serialize the data
        popular_shoes_data = [
            {
                "article": shoe.article,
                "name": shoe.name,
                "image_url": shoe.image,
                "price": shoe.price,
            }
            for shoe in popular_shoes
        ]

        # Store the result in cache for 1 hour (3600 seconds)
        cache.set("popular_shoes", popular_shoes_data, timeout=3600)

        return Response(popular_shoes_data)


class SearchSuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = UserProfile.objects.get(user=request.user)

        # Get user's scraped articles and scraped articles history
        scraped_articles = user_profile.scraped_articles.all()
        scraped_articles_history = user_profile.scraped_articles_history.all()

        # Get the last 4 scraped articles from history, excluding
        # those in scraped_articles
        last_scraped_articles = scraped_articles_history.exclude(
            article__in=scraped_articles.values_list("article", flat=True)
            # Use 'article' field instead of 'id'
        ).order_by("-id")[:4]

        # If there are less than 4 articles, fill the rest with
        # most popular articles
        if len(last_scraped_articles) < 4:
            needed_articles = 4 - len(last_scraped_articles)

            # Get most popular articles excluding already scraped
            # or shown articles
            most_popular_articles = (
                Shoe.objects.exclude(
                    article__in=scraped_articles.values_list("article", flat=True)
                    # Use 'article' field
                )
                .exclude(
                    article__in=last_scraped_articles.values_list("article", flat=True)
                    # Use 'article' field
                )
                .order_by("-count")[:needed_articles]
            )

            # Combine last scraped articles with most popular ones
            last_scraped_articles = list(last_scraped_articles) + list(
                most_popular_articles
            )

        # If nothing is in scraped_articles or
        # scraped_articles_history, show 6 most popular
        if not scraped_articles.exists() and not scraped_articles_history.exists():
            most_popular_articles = Shoe.objects.order_by("-count")[:6]
            suggestions = [
                {"article": article.article} for article in most_popular_articles
            ]
            return Response(
                {
                    "last_scraped_articles": [],
                    "most_popular_articles": suggestions,
                }
            )

        # Prepare response data
        last_scraped_data = [
            {"article": article.article} for article in last_scraped_articles
        ]

        # Fetch additional articles to make total 6 suggestions
        if len(last_scraped_data) < 6:
            additional_popular_articles = (
                Shoe.objects.exclude(
                    article__in=scraped_articles.values_list("article", flat=True)
                    # Use 'article' field
                )
                .exclude(
                    article__in=[article["article"] for article in last_scraped_data]
                )
                .order_by("-count")[: (6 - len(last_scraped_data))]
            )

            popular_data = [
                {"article": article.article} for article in additional_popular_articles
            ]
        else:
            popular_data = []

        return Response(
            {
                "last_scraped_articles": last_scraped_data,
                "most_popular_articles": popular_data,
            }
        )


class UpdateUserSubscription(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get the user profile
        user_profile = get_user_profile(request)
        user = user_profile.user

        # Get the selected plan from the request body
        plan = request.data.get("plan")

        if plan not in ["free", "premium"]:
            return Response(
                {"detail": "Invalid plan selected."}, status=status.HTTP_400_BAD_REQUEST
            )

        # If the user is upgrading to premium, reset the rate counter and set
        # the rate limit to 25
        if plan == "premium":
            user_profile.rate_counter = 0  # Reset the rate counter
            user_profile.rate_limit = 25  # Set the rate limit to 25 for
            # premium users

        # Update the user's subscription to the selected plan
        user.subscription = plan
        user.save()

        # Return a success response with updated subscription status
        return Response(
            {"detail": "Subscription updated successfully.", "subscription": plan},
            status=status.HTTP_200_OK,
        )


class ClearUserParsedArticles(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_profile = get_user_profile(request)
        user_profile.scraped_articles.clear()
        return Response(status=status.HTTP_200_OK)

class ShoeDetailedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, shoe_article):
        try:
            shoe = Shoe.objects.get(article=shoe_article)
            serializer = ShoeSerializer(shoe)
            return Response(serializer.data)
        except Shoe.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    @rate_limit
    def post(self, request, shoe_article):
        """
        Refresh the shoe data by scraping and updating the database.
        """
        brand_map = {
            "Adidas": AdidasSetup,
            "Nike": NikeSetup,
        }

        # Get the user profile
        user_profile = get_user_profile(request)

        # Get the `parse_from` field from the request or default to all available brands
        parse_from = request.data.get("parse_from", brand_map.keys())

        # Ensure the requested brand is supported
        parse_from = [brand for brand in parse_from if brand in brand_map]
        if not parse_from:
            return Response(
                {"statusText": "No valid brand found in parse_from"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        successful_scrape = None

        # Try scraping the shoe for the specified article
        for brand in parse_from:
            setup_class = brand_map.get(brand)
            if not setup_class:
                continue
            try:
                setup_instance = setup_class(shoe_article)
                parser = setup_instance.initialize_parser()
                new_article, created = ProductService.get_and_save_product_data(
                    parser, user_profile, brand
                )
                if new_article:
                    successful_scrape = new_article
                    break  # Stop after the first successful scrape
            except Exception as e:
                print(f"Failed scraping with {brand}: {e}")
                continue

        if successful_scrape:
            # Update the existing shoe's information if it exists in the database
            shoe, created = Shoe.objects.update_or_create(
                article=successful_scrape.article,
                defaults={
                    "name": successful_scrape.name,
                    "price": successful_scrape.price,
                    "sale_price": successful_scrape.sale_price,
                    "url": successful_scrape.url,
                    "image": successful_scrape.image,
                    "sizes": successful_scrape.sizes,
                    "description": successful_scrape.description,
                    "parsed_from": successful_scrape.parsed_from,
                },
            )
            serializer = ShoeSerializer(shoe)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            {"statusText": "Failed to scrape data for the article."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class FetchShoesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [HttponlyCookieAuthentication]

    def get(self, request) -> Response:
        user_profile = get_user_profile(request)
        scraped_articles_history = user_profile.scraped_articles.all().order_by(
            "-created_at"
        )
        article_data = ShoeSerializer(scraped_articles_history, many=True)
        return Response({"article_data": article_data.data})

    @rate_limit
    def post(self, request) -> Response:
        brand_map = {
            "Adidas": AdidasSetup,
            "Nike": NikeSetup,
        }

        user_profile = get_user_profile(request)
        article = request.data.get("article")
        parse_from = request.data.get("parse_from", [])

        if not parse_from:
            return Response(
                {"statusText": "parse_from is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Filter API-based brands
        api_based_brands = filter_api_based_brands(parse_from, scrapers_mapping)

        # Check if article already exists
        existing_article = Shoe.objects.filter(article=article).first()

        if existing_article:
            # Update the existing article's count
            existing_article.count += 1
            existing_article.save()
            # Reorder the article in the user's scraped articles (move to top)
            user_profile.scraped_articles.remove(existing_article)
            user_profile.scraped_articles.add(existing_article)
            serializer = ShoeSerializer(existing_article)
            return Response(serializer.data, status=status.HTTP_200_OK)

        successful_scrape = None

        # Split parse_from into API-based and non-API-based brands
        selected_api_based_brands = [
            brand for brand in parse_from if brand in api_based_brands
        ]
        selected_non_api_based_brands = [
            brand for brand in parse_from if brand not in api_based_brands
        ]

        # Try API-based scrapers first
        for brand in selected_api_based_brands:
            setup_class = brand_map.get(brand)
            if not setup_class:
                continue
            try:
                setup_instance = setup_class(article)
                parser = setup_instance.initialize_parser()
                new_article, created = ProductService.get_and_save_product_data(
                    parser, user_profile, brand
                )
                if new_article and not successful_scrape:
                    successful_scrape = new_article
            except Exception as e:
                print(f"Failed scraping with {brand} (API-based): {e}")
                continue

        # Try non-API-based scrapers if no API-based success
        if not successful_scrape:
            for brand in selected_non_api_based_brands:
                setup_class = brand_map.get(brand)
                if not setup_class:
                    continue
                try:
                    setup_instance = setup_class(article)
                    parser = setup_instance.initialize_parser()
                    new_article, created = ProductService.get_and_save_product_data(
                        parser, user_profile, brand
                    )
                    if new_article and not successful_scrape:
                        successful_scrape = new_article
                except Exception as e:
                    print(f"Failed scraping with {brand} (non-API-based): {e}")
                    continue

        if successful_scrape:
            serializer = ShoeSerializer(successful_scrape)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(
            {"statusText": "Failed to scrape data from any source"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


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
