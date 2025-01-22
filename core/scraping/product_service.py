import asyncio
from decimal import Decimal
from typing import Tuple, Optional

from rest_framework import status

from core.models import Shoe
from core.scraping.api_scrapers import (
    APIClient,
    AdidasProductScraper,
    AdidasProductParser,
)
from core.scraping.selenium_scrapers import (
    WebDriver,
    NikeProductScraper,
    NikeProductParser,
)
from core.utils import get_user_profile


class NikeSetup:
    def __init__(self, article):
        self.article = article
        self.web_driver = WebDriver()
        self.scraper = NikeProductScraper(self.web_driver, article)
        self.product_page = self.scraper.product_page

    def initialize_parser(self) -> NikeProductParser:
        return NikeProductParser(
            article=self.article, driver=self.web_driver, product_page=self.product_page
        )


class AdidasSetup:
    def __init__(self, article):
        self.api_client = APIClient()
        self.scraper = AdidasProductScraper(article, self.api_client)
        self.product_info = self.scraper.fetch_product_info()
        self.product_sizes = self.scraper.fetch_product_sizes()

    def initialize_parser(self) -> AdidasProductParser:
        return AdidasProductParser(self.product_info, self.product_sizes)


class ProductService:
    @staticmethod
    async def process_scraping_async(shoe_article, request):
        """
        Async wrapper for process_scraping.
        """
        loop = asyncio.get_event_loop()

        # Run the blocking `process_scraping` method in a thread pool executor
        return await loop.run_in_executor(
            None, ProductService.process_scraping, shoe_article, request
        )

    @staticmethod
    def process_scraping(shoe_article, request):
        """
        Handles the entire scraping workflow for a shoe article.
        """
        brand_map = {
            "Adidas": AdidasSetup,
            "Nike": NikeSetup,
        }

        # Get the user profile
        user_profile = get_user_profile(request)

        # Get the `parse_from` field from the request or default to all available brands
        parse_from = request.data.get(
            "parse_from", list(brand_map.keys())
        )  # Convert dict_keys to a list

        # Ensure parse_from is always a list, even if it's a single string
        if isinstance(parse_from, str):
            parse_from = [parse_from]  # Convert single string to list

        # Now you can safely iterate over parse_from
        parse_from = [brand for brand in parse_from if brand in brand_map]

        if not parse_from:
            return (
                None,
                {"statusText": "No valid brand found in parse_from"},
                status.HTTP_400_BAD_REQUEST,
            )

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
                    if new_article.article != shoe_article:
                        error_message = (
                            f"The shoe article '{shoe_article}' does not match the fetched article "
                            f"'{new_article.article}' from {brand}. We "
                            f"couldn't "
                            f"find this shoe on the original "
                            f"site, and attempts to scrape from other sites also failed."
                        )
                        return (
                            None,
                            {"statusText": error_message},
                            status.HTTP_404_NOT_FOUND,
                        )
                    return new_article, None, status.HTTP_200_OK
            except Exception as e:
                print(f"Failed scraping with {brand}: {e}")
                continue

        return (
            None,
            {"statusText": "Failed to scrape data for the article."},
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    @staticmethod
    def get_and_save_product_data(
        parser, user_profile, parse_from
    ) -> Tuple[Optional[Shoe], bool]:
        """
        Extract product data using the parser and save it to the database.
        """
        try:
            # Get product data from the parser instance
            product_data = parser.get_product_data()
            product_data["parsed_from"] = parse_from  # Set parsed_from field

            sale_price = (
                Decimal(product_data["sale_price"])
                if product_data["sale_price"]
                else None
            )
            price = Decimal(product_data["price"]) if product_data["price"] else None

            # Check if the product already exists in the database
            article = product_data["article"]
            shoe, created = Shoe.objects.update_or_create(
                article=article,
                defaults={
                    "name": product_data["name"],
                    "sale_price": sale_price,
                    "price": price,
                    "sizes": product_data["sizes"],
                    "url": product_data["url"],
                    "description": product_data["description"],
                    "image": product_data["image"],
                    "parsed_from": parse_from,
                },
            )

            # Add the scraped article to the user's profile
            user_profile.scraped_articles.add(shoe)

            return shoe, created
        except Exception as e:
            # Log the error for debugging
            print(f"Error with scraper {parse_from}: {e}")
            # Skip this scraper and move to the next
            return None, False
