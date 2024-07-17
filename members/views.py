from http import HTTPStatus

from django.contrib.auth import login, logout, authenticate
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth.auth_utils import get_access_token, set_httponly_cookie
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
            response = Response({
                "status": HTTPStatus.OK,
            })
            set_httponly_cookie(access_token, response)
            return response
        else:
            return Response(
                {"status": "novibe"})


class LogoutView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logout(request)
        response = Response({"status": HTTPStatus.OK})
        response.delete_cookie('access_token')
        return response

    def post(self, request):
        logout(request)
        response = Response({"status": HTTPStatus.OK})
        response.delete_cookie('access_token')
        return response


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response({"status": HTTPStatus.OK,
                         "user": serializer.data})
