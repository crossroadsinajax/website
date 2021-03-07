import functools

from django import http, shortcuts
from django.core import exceptions as ex

from comments import models as mods, forms


def authenticated(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        request = args[0]
        if not request.user or not request.user.is_authenticated:
            raise ex.PermissionDenied("")
        return f(*args, **kwargs)

    return wrapper


@authenticated
def create_comment(request, thread_id, parent_id=None):
    if request.method == "POST":
        form = forms.CommentForm(request.POST)

        if form.is_valid():
            if parent_id is None:
                parent = None
            else:
                parent = mods.Comment.objects.get(pk=parent_id)

            comment = mods.Comment.objects.create(
                author=request.user,
                body=form.cleaned_data["body"],
                thread_id=thread_id,
                parent=parent,
            )
            return http.HttpResponseRedirect(
                f"{request.META.get('HTTP_REFERER')}{'#comment'}{comment.pk}"
            )
    else:
        form = forms.CommentForm()
        return shortcuts.render(
            request,
            "comment_form.html",
            {"form": form, "thread_id": thread_id, "parent_id": parent_id},
        )


@authenticated
def delete_comment(request, comment_id):
    comment = mods.Comment.objects.get(pk=comment_id)
    if comment.author != request.user:
        raise ex.PermissionDenied("")
    comment.delete()
    return http.HttpResponseRedirect(request.META.get("HTTP_REFERER"))


@authenticated
def view_thread(request, thread_id):
    all_comments = mods.Comment.objects.filter(thread_id=thread_id)
    parents = [(p, 0) for p in all_comments.filter(parent=None).order_by("created_at")]
    html = []
    last_indent = None
    while len(parents):
        p, indent = parents.pop(0)
        if last_indent is not None:
            if last_indent < indent:
                for _ in range(last_indent, indent):
                    html.append("in")
            elif last_indent > indent:
                for _ in range(indent, last_indent):
                    html.append("out")

        html.append((p, indent))
        last_indent = indent
        parents = [(c, indent + 1) for c in p.children.order_by("created_at")] + parents

    # django templates don't support counting loops
    if html:
        last_indent = html[-1][1]
        for i in range(0, last_indent):
            html.append("out")

    html = [p[0] if isinstance(p, tuple) else p for p in html]
    form = forms.CommentForm()
    return shortcuts.render(
        request,
        "raw_comments_list.html",
        {"form": form, "thread_id": thread_id, "html": html},
    )


@authenticated
def view_comment(request, thread_id):
    all_comments = mods.Comment.objects.filter(thread_id=thread_id)
    print(all_comments)
