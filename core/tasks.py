from datetime import date

from celery import shared_task

from core.models import Shoe
from core.models import ShoePriceHistory
from core.telegram_bot.bot import notify_user
from members.models import ShoeNotificationPreference


@shared_task
def update_price_history():
    today = date.today()
    shoes = Shoe.objects.all()
    for shoe in shoes:
        ShoePriceHistory.objects.create(
            shoe=shoe, price=shoe.price, date_recorded=today
        )


@shared_task
def check_price_updates():
    shoes = Shoe.objects.all()
    for shoe in shoes:
        preferences = ShoeNotificationPreference.objects.filter(shoe=shoe)
        for preference in preferences:
            if shoe.sale_price and shoe.sale_price <= preference.desired_price:
                notify_user(preference.user, shoe)
            elif shoe.price <= preference.desired_price:
                notify_user(preference.user, shoe)
