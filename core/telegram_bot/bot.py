# bot.py
import random
import string

import django
import environ
from django.core.cache import cache
from telegram import Update, Bot
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

from SneakSyncHub.settings import env

# Environment setup
environ.Env.read_env()
BOT_TOKEN = env("BOT_TOKEN")

# Ensure Django apps are loaded
django.setup()

# Import models here after calling django.setup()

# Import the notify_user function from another module (to avoid circular imports)

bot = Bot(token=BOT_TOKEN)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /start command, generate a code, and mark the user as active."""
    chat_id = update.message.chat_id
    username = update.message.from_user.username  # Get the Telegram username

    if not username:
        await update.message.reply_text(
            "You need to set a username in Telegram to link your account."
        )
        return

    # Generate a unique code
    unique_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

    # Store in cache
    cache.set(
        f"verification_code_{unique_code}", username, timeout=3600
    )  # 1-hour expiration

    # Send message
    link = "https://localhost/?telegramModal=true"
    message = (
        f"Hello {username} 👋\n\n"
        f"Your verification code is:\n\n"
        f"<code>{unique_code}</code>\n\n"
        "Follow these steps to link your Telegram account:\n"
        f'<a href="{link}">Click here to verify</a>'
    )

    await update.message.reply_text(message, parse_mode=ParseMode.HTML)


def send_recommendations(user, shoes):
    chat_id = user.telegram_chat_id  # Store Telegram chat ID in user model

    if not chat_id:
        return

    message = "👟 We found new sneaker recommendations for you:\n\n"
    for shoe in shoes:
        message += f"🔹 {shoe.name} - {shoe.price}$\n"
        message += f"[View Shoe]({shoe.url})\n\n"

    bot.send_message(chat_id=chat_id, text=message, parse_mode="Markdown")


def main():
    """Main entry point for the bot."""
    # Ensure Django apps are loaded
    django.setup()

    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))

    # Start polling for updates
    application.run_polling()


if __name__ == "__main__":
    main()
