from rest_framework import serializers
import core.models  # noqa: F401
from core.models import Shoe


class ShoeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Shoe
        fields = ["name", "sizes", "price", "url", "image", "article"]

    def create(self, validated_data) -> Shoe:
        return Shoe.objects.create(**validated_data)
