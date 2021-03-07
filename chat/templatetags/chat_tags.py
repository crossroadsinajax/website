from django import template

register = template.Library()


@register.inclusion_tag("chat.html", takes_context=True)
def chat_html(context, chat_id):
    context.update(dict(chat_id=chat_id))
    return context


@register.inclusion_tag("chat.js", takes_context=True)
def chat_js(context, chat_id):
    context.update(dict(chat_id=chat_id))
    return context
