from http import HTTPStatus
from typing import Dict

from django.contrib.auth import login
from django.http import HttpRequest
from rest_framework import exceptions
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken, Token

from SneakSyncHub import settings
from members.models import CustomUser


def login_authenticated_user(user: CustomUser,
                             request: HttpRequest) -> Response:
    if user and user.is_active:
        login(request, user)
        access_token = get_access_token(user)
        response = Response(data={
            "status": HTTPStatus.OK,
            'message': "Operation Successful!",
        })
        set_httponly_cookie(access_token, response)
        set_authentication_cookie(response)
        print(response)
        return response
    else:
        return Response(
            {"status": 403,
             "message": "Invalid credentials"
             })


def set_httponly_cookie(access_token: Token, response: Response):
    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIES'],
        expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        max_age=1800,
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        samesite='None',
        value=access_token,
    )


def set_authentication_cookie(response: Response):
    response.set_cookie(
        key='is_authenticated',
        value='true',
        expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        samesite='None',
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
    )


def get_tokens(user: CustomUser) -> Dict[str, str]:
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_access_token(user: CustomUser) -> Token:
    refresh = RefreshToken.for_user(user)
    acess_token = refresh.access_token
    return acess_token


class UserTokenService(JWTAuthentication):
    def get_validated_token(self, raw_token: bytes) -> Token:
        token = super().get_validated_token(raw_token)
        return token

    def get_user_from_token(self, token: Token) -> CustomUser:
        user = super().get_user(token)
        return user


class HttponlyCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return None

        validated_token = self.get_validated_token(access_token)

        try:
            user = self.get_user(validated_token), validated_token
        except CustomUser.DoesNotExist:
            raise exceptions.AuthenticationFailed('No such user')

        return user
