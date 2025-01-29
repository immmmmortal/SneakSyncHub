import asyncio
import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from core.scraping.product_service import ProductService
from restapi.serializers import ShoeSerializer


class MockRequest:
    def __init__(self, user, parse_from):
        self.user = user
        self.data = {"parse_from": parse_from}

    @property
    def user_id(self):
        return self.user.id


class ScrapingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        """
        Handle the WebSocket message with multiple articles and parse_from details.
        """
        try:
            data = json.loads(text_data)  # Expecting a list of dictionaries
            print("Received data:", data)  # Log the received data

            # Validate the received data
            if not isinstance(data, list) or not all(
                isinstance(item, dict) and "article" in item and "parse_from" in item
                for item in data
            ):
                await self.send_error(
                    "Invalid data format. Expected a list of dictionaries containing 'article' and 'parse_from' fields."
                )
                return

            # Process all articles concurrently
            tasks = [
                self.process_article(
                    item["article"], MockRequest(self.user, item["parse_from"])
                )
                for item in data
            ]
            await asyncio.gather(*tasks)  # Run tasks concurrently
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format.")
        except Exception as e:
            await self.send_error(f"An unexpected error occurred: {str(e)}")

    @sync_to_async
    def serialize_shoe(self, shoe_instance):
        """Wrap the blocking call to the serializer"""
        return ShoeSerializer(shoe_instance).data

    async def process_article(self, article, mock_request):
        """
        Process scraping for a single article and send the result progressively.
        """
        try:
            result, error_response, status_code = (
                await ProductService.process_scraping_async(article, mock_request)
            )

            if result:
                # Serialize the result (Shoe instance) using ShoeSerializer in a thread
                shoe_data = await self.serialize_shoe(result)
                await self.send(
                    text_data=json.dumps(
                        {
                            "article": article,
                            "status": "success",
                            "data": shoe_data,
                        }
                    )
                )
            else:
                await self.send_error(
                    error_response.get("statusText", "Unknown error"), article=article
                )
        except Exception as e:
            await self.send_error(
                f"Error processing article: {str(e)}", article=article
            )

    async def send_error(self, error_message, article=None):
        """
        Send an error message for a specific article.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "article": article,
                    "status": "error",
                    "error": error_message,
                }
            )
        )
