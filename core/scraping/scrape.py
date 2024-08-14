from abc import ABC, abstractmethod
from collections import namedtuple
from typing import TypedDict

import re

import requests
from bs4 import BeautifulSoup
from selenium import webdriver


class ArticleInfo(TypedDict):
    url: str
    price: str
    product_image_url: str | list[str] | None
    colorway_name: str | list[str] | None
    sizes: list[str] | None


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
        article_info = ArticleInfo(
            url=self.product_url,
            price=self.price,
            product_image_url=self.colorway_image_url,
            colorway_name=self.colorway_name,
            sizes=list(self.available_sizes)
        )
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
            product_price="price-container",
            product_sizes="skuAndSize",
            products_colors="colorway-chip-",
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
        self.size_inputs_divs = self.product_page.find_all(
            'div',
            class_='nds-grid-item'
        )
        self.colorway_img_element = self.product_page.find(
            "img",
            id=f"{self.html_selectors.products_colors}{self.article}"
        )

        if self.colorway_img_element:
            self.colorway_image_url = self.colorway_img_element.get('src')
            self.colorway_name = self.colorway_img_element.get('alt')
        else:
            images_div = self.product_page.find("div", id="pdp-6-up")
            self.image_tag = images_div.next_element
            self.colorway_image_url = self.image_tag.get("src")
            self.colorway_name = self.image_tag.get("alt")

        self.price = self.product_page.find(
            "div", id=self.html_selectors.product_price
        ).next_element.get_text()


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
        for div in self.size_inputs_divs:
            if 'disabled' in div['class']:
                continue

                # Find the associated label and extract size
            label = div.find('label')
            if label:
                size_text = label.get_text(strip=True)
                # Extract sizes using regex
                sizes = re.findall(r'\d+\.?\d*', size_text)
                self.available_sizes.extend(sizes)

    def scrape(self):
        self.extract_product_page()
        self.extract_article_info()
        self.extract_available_sizes()

        article_info: ArticleInfo
        article_info = {
            "url": self.product_url,
            "price": self.price,
            "product_image_url": self.colorway_image_url,
            "colorway_name": self.colorway_name,
            "sizes": list(self.available_sizes),
        }

        return article_info
