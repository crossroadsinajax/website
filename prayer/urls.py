from django.urls import path
from prayer import views

urlpatterns = [
    path(
        "react/<str:pr_id>/<str:emoji>",
        views.prayer_request_react,
        name="prayer-request-react",
    ),
]
