from http import HTTPStatus

from django.contrib.auth import login, logout, authenticate
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from SneakSyncHub import settings
from core.auth.auth_utils import get_access_token, set_httponly_cookie, \
    UserTokenService, set_authentication_cookie
from restapi.serializers import UserSerializer


class CreateUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({
                "status": HTTPStatus.CREATED
            })
        else:
            return Response({"errors": serializer.errors,
                             "status": HTTPStatus.BAD_REQUEST})


class ObtainAccessToken(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)

        if user and user.is_active:
            login(request, user)
            access_token = get_access_token(user)
            response = Response(data={
                "status": HTTPStatus.OK,
                'message': "Authentication Successful!",
            })
            set_httponly_cookie(access_token, response)
            set_authentication_cookie(response)
            return response
        else:
            return Response(
                {"status": 403,
                 "message": "Invalid credentials"
                 })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logout(request)
        response = Response({"status": HTTPStatus.OK})
        response.delete_cookie('access_token')
        response.delete_cookie('is_authenticated')
        return response

    def post(self, request):
        logout(request)
        response = Response({"status": HTTPStatus.OK})
        response.delete_cookie('access_token')
        response.delete_cookie('is_authenticated')
        return response


class UserProfileView(APIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        token_service = UserTokenService()
        access_token = request.COOKIES.get('access_token')
        validated_token = token_service.get_validated_token(access_token)
        user = token_service.get_user_from_token(validated_token)
        serializer = UserSerializer(user)

        return Response({
            "status": HTTPStatus.OK,
            "user": serializer.data
        })
