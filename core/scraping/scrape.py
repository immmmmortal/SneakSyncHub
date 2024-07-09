from abc import ABC, abstractmethod
from collections import namedtuple
from typing import TypedDict
import requests
from bs4 import BeautifulSoup
from selenium import webdriver


class WebDriver:
    def __init__(self) -> None:
        self.search_page_url: str = ""

    def _setup_driver(self) -> None:
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless=new")
        self.driver = webdriver.Chrome(options=chrome_options)
        html = requests.get(self.search_page_url)
        self.products_list_page = BeautifulSoup(html.text, "html.parser")

    def parse_html_by_url(self, product_url) -> str:
        self.driver.get(product_url)
        self.driver.implicitly_wait(1)
        product_html_source = self.driver.page_source
        self.driver.quit()
        return product_html_source


class ArticleInfo(TypedDict):
    url: str
    price: str
    product_image_url: str
    colorway_name: str
    sizes: list[str]


class SoupExtractorBase(ABC, WebDriver):
    def __init__(self):
        self.html_selectors_tuple = namedtuple(
            "HTMLSelectors",
            [
                "products_list",
                "product_price",
                "product_sizes",
                "products_colors",
                "alternative_div_img_tag",
            ],
        )
        self._setup_driver()

    def _set_article_info(self) -> ArticleInfo:
        article_info = {
            "url": self.product_url,
            "price": self.price,
            "product_image_url": self.colorway_image_url,
            "name": self.colorway_name,
            "sizes": list(self.available_sizes),
        }
        return article_info

    @abstractmethod
    def extract_product_url(self) -> str:
        pass

    @abstractmethod
    def extract_product_page(self) -> None:
        pass

    @abstractmethod
    def extract_article_info(self) -> None:
        pass


class NikeSoupExtractor(SoupExtractorBase):
    def __init__(self):
        super().__init__()
        self.html_selectors = self.html_selectors_tuple(
            products_list="product-card__body",
            product_price="product-price",
            product_sizes="skuAndSize",
            products_colors="nr-pdp-colorway-",
            alternative_div_img_tag="pdp-6-up",
        )

    def extract_product_url(self) -> str:
        products = self.products_list_page.find_all(
            "div", {"class": self.html_selectors.products_list}
        )
        product_url = products[0].find("a", href=True)["href"]
        return product_url

    def extract_product_page(self):
        self.product_url = self.extract_product_url()
        product_html = self.parse_html_by_url(self.product_url)
        self.product_page = BeautifulSoup(product_html, "html.parser")

    def extract_article_info(self):
        self.size_inputs = self.product_page.find_all(
            "input",
            id=lambda x: x and x.startswith(self.html_selectors.product_sizes),
        )
        self.colorway_inputs = self.product_page.find(
            "input", id=(f"{self.html_selectors.products_colors}{self.article}")
        )

        if self.colorway_inputs:
            self.image_tag = self.colorway_inputs.find_next_sibling().find_next()
        else:
            images_div = self.product_page.find("div", id=("pdp-6-up"))
            self.image_tag = images_div.next_element

        self.colorway_image_url = self.image_tag.get("src")
        self.colorway_name = self.image_tag.get("alt")
        self.price = self.product_page.find(
            "div", class_=self.html_selectors.product_price
        ).get_text()


class ScraperBase(ABC):
    _SEARCH_PAGE_URL_TEMPLATE: str

    def __init__(self, article):
        self.available_sizes = list()
        self.article: str = article
        self.article_info: ArticleInfo = {}
        self.search_page_url: str = self._compose_product_url(article)

    def _compose_product_url(self, article) -> str:
        return self._SEARCH_PAGE_URL_TEMPLATE.format(article, article)

    @abstractmethod
    def extract_available_sizes(self) -> None:
        pass

    @abstractmethod
    def scrape(self) -> ArticleInfo:
        pass


class ScrapeByArticleNike(ScraperBase, NikeSoupExtractor):
    _SEARCH_PAGE_URL_TEMPLATE = "https://www.nike.com/w?q={0}&vst={1}"

    def __init__(self, article):
        ScraperBase.__init__(self, article)
        NikeSoupExtractor.__init__(self)

    def extract_available_sizes(self):
        for field in self.size_inputs:
            if not field.has_attr("disabled"):
                label = field.find_next()
                size = label.get_text()
                self.available_sizes.append(size)

    def scrape(self):
        self.extract_product_page()
        self.extract_article_info()
        self.extract_available_sizes()

        article_info = {
            "url": self.product_url,
            "price": self.price,
            "product_image_url": self.colorway_image_url,
            "name": self.colorway_name,
            "sizes": list(self.available_sizes),
        }

        return article_info
