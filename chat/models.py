import logging

from django.conf import settings
from django.core import exceptions as exc
from django.db import models
from django.utils.functional import cached_property

from church.models import User


log = logging.getLogger(__name__)


class ChatMessageReact(models.Model):
    item = models.ForeignKey(
        "ChatMessage", related_name="reacts", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="chat_reacts", on_delete=models.CASCADE
    )
    type = models.CharField(max_length=32)


class ChatMessageTag(models.Model):
    value = models.CharField(max_length=32)
    item = models.ForeignKey(
        "ChatMessage", related_name="tags", on_delete=models.CASCADE
    )


class ChatMessage(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.CharField(max_length=2048)
    chat = models.ForeignKey("Chat", related_name="messages", on_delete=models.CASCADE)

    @cached_property
    def aggreacts(self):
        # Aggregate common reacts into a dict(<emoji> = dict(count=<int>, reactors=[username]))
        aggr = {}

        reacts = self.reacts.all()

        for react in reacts:
            if react.type not in aggr:
                aggr[react.type] = dict(
                    count=0,
                    reactors=[],
                )
            count = aggr[react.type]["count"]
            aggr[react.type]["count"] = count + 1
            aggr[react.type]["reactors"].append(react.user.display_name)

        return aggr

    @classmethod
    def react(cls, user, msg_id, type):
        # Toggle a reaction
        msg = cls.objects.get(pk=msg_id)
        prev_reacts = msg.reacts.filter(user=user, item=msg, type=type)
        if len(prev_reacts):
            for react in prev_reacts:
                react.delete()
        else:
            msg.reacts.create(user=user, item=msg, type=type)

        try:
            del msg.aggreacts
        except AttributeError:
            pass
        return msg

    @staticmethod
    def _get_tags(s):
        return [w for w in s.split(" ") if w.startswith("#")]

    @staticmethod
    def _alias_tag(tag: str):
        tag = tag.lower()
        if tag.startswith("#"):
            tag = tag[1:]

        if tag in ["prayerrequest", "pr", "prayer", "pray", "pryr", "pry", "pyr", "p"]:
            return "pr"
        if tag in ["q", "qna", "qa", "question", "q&a", "question"]:
            return "q"
        return tag

    def add_tag(self, raw_tag: str):
        tag = self._alias_tag(raw_tag)
        t, _ = ChatMessageTag.objects.get_or_create(item=self, value=tag)
        try:
            del self.raw_tags
        except AttributeError:
            pass
        return t

    def add_tags(self, raw_tags=None):
        # Only meant to be called with #tags in place (not stripped yet)
        if isinstance(raw_tags, str):
            tags = self._get_tags(raw_tags)
        elif isinstance(raw_tags, []):
            tags = []
            for s in raw_tags:
                tags += self._get_tags(s)
        else:
            tags = self._get_tags(self.body)

        # create tags for the message
        for tag in tags:
            self.add_tag(tag)

    @classmethod
    def toggle_tag(cls, raw_tag, msg_id):
        cm = cls.objects.get(pk=msg_id)
        tag = cls._alias_tag(raw_tag)
        if tag in cm.raw_tags:
            tags = ChatMessageTag.objects.filter(item=cm, value=cls._alias_tag(tag))
            for t in tags:
                t.delete()
        else:
            cm.add_tags(raw_tag)

        try:
            del cm.raw_tags
        except AttributeError:
            pass
        return cm

    @cached_property
    def raw_tags(self):
        return [tag.value for tag in self.tags.all()]

    def __json__(self):
        return dict(
            id=self.pk,
            author=self.author.display_name,
            body=self.body,
            created_at=self.created_at.strftime("%s"),
            reacts=self.aggreacts,
            tags=self.raw_tags,
        )


class ChatLog(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    chat = models.ForeignKey("Chat", related_name="logs", on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True
    )
    type = models.CharField(max_length=16)
    body = models.CharField(max_length=4096)

    def __json__(self):
        return dict(
            id=self.pk,
            type=self.type,
            user_id=self.user.pk,
            body=self.body,
            created_at=self.created_at.strftime("%s"),
        )


class Chat(models.Model):
    chat_id = models.CharField(max_length=1024)

    def add_message(self, user, body=None):
        if not user.is_member and not user.is_guest:
            raise exc.PermissionDenied("%r" % user)

        cm = ChatMessage.objects.create(
            author=user,
            body=body,
            chat=self,
        )
        cm.add_tags(body)
        try:
            del self.messages_json
        except AttributeError:
            pass
        return cm

    def delete_message(self, user, msg_id):
        if not user.is_chatmod:
            raise exc.PermissionDenied("%r" % user)

        msg = ChatMessage.objects.get(pk=msg_id)
        msg.delete()
        return msg

    def add_log(self, type, user, body):
        log = ChatLog.objects.create(chat=self, user=user, body=body)
        try:
            del self.logs_json
        except AttributeError:
            pass
        return log

    @cached_property
    def messages_json(self):
        # TODO: migrate chatbot messages into logs
        chatbot = User.objects.get(username="chatbot")
        return [
            msg.__json__()
            for msg in self.messages.select_related("author")
            .prefetch_related("tags")
            .prefetch_related("reacts__user")
            .exclude(author=chatbot)
        ]

    @cached_property
    def logs_json(self):
        # return [log.__json__() for log in self.logs.all()]
        return []

    def __json__(self):
        return dict(
            messages=self.messages_json,
            log=self.logs_json,
        )
