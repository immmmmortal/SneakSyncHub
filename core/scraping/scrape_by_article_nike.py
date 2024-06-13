from abc import ABC
import requests
from bs4 import BeautifulSoup
from selenium import webdriver

class ScraperTemplate(ABC):
    def __init__(self,article) -> None:
        self.article = article        
        self.available_sizes = list()
        self.article_info = dict()
        self.url: str


    def scrape(self):
        return self.article_info


class ScrapeByArticleNike(ScraperTemplate):
    def __init__(self, article) -> None:
        super().__init__(article)
        self.url = f"https://www.nike.com/w?q={article}&vst={article}"

    def scrape(self):
        driver = webdriver.Chrome()
        html = requests.get(self.url)
        soup = BeautifulSoup(html.text, "html.parser")
        products = soup.find_all("div", {'class': 'product-card__body'})
        product_url = products[0].find("a", href=True)["href"]
        driver.get(product_url)
        driver.implicitly_wait(1)
        product_html = driver.page_source
        driver.quit()
        soup = BeautifulSoup(product_html, "html.parser")
        inputs = soup.find_all('input',
                            id=lambda x: x and x.startswith('skuAndSize'))
        colorway_input = soup.find('input',
                                id=f"nr-pdp-colorway-{self.article}")
        image = colorway_input.find_next_sibling().find_next()
        colorway_image_url = image.get('src')
        colorway_name = image.get('alt')
        price = soup.find('div', class_="product-price").get_text()

        for field in inputs:
            if not field.has_attr('disabled'):
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

def scrape_by_article(article):
    available_sizes = list()
    url = f"https://www.nike.com/w?q={article}&vst={article}"
    driver = webdriver.Chrome()


    html = requests.get(url)
    soup = BeautifulSoup(html.text, "html.parser")
    products = soup.find_all("div", {'class': 'product-card__body'})
    product_url = products[0].find("a", href=True)["href"]
    driver.get(product_url)
    driver.implicitly_wait(1)
    product_html = driver.page_source
    driver.quit()

    soup = BeautifulSoup(product_html, "html.parser")
    inputs = soup.find_all('input',
                           id=lambda x: x and x.startswith('skuAndSize'))
    colorway_input = soup.find('input',
                               id=f"nr-pdp-colorway-{article}")
    image = colorway_input.find_next_sibling().find_next()
    colorway_image_url = image.get('src')
    colorway_name = image.get('alt')
    price = soup.find('div', class_="product-price").get_text()

    for field in inputs:
        if not field.has_attr('disabled'):
            label = field.find_next()
            size = label.get_text()
            available_sizes.append(size)

    article_info = {
        "url": product_url,
        "price": price,
        "product_image_url": colorway_image_url,
        "name": colorway_name,
        "sizes": list(available_sizes),
    }
    return article_info
