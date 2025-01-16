from http import HTTPStatus
from http.client import responses

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from SneakSyncHub import settings
from core.auth.auth_utils import (
    get_access_token,
    set_httponly_cookie,
    UserTokenService,
    set_authentication_cookie,
    login_authenticated_user,
)
from core.utils import get_user_profile
from members.models import CustomUser
from restapi.serializers import UserSerializer, UserProfileSerializer


class SignupUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return Response(
                {"message": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the email is already registered
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {"message": "Email is already registered."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a new user
        user = CustomUser.objects.create_user(email=email, password=password)
        user.save()

        # Authenticate and log in the user after successful registration
        authenticated_user = authenticate(email=email, password=password)
        response = login_authenticated_user(authenticated_user, request)

        return response


class LoginUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")
        user = authenticate(email=email, password=password)

        response = login_authenticated_user(user, request)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logout(request)
        response = Response(
            {"status": HTTPStatus.OK, "message": "Logged out successfully"}
        )
        response.delete_cookie("access_token")
        response.delete_cookie("is_authenticated")
        return response

    def post(self, request):
        logout(request)
        response = Response(
            {"status": HTTPStatus.OK, "message": "Logged out successfully"}
        )
        response.delete_cookie("access_token")
        response.delete_cookie("is_authenticated")
        return response


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_profile = get_user_profile(request)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)


class UserView(APIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        token_service = UserTokenService()
        access_token = request.COOKIES.get("access_token")
        validated_token = token_service.get_validated_token(access_token)
        user = token_service.get_user_from_token(validated_token)
        serializer = UserSerializer(user)

        return Response({"status": HTTPStatus.OK, "user": serializer.data})
