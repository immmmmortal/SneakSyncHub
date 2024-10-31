from rest_framework import serializers

import core.models  # noqa: F401
from core.models import Shoe, ShoePriceHistory, ShoesNews
from members.models import CustomUser


class ShoePriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoePriceHistory
        fields = ['price', 'date_recorded']


class ShoeSerializer(serializers.ModelSerializer):
    price_history = ShoePriceHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Shoe
        fields = ['id', 'name', 'price', 'url', 'image', 'article',
                  'sizes',
                  'parsed_from', 'created_at', 'count', 'description',
                  'price_history']


class ShoesNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoesNews
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("email", "password")
        extra_kwargs = {"password": {"write_only": True, "min_length": 5}}

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
