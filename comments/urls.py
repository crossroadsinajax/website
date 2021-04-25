from django.urls import path

from comments import views

urlpatterns = [
    path(
        "create/<str:thread_id>/<str:parent_id>",
        views.create_comment,
        name="create-comment",
    ),
    path("create/<str:thread_id>/", views.create_comment, name="create-comment"),
    path("delete/<str:comment_id>/", views.delete_comment, name="delete-comment"),
    path("thread/<str:thread_id>/", views.view_thread, name="view-thread"),
    path("comment/<str:comment_id>/", views.view_comment, name="view-comment"),
]
