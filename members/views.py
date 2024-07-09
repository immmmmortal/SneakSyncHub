from http import HTTPStatus

from django.contrib.auth import login, logout, authenticate
# knox imports
# rest_framework imports
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core.utils import get_tokens_for_user
from restapi.serializers import UserSerializer


# Create your views here.


class SignUpUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            login(request, user)
            return Response({"status": HTTPStatus.CREATED,
                             "refresh": str(refresh),
                             "access": str(refresh.access_token)})
        else:
            return Response({"errors": serializer.errors,
                             "status": HTTPStatus.BAD_REQUEST})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)

        if user and user.is_active:
            tokens = get_tokens_for_user(user)
            login(request, user)
            return Response(
                {"status": HTTPStatus.OK,
                 "tokens": tokens})
        else:
            return Response(
                {"status": HTTPStatus.NOT_FOUND})


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        logout(request)
        return Response({"status": HTTPStatus.OK})

    def post(self, request):
        logout(request)
        return Response({"status": HTTPStatus.OK})


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response({"status": HTTPStatus.OK,
                         "user": serializer.data})
