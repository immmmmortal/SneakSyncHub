from typing import List, Dict, Type

from core.scraping.api_scrapers import AdidasProductScraper
from core.scraping.base import ScraperBase
from core.scraping.selenium_scrapers import NikeProductScraper
from members.models import UserProfile

lorem_ipsum = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
    "Mauris eget dapibus augue. Phasellus justo elit, dictum eget "
    "tortor eget, gravida volutpat felis. Praesent placerat lorem "
    "vitae risus efficitur maximus. Duis mauris lorem, "
    "sollicitudin in hendrerit in, blandit at lorem. Phasellus "
    "erat sapien, suscipit quis aliquam id, feugiat eu libero. "
    "Suspendisse tortor elit, lobortis quis sodales at, lacinia et "
    "massa. Sed vel congue risus, pulvinar malesuada turpis. "
    "Praesent in massa ullamcorper, lacinia tortor at, placerat "
    "risus."
)

scrapers_mapping = {
    "Adidas": AdidasProductScraper,
    "Nike": NikeProductScraper,
}


def get_user_profile(request) -> UserProfile:
    return UserProfile.objects.get(user=request.user)


def filter_api_based_brands(
        brands: List[str], scraper_mapping: Dict[str, Type[ScraperBase]]
) -> List[str]:
    """
    Filters brands whose scrapers are API-based.

    Args:
        brands: A list of brand names to check.
        scraper_mapping: A dictionary mapping brand names to their scraper
        classes.

    Returns:
        A list of brand names that have API-based scrapers.
    """
    return [
        brand
        for brand in brands
        if scraper_mapping.get(brand)
           and getattr(scraper_mapping[brand], "is_api_based", False)
    ]
