import secrets
from typing import List

from asgiref.sync import async_to_sync
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.cache import cache
from django.db import models
from django.dispatch import receiver
from django.utils.functional import cached_property
from channels.layers import get_channel_layer
from modelcluster.fields import ParentalKey
from wagtail.core.models import Page, Orderable
from wagtail.core import fields as wtfields, blocks
from wagtail.documents.models import Document
from wagtail.documents.edit_handlers import DocumentChooserPanel
from wagtail.admin.edit_handlers import FieldPanel, InlinePanel, StreamFieldPanel
from wagtailmedia.blocks import AbstractMediaChooserBlock
import yarl

from prayer import models as pr_models
from comments import models as com_models


class User(AbstractUser):
    token = models.CharField(max_length=32)
    subscribe_daily_email = models.BooleanField(default=False)

    # override the username validator
    username_validator = UnicodeUsernameValidator()

    # def refresh_from_db(self, *args, **kwargs):
    #     self.invalidate_cached_properties()
    #     return super().refresh_from_db(*args, **kwargs)

    # def invalidate_cached_properties(self):
    #     for key, value in self.__class__.__dict__.items():
    #         if isinstance(value, cached_property):
    #             self.__dict__.pop(key, None)

    @cached_property
    def role_emoji(self):
        if self.is_superuser:
            return "🛠"
        groups = [g.name for g in self.groups.all()]
        if "pastor" in groups:
            return "😎"
        elif "elder" in groups:
            return "🤓"
        elif "chat_mod" in groups:
            return "🧐"
        return ""

    @cached_property
    def display_name(self):
        if self.last_name:
            display_name = f"{self.first_name} {self.last_name[0]}"
        else:
            display_name = f"{self.first_name}"

        return display_name

    @cached_property
    def group_names(self) -> List[str]:
        return [g.name for g in self.groups.all()]

    @cached_property
    def is_chatmod(self) -> bool:
        return self.is_superuser or "chatmod" in [g.name for g in self.groups.all()]

    @cached_property
    def is_pastor(self) -> bool:
        return "pastor" in self.group_names

    @cached_property
    def is_streamer(self) -> bool:
        return "streamer" in self.group_names

    @cached_property
    def is_member(self) -> bool:
        return "member" in self.group_names

    @cached_property
    def is_guest(self) -> bool:
        return "guest" in self.group_names

    @cached_property
    def is_mod(self) -> bool:
        return "chat_mod" in self.group_names

    def get_next_service_link(self):
        service_page = ServicePage.current_service_page()

        # TODO: get the hostname dynamically
        stream_link = yarl.URL(
            f"https://crossroadsajax.church/gathering/{service_page.slug}"
        ).with_query(dict(mem=self.token))
        return str(stream_link)

    @classmethod
    def get_guest_next_service_link(cls):
        guest = cls.objects.get(username="guest")
        return guest.get_next_service_link()

    def get_services_link(self):
        link = yarl.URL("https://crossroadsajax.church/gatherings").with_query(
            dict(mem=self.token)
        )
        return str(link)


@receiver(models.signals.pre_save, sender=User)
def add_token(sender, instance, *args, **kwargs):
    if not instance.token:
        instance.token = secrets.token_hex(8)


@receiver(models.signals.post_save, sender=User)
def invalidate_cached_properties(sender, instance, *args, **kwargs):
    for key, value in instance.__class__.__dict__.items():
        if isinstance(value, cached_property):
            instance.__dict__.pop(key, None)


@receiver(models.signals.post_delete, sender=User)
def invalidate_user_auth(sender, instance, *args, **kwargs):
    cache.delete(instance.pk)


class ServiceMediaBlock(AbstractMediaChooserBlock):
    class Meta:
        template = "blocks/service_media_block.html"


class ServicesIndexPage(Page):
    intro = wtfields.RichTextField(blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro", classname="full")]

    @classmethod
    def service_pages(cls):
        return ServicePage.objects.in_menu().order_by("-date")


class IDListBlock(blocks.ListBlock):
    """Adds an ID to list items. Similarly to what's done
    for structblock children.
    """

    def get_prep_value(self, value):
        r = super().get_prep_value(value)
        for i in r:
            if "id" not in i:
                import uuid

                i["id"] = uuid.uuid4()
        return r


class IDStructBlock(blocks.StructBlock):
    """"""

    def to_python(self, value):
        self.child_blocks["id"] = blocks.CharBlock(required=False)
        r = super().to_python(value)
        if "id" in value:
            r["id"] = value["id"]
        return r

    def get_prep_value(self, value):
        # TODO: generate an ID here?
        r = super().get_prep_value(value)
        return r


class OfferingBlock(blocks.StructBlock):
    class Meta:
        template = "blocks/offering.html"


class BulletinItemBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    date = blocks.DateBlock(required=False)
    contact_name = blocks.CharBlock(required=False)
    contact_email = blocks.EmailBlock(required=False)
    contact_phone = blocks.CharBlock(max_length=20, required=False)
    body = blocks.RichTextBlock(blank=True)

    class Meta:
        template = "blocks/bulletin_item.html"


class BulletinSectionBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    items = blocks.ListBlock(BulletinItemBlock, label="Bulletin item")

    class Meta:
        template = "blocks/bulletin_section.html"


class WorshipSongBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    lyrics = blocks.RichTextBlock()

    class Meta:
        template = "blocks/worship_song.html"


class WorshipSectionBlock(blocks.StructBlock):
    worship_songs = blocks.ListBlock(WorshipSongBlock, label="Worship song")

    class Meta:
        template = "blocks/worship_section.html"


class AnnouncementsSectionBlock(blocks.StructBlock):
    pass


class SermonSectionBlock(blocks.StructBlock):
    title = blocks.CharBlock()
    speaker = blocks.CharBlock()
    slides_url = blocks.CharBlock()

    class Meta:
        template = "blocks/sermon_section.html"


class DiscussionItemBlock(IDStructBlock):
    title = blocks.CharBlock()
    content = blocks.RichTextBlock(required=False)

    class Meta:
        template = "blocks/discussion_item_section.html"

    def get_context(self, value, parent_context=None):
        ctx = super().get_context(value, parent_context=parent_context)
        ctx["item"] = self
        return ctx


class DiscussionSectionBlock(IDStructBlock):
    title = blocks.CharBlock(required=False, default="Discussion")
    items = IDListBlock(DiscussionItemBlock, label="Discussion item")

    class Meta:
        template = "blocks/discussion_section.html"

    def get_context(self, value, parent_context=None):
        ctx = super().get_context(value, parent_context=parent_context)
        return ctx


class HomePage(Page):
    def get_context(self, request):
        context = super().get_context(request)
        page = ServicePage.current_service_page()
        context["current_service_page"] = page
        return context


class ContentPageMixin:
    @property
    def pagetype(self):
        return self.__class__.__name__

    @property
    def getdescription(self):
        return ""


class ServicePage(Page, ContentPageMixin):
    date = models.DateField("Service date")
    description = wtfields.RichTextField(
        blank=True,
        default="Please join us for our Sunday service as we worship and listen to God's word.",
    )
    stream_link = models.URLField(default="", blank=True)
    public_stream_link = models.URLField(default="", blank=True)
    chat_enabled = models.BooleanField(default=True)
    weekly_theme = models.CharField(max_length=128, default="", blank=True)

    bulletin = wtfields.StreamField(
        [
            ("bulletin_section", BulletinSectionBlock(name="Bulletin Section")),
        ],
        blank=True,
    )

    # service = wtfields.StreamField([
    #     ('worship_section', WorshipSectionBlock(name="Worship Section")),
    #     ('announcements_section', AnnouncementsSectionBlock(name="Announcement Section")),
    #     ('sermon_section', SermonSectionBlock(name="Sermon Section")),
    #     ('discussion_section', DiscussionSectionBlock(name="Discussion Section")),
    #     # TODO
    #     # - polls/voting?
    #     # - feedback
    #     # - discussion
    # ])

    @property
    def getdescription(self):
        return self.description

    content_panels = Page.content_panels + [
        FieldPanel("date"),
        FieldPanel("stream_link"),
        FieldPanel("public_stream_link"),
        FieldPanel("description"),
        InlinePanel("documents", label="Documents"),
        FieldPanel("chat_enabled"),
        StreamFieldPanel("bulletin"),
        FieldPanel("weekly_theme"),
    ]

    prayer_requests = models.ManyToManyField(
        pr_models.PrayerRequest, related_name="services_pages"
    )

    def child_pages(self):
        pages = DailyReadingPage.objects.live().descendant_of(self).order_by("-date")
        return pages

    @classmethod
    def current_service_page(cls):
        return cls.objects.all().order_by("date").last()

    def add_prayer_request(self, pr):
        self.prayer_requests.add(pr)

    @property
    def email_attachments(self):
        return [
            doclink.document.file.file
            for doclink in self.documents.all()
            if doclink.include_in_email
        ]

    @property
    def bulletin_dict(self):
        # i dont like this
        if len(self.bulletin._raw_data):
            return self.bulletin._raw_data[0]
        else:
            return {}

    def get_context(self, request):
        context = super().get_context(request)
        context["self"] = self
        context["docs"] = self.documents.all()
        return context


@receiver(models.signals.post_save, sender=ServicePage)
def service_page_post_save(sender, instance, *args, **kwargs):
    layer = get_channel_layer()
    async_to_sync(layer.group_send)(
        f"service.{instance.pk}",
        {
            "type": "service.update",
        },
    )


class ServicePageDocumentLink(Orderable):
    page = ParentalKey(ServicePage, related_name="documents")
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="+")
    include_in_email = models.BooleanField(default=True)

    panels = [
        DocumentChooserPanel("document"),
        FieldPanel("include_in_email"),
    ]


# class FeaturetteBlock(blocks.StructBlock):
#     pass
#
#
# class ContentPage(Page):
#     content = wtfields.StreamField([
#         ("featurette", FeaturetteBlock(name="Featurettes")),
#     ])
#
#     content_panels = Page.content_panels + [
#         StreamFieldPanel("content"),
#     ]


class OurBeliefsPage(Page):
    pass


class SundayGatheringsPage(Page):
    pass


class PersonalStoriesPage(Page):
    pass


class DailyReadingPage(Page, ContentPageMixin):
    date = models.DateField("Date")
    video_link = models.URLField(default="", blank=True)
    content = wtfields.RichTextField(blank=True)
    reflection = wtfields.RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("date"),
        FieldPanel("content"),
        FieldPanel("video_link"),
        FieldPanel("reflection"),
    ]

    def get_context(self, request):
        context = super().get_context(request)
        return context

    @cached_property
    def getdescription(self):
        ncomments = com_models.Comment.objects.filter(thread_id=self.pk).count()
        if ncomments > 0:
            return f"{ncomments} comment{'s' if ncomments > 1 else ''}"
        else:
            return ""


class BasicPage(Page):
    updated_at = models.DateTimeField(auto_now=True)
    content = wtfields.RichTextField(blank=True)
    show_last_updated = models.BooleanField(default=True)

    stream = wtfields.StreamField(
        [
            ("offering", OfferingBlock(name="Offering Section")),
        ],
        blank=True,
    )

    content_panels = Page.content_panels + [
        FieldPanel("show_last_updated"),
        FieldPanel("content"),
        StreamFieldPanel("stream"),
    ]
