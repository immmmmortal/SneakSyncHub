"""
Django settings for SneakSyncHub project.

Generated by 'django-admin startproject' using Django 5.0.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from datetime import timedelta
from pathlib import Path

import environ
from corsheaders.defaults import default_headers
from rest_framework.settings import api_settings

env = environ.environ.Env(
    # set casting, default value
    DEBUG=(bool, False)
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
environ.environ.Env.read_env(os.path.join(BASE_DIR, ".env"))
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env("DEBUG")

ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_elasticsearch_dsl",
    "members",
    "core",
    "restapi",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework.authtoken",
    "django_extensions",
    "SneakSyncHub",
    "django_celery_beat",
    'channels',
]

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(env("REDIS_HOST"), 6379)],  # Redis server location
        },
    },
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "SneakSyncHub.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "SneakSyncHub.wsgi.application"
ASGI_APPLICATION = "SneakSyncHub.asgi.application"

# settings.py


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {"default": env.db()}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators
AUTH_USER_MODEL = "members.CustomUser"
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation"
        ".UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation" ".MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation" ".CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation" ".NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": True,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": "WARNING",  # Change to WARNING to suppress SQL logs
            "propagate": False,
        },
        "django.utils": {  # Add this logger to suppress Django utils logs
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
        "elasticsearch_dsl": {  # Add this logger to suppress Elasticsearch logs
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
        "pandas": {  # Add this logger to suppress Pandas logs
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
        "jedi": {  # Add this logger to suppress Jedi logs
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}


LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# settings.py
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f'redis://{env("REDIS_HOST")}:6379/1',
        # Adjust according to your Redis config
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field


SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

RATE_LIMITS = {
    "free": 10,
    "premium": 20,
}
RATE_LIMIT_WINDOW = 3600  # Time window in seconds (1 hour)

CORS_ALLOWED_ORIGINS = [
    "https://localhost",
    "https://localhost:3000",
]

CORS_ALLOW_HEADERS = (
    *default_headers,
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
    "set-cookie",
    "Set-Cookie",
)

CORS_EXPOSE_HEADERS = [
    "Set-Cookie",
    "set-cookie",
]

CORS_ALLOW_CREDENTIALS = True

CHANNELS_WS_PROTOCOLS = ["ws", "wss"]  # Allow both WebSocket protocols

CSRF_TRUSTED_ORIGINS = [
    "https://localhost:3000",
    "http://localhost:3000",  # Add http as well
]

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "core.auth.auth_utils.HttponlyCookieAuthentication",
    ),
}

SIMPLE_JWT = {
    "AUTH_COOKIES": "access_token",
    "AUTH_COOKIE_SECURE": True,
    "AUTH_COOKIE_HTTP_ONLY": True,
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
}

ELASTICSEARCH_DSL = {
    "default": {
        "hosts": f"https://{env('ES_HOST')}:9200",
        "http_auth": ("elastic", env("ELASTIC_SEARCH_PASSWORD")),
        "ca_certs": "certificates/elastic_search/http_ca.crt",
        "verify_certs": False,
    }
}

# settings.py
CELERY_BROKER_URL = f'redis://{env("CELERY_HOST")}:6379/0'  # Redis broker URL
CELERY_RESULT_BACKEND = f'redis://{env("CELERY_HOST")}:6379/0'  # Redis
# result backend URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
