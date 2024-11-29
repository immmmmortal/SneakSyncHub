from datetime import date

from celery import shared_task

from core.models import Shoe, ShoePriceHistory


@shared_task
def update_price_history():
    today = date.today()
    shoes = Shoe.objects.all()
    for shoe in shoes:
        ShoePriceHistory.objects.create(
            shoe=shoe, price=shoe.price, date_recorded=today
        )


