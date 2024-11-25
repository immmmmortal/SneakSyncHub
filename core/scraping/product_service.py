from decimal import Decimal

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


class NikeSetup:
    def __init__(self, article):
        self.article = article
        self.web_driver = WebDriver()
        self.scraper = NikeProductScraper(self.web_driver, article)
        self.product_page = self.scraper.product_page

    def initialize_parser(self) -> NikeProductParser:
        return NikeProductParser(
            article=self.article, driver=self.web_driver,
            product_page=self.product_page
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
    def get_and_save_product_data(parser, user_profile, parsed_from):
        try:
            # Get product data from the parser instance
            product_data = parser.get_product_data()
            product_data["parsed_from"] = parsed_from  # Set parsed_from field

            sale_price = (
                Decimal(product_data["sale_price"]) if product_data[
                    "sale_price"] else None
            )
            price = Decimal(product_data["price"]) if product_data[
                "price"] else None

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
                    "parsed_from": parsed_from,
                    # Ensure parsed_from is set here
                },
            )

            # Add the scraped article to the user's profile
            user_profile.scraped_articles.add(shoe)

            return shoe, created
        except Exception as e:
            # Log the error for debugging
            print(f"Error with scraper {parsed_from}: {e}")
            # Skip this scraper and move to the next
            return None, False
