from django.apps import AppConfig
from django_elasticsearch_dsl.signals import RealTimeSignalProcessor
from elasticsearch_dsl.connections import connections


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Pass the Elasticsearch connections to the RealTimeSignalProcessor
        signal_processor = RealTimeSignalProcessor(connections=connections)
        # Set up signal processor to automatically handle model changes
        signal_processor.setup()
