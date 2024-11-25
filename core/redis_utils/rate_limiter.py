import logging
import os
from functools import wraps
from pathlib import Path

import environ
import redis
from django.http import JsonResponse

# Initialize environment
env = environ.Env()
BASE_DIR = Path(
    __file__).resolve().parent.parent.parent  # Adjust to point to the
# correct root
environ.environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# Setup logging
logger = logging.getLogger(__name__)

redis_client = redis.StrictRedis(
    host=env('REDIS_HOST'),
    port=env.int('REDIS_PORT', default=6379),
    decode_responses=True  # Optional, to decode responses as strings
)


def is_rate_limited(user, subscription):
    # Define rate limits per subscription
    rate_limits = {
        "free": 10,  # 100 requests/day
        "premium": 25,  # 1000 requests/day
    }
    max_requests = rate_limits.get(subscription, 100)  # Default to "free"

    # Redis key for tracking the user
    redis_key = f"user:{user.id}:rate_limit"

    # Increment and get the current count
    current_count = redis_client.incr(redis_key)

    # Set the expiration to 24 hours if it's a new key
    if current_count == 1:
        redis_client.expire(redis_key, 86400)  # 24 hours in seconds

    # Calculate remaining requests
    remaining_requests = max_requests - current_count

    # Log remaining requests for developers
    logger.debug(
        f"User {user.id} ({subscription} subscription): "
        f"{remaining_requests} requests left out of {max_requests}. "
        f"Current count: {current_count}"
    )

    # Check if the count exceeds the limit
    return current_count > max_requests


def rate_limit(view_func):
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        # Determine if the view is a method of a class-based view
        request = None
        if args:  # Ensure args is not empty
            if hasattr(args[0], 'request'):  # Check for CBV (class-based view)
                request = args[0].request
            elif hasattr(args[0],
                         'user'):  # Check for FBV (function-based view)
                request = args[0]

        if request and hasattr(request,
                               'user') and request.user.is_authenticated:
            # Assuming the user model has a subscription field or related object
            subscription = getattr(request.user, 'subscription', 'free')

            if is_rate_limited(request.user, subscription):
                return JsonResponse(
                    {
                        "detail": "Rate limit exceeded. Upgrade your "
                                  "subscription for higher limits."
                    },
                    status=429,
                )

        return view_func(*args, **kwargs)

    return wrapped_view
