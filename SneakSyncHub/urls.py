from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, \
    TokenRefreshView

urlpatterns = [
                  path("admin/", admin.site.urls),
                  path("api/", include("members.urls")),
                  path("token", TokenObtainPairView.as_view(),
                       name="token_obtain_pair"),
                  path("refresh/", TokenRefreshView.as_view(),
                       name="token_refresh"),
                  path("api/", include("core.urls")),
              ] + static(settings.STATIC_URL,
                         document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
