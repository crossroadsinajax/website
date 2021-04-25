from itertools import chain

from django import template

from church import models

register = template.Library()


@register.inclusion_tag("feed.html", takes_context=True)
def feed_html(context):
    feed_types = [
        models.DailyReadingPage,
        models.ServicePage,
    ]

    feed_items = list(
        chain.from_iterable(
            [cls.objects.filter(live=True, show_in_menus=True) for cls in feed_types]
        )
    )
    feed_items = sorted(feed_items, key=lambda x: x.date, reverse=True)
    context.update(dict(items=feed_items))
    return context
