from django.urls import path
from prayer import views

urlpatterns = [
    path(
        "react/<str:pr_id>/<str:emoji>",
        views.prayer_request_react,
        name="prayer-request-react",
    ),
    path(
        "delete/<str:pr_id>", views.delete_prayer_request, name="delete-prayer-request"
    ),
    path(
        "mv-to-jar/<str:pr_id>",
        views.prayer_request_mv_to_jar,
        name="mv-to-jar-prayer-request",
    ),
    path(
        "rm-from-jar/<str:pr_id>",
        views.prayer_request_rm_from_jar,
        name="rm-from-jar-prayer-request",
    ),
]
