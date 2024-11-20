import time
from abc import ABC, abstractmethod
from collections import namedtuple
from typing import TypedDict, Optional

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common import NoSuchElementException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

from SneakSyncHub.settings import env
from core.formatting.sizes import Formatter
from core.scraping.product_service import ScraperBase


class ProductData(TypedDict):
    article: str
    url: str
    price: str
    image: str
    name: str
    sizes: list[str]
    description: str


html_identifiers_tuple = namedtuple(
    "HTMLSelectors",
    [
        "product_card_id",
        "product_price_id",
        "product_sizes_id",
        "product_image_id",
        "product_description_id",
        "product_details_id",
    ],
)


class WebDriver:
    def __init__(self):
        self.driver: webdriver.Remote | None = None
        self.__setup()

    def __setup(self) -> None:
        # setup driver for fetching page
        driver_options = Options()

        user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko)"
            "Chrome/91.0.4472.124 Safari/537.36"
        )
        # Create Chrome options and set the user agent
        driver_options.add_argument(f"user-agent={user_agent}")
        # Headless mode for Firefox

        self.driver = webdriver.Remote(
            command_executor=f"http://" f'{env("SELENIUM_HOST")}:4444/wd/hub',
            options=driver_options,
        )
        self.driver.maximize_window()

    def quit(self) -> None:
        if self.driver:
            self.driver.quit()


# Beautiful Soup4 manager
class BSManager:
    @staticmethod
    def get_parsed_page(page_source: str) -> BeautifulSoup:
        soup = BeautifulSoup(page_source, "html.parser")
        return soup


class NikeProductScraper(ScraperBase):
    brand = "Nike"
    is_api_based = False
    _SEARCH_URL_TEMPLATE = "https://www.nike.com/w?q={0}&vst={1}"

    def __init__(self, driver: WebDriver, article: str):
        self._driver = driver
        self._setup()
        self._product_url: str = ""
        self._search_page_url = self.__compose_search_page_url(article)
        self._search_result_page = self._set_search_result_page()
        self.product_page = self._set_product_page()

    def scrape_page_source(self, url: str) -> str:
        self._driver.driver.get(url)
        time.sleep(2)
        page_source = self._driver.driver.page_source
        return page_source

    def _setup(self):
        # nike will ask for country when entered, choose US to
        # proceed scraping
        self._driver.driver.get("https://www.nike.com")
        try:
            USA_country_element = self._driver.driver.find_element(
                By.XPATH,
                "/html[1]/body[1]/div[6]/div[1]/div[1]/div[1]/div["
                "1]/section[1]/div[2]/div[2]/div[1]/ul[2]/li[10]/a["
                "1]/div[1]/h4[1]",
            )
            USA_country_element.click()
        except NoSuchElementException:
            print("USA country element not found, proceeding without clicking.")

    def _set_search_result_page(self) -> BeautifulSoup:
        #  Retrieves the HTML source of the search result page,
        #  parses it using BeautifulSoup and returns the parsed HTML
        search_result_page_source = self.scrape_page_source(
            self._search_page_url)
        parsed_search_result_page_source = BSManager.get_parsed_page(
            search_result_page_source
        )
        return parsed_search_result_page_source

    def _set_product_page(self) -> BeautifulSoup:
        # extract product page source code with WebDriver to get
        # access to product details
        self._product_url = self._extract_product_url()
        product_page_source = self.scrape_page_source(self._product_url)
        product_page = BSManager.get_parsed_page(product_page_source)
        return product_page

    def __compose_search_page_url(self, article) -> str:
        # take URL template for certain site and insert article in
        # it to get search page url
        return self._SEARCH_PAGE_URL_TEMPLATE.format(article, article)

    def _extract_product_url(self) -> str:
        # we extract product url from search page results to
        # further proceed scraping
        first_matching_product = self._search_result_page.find(
            "div", {"class": NikeProductParser.HTML_IDENTIFIERS.product_card_id}
        )
        product_url = first_matching_product.find("a", href=True)["href"]
        return product_url

    @property
    def product_url(self) -> str:
        return self._product_url


class ParserBase(ABC):
    _SEARCH_PAGE_URL_TEMPLATE: str
    HTML_IDENTIFIERS: html_identifiers_tuple

    def __init__(
            self,
            article,
            product_page,
            html_identifiers: html_identifiers_tuple,
            driver: WebDriver,
            product_url: str,
    ) -> None:
        self._driver = driver

        self._product_url = product_url
        self._html_identifiers = html_identifiers
        self._product_page = product_page

        self.article: str = article
        self.__available_sizes: list = list()
        self.__product_info: Optional[ProductData] = None
        self.product_image = None

    @abstractmethod
    def _extract_and_format_product_price(self):
        """Extract the product price"""
        pass

    @abstractmethod
    def _extract_product_sizes(self):
        """Extract the product sizes"""
        pass

    @abstractmethod
    def _extract_product_image_url(self):
        """Extract the product image URL"""
        pass

    @abstractmethod
    def _extract_product_description(self):
        """Extract the product description"""
        pass

    @abstractmethod
    def _extract_and_format_available_sizes(self, product_sizes):
        """Extract the available sizes from the product sizes"""
        pass

    @abstractmethod
    def _extract_product_name(self):
        """Extract the product name"""
        pass

    def __compose_product_info(self) -> None:
        try:
            product_price = self._extract_and_format_product_price()
            product_sizes = self._extract_product_sizes()
            product_image = self._extract_product_image_url()
            product_description = self._extract_product_description()
            available_sizes = self._extract_and_format_available_sizes(
                product_sizes)
            name = self._extract_product_name()

            self.__product_info: ProductData = {
                "url": self._product_url,
                "article": self.article,
                "name": name,
                "price": product_price,
                "sizes": available_sizes,
                "description": product_description,
                "image": product_image,
            }
            self._driver.quit()
        except Exception as e:
            print(f"Error occurred while scraping product {self.article}: {e}")
        finally:
            self._driver.quit()

    def get_product_data(self) -> ProductData:
        self.__compose_product_info()
        return self.__product_info


class NikeProductParser(ParserBase):
    HTML_IDENTIFIERS = html_identifiers_tuple(
        product_card_id="product-card__body",
        product_price_id="price-container",
        product_sizes_id="pdp-grid-selector-grid",
        product_image_id="hero-image",
        product_description_id="product-description",
        product_details_id="benefit-section",
    )

    def __init__(self, article, driver: WebDriver, product_page) -> None:
        nike_scraper = NikeProductScraper(driver, article)
        super().__init__(
            article,
            product_page,
            self.HTML_IDENTIFIERS,
            driver,
            nike_scraper.product_url,
        )

    def _extract_product_sizes(self):
        # get all sizes of product to format them
        sizes_element = self._product_page.find(
            class_=self._html_identifiers.product_sizes_id
        )
        return sizes_element

    def _extract_product_image_url(self):
        # get first from product image collection to keep similar
        # product images
        product_images_element = self._product_page.find(
            "div", id=self._html_identifiers.product_image_id
        )
        # get first image from image collection
        self.product_image = product_images_element.find("img")
        product_image_url = self.product_image.get("src")
        return product_image_url

    def _extract_product_name(self):
        # extract name from image alt attribute
        product_name = self.product_image.get("alt")
        return product_name

    def _extract_and_format_product_price(self):
        # extract product price
        raw_product_price = self._product_page.find(
            "div", {"id": self._html_identifiers.product_price_id}
        ).next_element.get_text()
        product_price = Formatter.get_decimal_from_string(raw_product_price)
        return product_price

    def _extract_product_description(self):
        # extract product description
        description_element = self._product_page.find(
            "p", {"data-testid": "product-description"}
        )

        if description_element:
            product_description = description_element.get_text(strip=True)
            return product_description

    def _extract_and_format_available_sizes(self, product_sizes):
        child_divs = product_sizes.find_all("div", recursive=False)
        available_sizes = []

        for div in child_divs:
            if "disabled" not in div.get("class", []):
                label = div.find("label")
                if label:
                    size_text = label.get_text(strip=True)

                    # Normalize the size text
                    normalized_size = Formatter.get_stripped_sizes(size_text)
                    if normalized_size:
                        available_sizes.append(normalized_size)

        return available_sizes
