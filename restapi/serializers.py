from rest_framework import serializers

import core.models  # noqa: F401
from core.models import Shoe
from members.models import CustomUser


class ShoeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shoe
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("email", "password")
        extra_kwargs = {"password": {"write_only": True, "min_length": 5}}

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)
