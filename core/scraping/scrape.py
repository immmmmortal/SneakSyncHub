from abc import ABC, abstractmethod
from typing import TypedDict
import requests
from bs4 import BeautifulSoup
from selenium import webdriver


class HTMLSelectors(TypedDict):
    products_list: str
    product_url: str
    product_image_url: str
    product_name: str
    product_price: str
    product_sizes: str


class ArticleInfo(TypedDict):
    url: str
    price: str
    product_image_url: str
    name: str
    sizes: list[str]


class ScraperBase(ABC):
    _SEARCH_PAGE_URL_TEMPLATE: str

    def __init__(self, article):
        self.available_sizes = list()
        self.article: str = article
        self.html_selectors: HTMLSelectors
        self.article_info: ArticleInfo
        self.search_page_url: str
        self.__setup()

    def __setup(self):
        self.driver = webdriver.Chrome()
        self.html = requests.get(self.search_page_url)
        self.soup = BeautifulSoup(self.html.text, "html.parser")

    def _compose_product_url(self, article) -> str:
        return self._SEARCH_PAGE_URL_TEMPLATE.format(article, article)

    @abstractmethod
    def retrieve_product_url(self) -> str:
        pass

    @abstractmethod
    def retrieve_article_info(self) -> None:
        pass

    @abstractmethod
    def retrieve_product_page(self) -> None:
        pass

    @abstractmethod
    def retrieve_available_sizes(self) -> None:
        pass

    @abstractmethod
    def scrape(self) -> ArticleInfo:
        pass


class ScrapeByArticleNike(ScraperBase):
    _SEARCH_PAGE_URL_TEMPLATE = "https://www.nike.com/w?q={0}&vst={1}"

    def __init__(self, article):
        self.html_selectors = {
            "products_list": "product-card__body",
            "product_url": "",
            "product_image_url": "",
            "product_name": "",
            "product_price": "product-price",
            "product_sizes": "skuAndSize",
            "products_colors": "nr-pdp-colorway-",
        }
        self.search_page_url = self._compose_product_url(article)
        super().__init__(article)

    def retrieve_product_url(self) -> str:
        products = self.soup.find_all(
            "div", {"class": self.html_selectors["products_list"]}
        )
        self.product_url = products[0].find("a", href=True)["href"]
        return self.product_url

    def retrieve_product_page(self):
        product_url = self.retrieve_product_url()
        self.driver.get(product_url)
        self.driver.implicitly_wait(1)
        product_html = self.driver.page_source
        self.driver.quit()
        self.soup = BeautifulSoup(product_html, "html.parser")

    def retrieve_article_info(self):
        self.inputs = self.soup.find_all(
            "input",
            id=lambda x: x and x.startswith(self.html_selectors["product_sizes"]),
        )
        self.colorway_input = self.soup.find(
            "input", id=(f"{self.html_selectors['products_colors']}{self.article}")
        )
        self.image = self.colorway_input.find_next_sibling().find_next()
        self.colorway_image_url = self.image.get("src")
        self.colorway_name = self.image.get("alt")
        self.html_selectors["product_name"] = self.colorway_name
        self.html_selectors["product_url"] = self.product_url
        self.html_selectors["product_image_url"] = self.colorway_image_url
        self.price = self.soup.find(
            "div", class_=self.html_selectors["product_price"]
        ).get_text()

    def retrieve_available_sizes(self):
        for field in self.inputs:
            if not field.has_attr("disabled"):
                label = field.find_next()
                size = label.get_text()
                self.available_sizes.append(size)

    def scrape(self):
        self.retrieve_product_page()
        self.retrieve_article_info()
        self.retrieve_available_sizes()

        self.article_info = {
            "url": self.product_url,
            "price": self.price,
            "product_image_url": self.colorway_image_url,
            "name": self.colorway_name,
            "sizes": list(self.available_sizes),
        }

        return self.article_info
