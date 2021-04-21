from typing import List
from typing import Optional

from django.urls import reverse
import django_filters
import graphene
from graphene import relay
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from church import models
from prayer.models import PrayerRequest


class UserType(DjangoObjectType):
    is_chatmod = graphene.Boolean(source="is_chatmod", required=True)
    groups = graphene.List(graphene.String)

    class Meta:
        model = models.User
        fields = ["username", "first_name", "last_name"]

    def resolve_groups(self, info, *args, **kwargs) -> List[str]:
        return self.group_names


class AuthMutation(graphene.Mutation):
    class Arguments:
        username = graphene.String()
        password = graphene.String()
        token = graphene.String()

    def mutate(self, info, username, password, token):
        print(username, password, token)
        return AuthMutation()


class ServicePageNode(DjangoObjectType):
    pk = graphene.Int(source="pk", required=True)
    bulletin = graphene.JSONString(required=False)
    edit_url = graphene.String(required=False)

    class Meta:
        model = models.ServicePage
        only_fields = ["id", "title", "slug", "description", "date", "stream_link"]
        filter_fields = ["id", "title", "slug"]
        interfaces = (relay.Node,)

    def resolve_bulletin(self, info, *args, **kwargs) -> Optional[dict]:
        user = info.context.user
        if user.is_authenticated:
            return self.bulletin_dict
        return None

    def resolve_edit_url(self, info, *args, **kwargs) -> Optional[str]:
        user = info.context.user
        if user.is_authenticated and any(
            g in user.group_names for g in {"Editors", "Moderators"}
        ):
            return reverse("wagtailadmin_pages:edit", args=[self.pk])
        else:
            return None


class PrayerRequestNode(DjangoObjectType):
    pk = graphene.Int(source="pk", required=True)

    class Meta:
        model = PrayerRequest
        only_fields = [
            "author",
            "provided_name",
            "note",
            "state",
            "body_visibility",
            "body",
            "created_at",
            "include_name",
        ]
        filter_fields = ["id", "created_at", "updated_at", "state"]
        interfaces = (relay.Node,)


class PrayerRequestFilter(django_filters.FilterSet):
    class Meta:
        model = PrayerRequest
        fields = ["created_at", "updated_at", "state"]


class AddPrayerRequest(graphene.Mutation):
    class Arguments:
        body = graphene.String()
        body_visibility = graphene.String()
        include_name = graphene.Boolean()
        display_name = graphene.String()

    ok = graphene.Boolean()
    prayer_request = graphene.Field(PrayerRequestNode)

    def mutate(root, info, body, body_visibility, include_name, display_name):
        user = info.context.user
        if user.is_authenticated:
            prayer_request = PrayerRequest.objects.create(
                author=user,
                body=body,
                body_visibility=body_visibility,
                include_name=include_name,
                provided_name=display_name,
            )
            ok = True
            return AddPrayerRequest(prayer_request=prayer_request, ok=ok)
        else:
            raise NotImplementedError


class Mutation(graphene.ObjectType):
    add_prayer_request = AddPrayerRequest.Field()


class Query(graphene.ObjectType):
    current_user = graphene.Field(UserType)
    current_service = graphene.Field(ServicePageNode, required=True)
    service = relay.Node.Field(ServicePageNode)
    services = DjangoFilterConnectionField(ServicePageNode)
    prayer_requests = DjangoFilterConnectionField(
        PrayerRequestNode, required=True, filterset_class=PrayerRequestFilter
    )

    def resolve_current_user(self, info, **kwargs) -> Optional[models.User]:
        user = info.context.user
        return user if user.is_authenticated else None

    def resolve_current_service(self, info, **kwargs) -> models.ServicePage:
        return models.ServicePage.current_service_page()

    def resolve_prayer_requests(self, info, **kwargs):
        user = info.context.user
        if user.is_authenticated:
            return PrayerRequest.for_user(user)
        else:
            return PrayerRequest.objects.none()


schema = graphene.Schema(mutation=Mutation, query=Query)
