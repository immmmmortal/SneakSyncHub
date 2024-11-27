from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry

from .models import Shoe


@registry.register_document
class ShoeDocument(Document):
    class Index:
        name = 'shoes'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Shoe
        fields = [
            'name',
            'price',
            'sale_price',
            'url',
            'description',
            'image',
            'article',
            'sizes',
            'parsed_from',
            'created_at',
        ]

    def prepare_id(self, instance):
        # Ensure the ID field is included
        return instance.id

