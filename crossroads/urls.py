from django import shortcuts
from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls

from church import views
from search import views as search_views

from .schema import schema


def spa_view(request):
    return shortcuts.render(request, "index.html", {})


urlpatterns = [
    url(r"^django-admin/", admin.site.urls),
    url(r"^admin/", include(wagtailadmin_urls)),
    url(r"^documents/", include(wagtaildocs_urls)),
    url(r"^search/$", search_views.search, name="search"),
    path("chat/", include("chat.urls")),
    path("church/", include("church.urls")),
    path("comments/", include("comments.urls")),
    path("prayer/", include("prayer.urls")),
    path("prayer-requests/", views.prayer_requests_page, name="prayer_requests_page"),
    path("profile/", views.profile, name="profile"),
    url(
        r"^login/$",
        auth_views.LoginView.as_view(template_name="admin/login.html"),
        name="login",
    ),
    url(r"^logout/$", auth_views.LogoutView.as_view(), name="logout"),
    path("gql/", csrf_exempt(GraphQLView.as_view(graphiql=True, schema=schema))),
]


if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


urlpatterns = urlpatterns + [
    url(r"", spa_view, name="spa_view"),
]
