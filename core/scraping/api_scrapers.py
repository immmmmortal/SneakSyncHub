from typing import Dict
from typing import List

from curl_cffi import requests as cureq
from curl_cffi.requests import exceptions
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from SneakSyncHub.settings import env
from core.scraping.base import ScraperBase
from core.scraping.selenium_scrapers import ProductData


class APIClient:
    def get(self, url: str) -> Dict:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Connection": "keep-alive",
            "Referer": "https://www.adidas.com/",
        }
        try:
            response = cureq.get(url, headers=headers, impersonate="chrome")
            # Check if the status code indicates success
            if response.status_code == 200:
                try:
                    return response.json()  # Parse and return JSON response
                except ValueError as json_error:
                    # Log and raise an error for invalid JSON
                    raise ValueError(
                        f"Failed to parse JSON from response. Error: "
                        f"{json_error}. "
                        f"Response content: {response.content}"
                    )
            else:
                # Raise an exception for non-200 status codes
                raise ValueError(
                    f"Request to {url} failed with status code "
                    f"{response.status_code}. "
                    f"Response content: {response.content}"
                )

        except cureq.exceptions.RequestException as req_error:
            # Handle network errors and other exceptions from curl_cffi
            raise ConnectionError(
                f"Error occurred while making request to {url}: {req_error}"
            )


class AdidasProductScraper(ScraperBase):
    brand = "Adidas"
    is_api_based = True
    __SEARCH_URL_TEMPLATE = "https://www.adidas.com/api/products/{article}"

    def __init__(self, article: str, api_client: APIClient):
        self._api_client = api_client
        self._article = article
        self._search_url = self.__SEARCH_URL_TEMPLATE.format(article=self._article)

    def fetch_product_info(self) -> Dict:
        try:
            # Try fetching product info via API
            return self._api_client.get(self._search_url)
        except (ValueError, ConnectionError) as e:
            # If an error occurs (e.g., API fails), fallback to Selenium
            print(f"API request failed with error: {e}. Falling back to Selenium...")
            return self.fetch_product_info_selenium()

    def fetch_product_sizes(self) -> Dict:
        try:
            return self._api_client.get(self._search_url + "/availability")
        except (ValueError, ConnectionError) as e:
            print(
                f"API request failed for sizes with error: {e}. Falling back to Selenium..."
            )
            return self.fetch_product_sizes_selenium()

    def fetch_product_info_selenium(self) -> Dict:
        # Set up Selenium WebDriver
        driver_options = Options()
        user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko)"
            "Chrome/91.0.4472.124 Safari/537.36"
        )
        driver_options.add_argument(f"user-agent={user_agent}")
        driver = webdriver.Remote(
            command_executor=f"http://" f'{env("SELENIUM_HOST")}:4444/wd/hub',
            options=driver_options,
        )
        driver.maximize_window()

        # Navigate to the product page
        product_url = self._search_url
        driver.get(product_url)

        try:
            # Extract all the text from the page
            page_source = driver.page_source
            # You can use a parser to extract just the text content
            from bs4 import BeautifulSoup

            soup = BeautifulSoup(page_source, "html.parser")
            all_text = soup.get_text(separator=" ", strip=True)

            product_data = {
                "all_text": all_text,
                # This will contain all the textual content on the page
            }
        except Exception as e:
            raise ValueError(f"Error while scraping data with Selenium: {e}")
        finally:
            driver.quit()

        return product_data

    def fetch_product_sizes_selenium(self) -> Dict:
        # Similar method for fetching sizes via Selenium if API fails
        driver_options = Options()

        user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko)"
            "Chrome/91.0.4472.124 Safari/537.36"
        )
        # Create Chrome options and set the user agent
        driver_options.add_argument(f"user-agent={user_agent}")
        driver = webdriver.Remote(
            command_executor=f"http://" f'{env("SELENIUM_HOST")}:4444/wd/hub',
            options=driver_options,
        )
        driver.maximize_window()

        product_url = self._search_url + "/availability"
        driver.get(product_url)

        # Wait until the sizes section is available
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "size-availability"))
        )

        try:
            sizes = self._extract_sizes(
                driver
            )  # Using the existing method to extract sizes
        except Exception as e:
            raise ValueError(f"Error while scraping sizes with Selenium: {e}")
        finally:
            driver.quit()

        return {"sizes": sizes}

    def _extract_sizes(self, driver) -> List[str]:
        sizes = []
        size_elements = driver.find_elements(By.CSS_SELECTOR, "div.size-option")
        for element in size_elements:
            size = element.text.strip()
            if size:  # Only add valid sizes
                sizes.append(size)
        return sizes


class AdidasProductParser:
    def __init__(self, product_info: Dict, product_sizes: Dict):
        self._product_info = product_info
        self._product_sizes = product_sizes
        self._product_data = None

    def __format_product_sizes(self, raw_info: Dict) -> List[str]:
        # Extracting all available men's sizes (check availability)
        men_sizes = []
        for variation in raw_info.get("variation_list", []):
            # Check if the size is in stock
            if variation.get("availability_status") == "IN_STOCK":
                size = variation.get("size", "")
                # Check if it's a men's size, i.e., contains 'M'
                if "M" in size:
                    # Extract the numeric part of the men's size
                    size = size.split(" / ")[0].replace("M", "").strip()
                    men_sizes.append(size)

        # Removing duplicates and sorting
        unique_sizes = sorted(set(men_sizes), key=lambda x: float(x))

        return unique_sizes

    def __compose_product_data(self):
        try:
            available_sizes = self.__format_product_sizes(self._product_sizes)
            __product_data: ProductData = {
                "article": self._product_info.get("id", ""),
                "url": self._product_info.get("meta_data", {}).get("canonical", ""),
                "name": self._product_info.get("name", ""),
                "price": self._product_info.get("pricing_information", {}).get(
                    "standard_price", ""
                ),
                "sale_price": self._product_info.get("pricing_information", {}).get(
                    "sale_price", ""
                ),
                "sizes": available_sizes,
                "description": self._product_info.get("product_description", {}).get(
                    "text", ""
                ),
                "image": self._product_info.get("view_list", [{}])[0].get(
                    "image_url", ""
                ),
            }
        except KeyError as e:
            raise ValueError(f"Missing expected key: {e}")

        self._product_data = __product_data

    def get_product_data(self) -> ProductData:
        self.__compose_product_data()
        return self._product_data
