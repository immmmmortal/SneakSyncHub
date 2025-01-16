import os
import sys

import random
import string
from django.core.cache import cache
from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SneakSyncHub.settings")
from django.conf import settings

BOT_TOKEN = settings.BOT_TOKEN


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /start command, generate a code, and mark the user as active."""
    chat_id = update.message.chat_id
    username = update.message.from_user.username  # Get the Telegram username

    if not username:
        await update.message.reply_text(
            "You need to set a username in Telegram to link your account."
        )
        return

    # Debug log: Check the retrieved username
    print(f"Retrieved username: {username}")

    # Generate a unique code
    unique_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

    # Debug log: Storing username in cache
    print(f"Storing in cache: {unique_code} -> {username}")
    cache.set(
        f"verification_code_{unique_code}", username, timeout=3600
    )  # 1-hour expiration

    # Use HTML to format the message
    link = "https://localhost/?telegramModal=true"
    message = (
        f"Hello {username} 👋\n\n"
        f"Your verification code is:\n\n"
        f"<code>{unique_code}</code>\n\n"
        "Follow these steps to link your Telegram account:\n"
        "1. Copy the code sent to you here.\n"
        "2. Paste it into the input field on the website:\n"
        f'<a href="{link}">Click here to verify</a>\n\n'
        "If you haven't initiated this process, return to the app and click the Connect button."
    )

    # Send message with parse_mode=ParseMode.HTML to render the hyperlink
    await update.message.reply_text(message, parse_mode=ParseMode.HTML)


def main():
    """Main entry point for the bot."""
    application = Application.builder().token(BOT_TOKEN).build()

    # Register handlers
    application.add_handler(CommandHandler("start", start))

    # Start polling for updates (messages)
    application.run_polling()


if __name__ == "__main__":
    main()
