import graphene
from graphene import relay
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from church import models


class UserType(DjangoObjectType):
    is_chatmod = graphene.Boolean(source="is_chatmod", required=True)

    class Meta:
        model = models.User
        fields = ["username", "first_name", "last_name"]


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

    class Meta:
        model = models.ServicePage
        only_fields = ["id", "title", "slug", "description", "date", "stream_link"]
        filter_fields = ["id", "title", "slug"]
        interfaces = (relay.Node,)


class Query(graphene.ObjectType):
    current_user = graphene.Field(UserType, required=True)
    service = relay.Node.Field(ServicePageNode)
    services = DjangoFilterConnectionField(ServicePageNode)

    def resolve_current_user(self, info, **kwargs):
        # Always return a user.
        # When a user is not authenticated then an AnonymousUser will be returned.
        return info.context.user


schema = graphene.Schema(query=Query)
