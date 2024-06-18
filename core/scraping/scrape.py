from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
from selenium import webdriver


class ScraperTemplate(ABC):
    def __init__(self, article) -> None:
        self.available_sizes = list()
        self.article_info = dict()
        self.url: str
        self.article = article
        self.html_selectors = {
            "products_list": "",  # class name for products list after search
            "product_url": "",
            "product_image_url": "",
            "product_name": "",
            "product_price": "",
            "product_sizes": "",
        }
        self.article_info = {
            "url": "",
            "price": "",
            "product_image_url": "",
            "name": "",
            "sizes": list(),
        }

    @abstractmethod
    def scrape(self):
        pass


class ScrapeByArticleNike(ScraperTemplate):
    def __init__(self, article) -> None:
        super().__init__(article)
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

    def scrape(self):
        driver = webdriver.Chrome()
        html = requests.get(self.url)
        soup = BeautifulSoup(html.text, "html.parser")
        products = soup.find_all("div", {"class": self.html_selectors["products_list"]})
        product_url = products[0].find("a", href=True)["href"]
        self.product_url = product_url
        driver.get(product_url)
        driver.implicitly_wait(1)
        product_html = driver.page_source
        driver.quit()
        soup = BeautifulSoup(product_html, "html.parser")
        inputs = soup.find_all(
            "input",
            id=lambda x: x and x.startswith(self.html_selectors["product_sizes"]),
        )
        colorway_input = soup.find(
            "input", id=(f"{self.html_selectors['products_colors']}{self.article}")
        )
        image = colorway_input.find_next_sibling().find_next()
        colorway_image_url = image.get("src")
        colorway_name = image.get("alt")
        self.html_selectors["product_name"] = colorway_name
        self.html_selectors["product_url"] = product_url
        self.html_selectors["product_image_url"] = colorway_image_url
        price = soup.find("div", class_=self.html_selectors["product_price"]).get_text()

        for field in inputs:
            if not field.has_attr("disabled"):
                label = field.find_next()
                size = label.get_text()
                self.available_sizes.append(size)

        self.article_info = {
            "url": product_url,
            "price": price,
            "product_image_url": colorway_image_url,
            "name": colorway_name,
            "sizes": list(self.available_sizes),
        }

        return self.article_info
