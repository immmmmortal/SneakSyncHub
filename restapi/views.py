from rest_framework import viewsets, permissions
import core.models  # noqa: F401
from core.models import Shoe
from .serializers import ShoeSerializer


class ShoeViewSet(viewsets.ModelViewSet):
    queryset = Shoe.objects.all()
    serializer_class = ShoeSerializer
    permission_classes = [permissions.IsAuthenticated]
