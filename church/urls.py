from django.urls import path

from church import views

urlpatterns = [
    path(
        "add-pr-to-next-service/<str:pr_id>",
        views.add_pr_to_next_service,
        name="add-pr-to-next-service",
    ),
    path(
        "rm-pr-from-service/<str:pr_id>/<str:sp_id>",
        views.rm_pr_from_service,
        name="rm-pr-from-service",
    ),
    path("edit-user/", views.edit_user, name="edit-user"),
]
