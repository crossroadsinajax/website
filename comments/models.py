from django.conf import settings
from django.db import models


class Comment(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey("Comment", on_delete=models.SET_NULL, null=True, related_name="children")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, models.CASCADE)
    body = models.CharField(max_length=16384)
    # reactions?

