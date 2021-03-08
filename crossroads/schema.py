import graphene

from graphene_django.types import DjangoObjectType

from church import models


class UserType(DjangoObjectType):
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


class Query(graphene.ObjectType):
    current_user = graphene.Field(UserType)

    def resolve_current_user(self, info, **kwargs):
        if info.context.user.is_authenticated:
            return info.context.user
        else:
            return None


schema = graphene.Schema(query=Query)
