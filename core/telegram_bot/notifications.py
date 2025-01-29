# notifications.py
import requests

from SneakSyncHub.settings import env
from members.models import UserProfile, ShoeNotificationPreference

BOT_TOKEN = env("BOT_TOKEN")


def notify_user(user, shoe):
    """Send a notification to the user via Telegram."""
    try:
        # Retrieve the Telegram chat ID from the user profile
        user_profile = UserProfile.objects.get(user=user)
        chat_id = user_profile.telegram_chat_id
        if not chat_id:
            return  # Skip if the user doesn't have a linked Telegram account

        # Get the user's notification preference for this shoe
        try:
            preference = ShoeNotificationPreference.objects.get(user=user, shoe=shoe)
            price_info = (
                preference.get_user_preference_price()
            )  # Get desired price and final price
        except ShoeNotificationPreference.DoesNotExist:
            return  # If no preference exists for this user/shoe, skip

        # Prepare the notification message
        message = (
            f"🎉 Good news, {user.email}!\n\n"
            f"The price for {shoe.name} has dropped to {price_info['final_price']}!\n"
            f"Your desired price: {price_info['desired_price']}\n"
            f"Check it out here: {shoe.url}"
        )

        # Send the message using Telegram's API
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML",
        }
        response = requests.post(url, json=payload)

        # Log the result for debugging
        if response.status_code != 200:
            print(f"Failed to send notification: {response.json()}")
    except Exception as e:
        print(f"Error notifying user: {e}")
