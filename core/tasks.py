import os
from datetime import date

from celery import shared_task
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

from core.models import Shoe, ShoePriceHistory


@shared_task
def update_price_history():
    today = date.today()
    shoes = Shoe.objects.all()
    for shoe in shoes:
        ShoePriceHistory.objects.create(
            shoe=shoe, price=shoe.price, date_recorded=today
        )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I am your bot.")


@shared_task
def run_telegram_bot():
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    application = ApplicationBuilder().token(bot_token).build()

    application.add_handler(CommandHandler("start", start))

    print("Starting Telegram Bot...")
    application.run_polling()
