from django.urls import path

from . import views

urlpatterns = [
    path("view/<str:ch_id>", views.view, name="view-chat"),
]
