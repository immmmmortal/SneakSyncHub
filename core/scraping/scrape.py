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


class ScraperTemplate(ABC):
    def __init__(self, article) -> None:
        self.available_sizes = list()
        self.url: str
        self.article = article
        self.html_selectors: HTMLSelectors
        self.article_info: ArticleInfo
        self.__setup()

    def __setup(self):
        self.driver = webdriver.Chrome()
        self.html = requests.get(self.url)
        self.soup = BeautifulSoup(self.html.text, "html.parser")

    @abstractmethod
    def retrieve_article_info(self):
        pass

    @abstractmethod
    def retrieve_product_url(self):
        pass

    @abstractmethod
    def retrieve_available_sizes(self):
        pass

    @abstractmethod
    def scrape(self):
        pass


class ScrapeByArticleNike(ScraperTemplate):
    def __init__(self, article):
        self.url = f"https://www.nike.com/w?q={article}&vst={article}"
        self.html_selectors = {
            "products_list": "product-card__body",
            "product_url": "",
            "product_image_url": "",
            "product_name": "",
            "product_price": "product-price",
            "product_sizes": "skuAndSize",
            "products_colors": "nr-pdp-colorway-",
        }
        super().__init__(article)

    def retrieve_product_url(self):
        self.products = self.soup.find_all(
            "div", {"class": self.html_selectors["products_list"]}
        )
        self.product_url = self.products[0].find("a", href=True)["href"]
        self.html_selectors["product_url"] = self.product_url
        self.driver.get(self.product_url)
        self.driver.implicitly_wait(1)
        self.product_html = self.driver.page_source
        self.driver.quit()
        self.soup = BeautifulSoup(self.product_html, "html.parser")

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
        self.retrieve_product_url()
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
