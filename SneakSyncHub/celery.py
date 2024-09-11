from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SneakSyncHub.settings')

app = Celery('SneakSyncHub')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Add periodic task for the update_price_history function
app.conf.beat_schedule = {
    'update-shoe-price-history-daily': {
        'task': 'core.tasks.update_price_history',
        'schedule': crontab(minute='59', hour='23'),
        # This runs every day at 23:59
    },
}


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
