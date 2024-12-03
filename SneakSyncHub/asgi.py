import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from core.consumers import ScrapingConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SneakSyncHub.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(  # Add middleware for authentication if needed
        URLRouter(
            [
                path("ws/scrape/", ScrapingConsumer.as_asgi()),
            ]
        )
    ),
})
