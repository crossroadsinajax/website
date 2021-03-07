from django.shortcuts import render


def view(request, ch_id):
    return render(
        request,
        "chat.html",
        dict(
            chat_id=ch_id,
            initial_messages=[],
        ),
    )


def stream(request, ch_id):
    return render(
        request,
        "chat.html",
        dict(
            chat_id=ch_id,
            initial_messages=[],
        ),
    )
