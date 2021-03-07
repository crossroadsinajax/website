FROM python:3.9-slim

RUN apt-get update && apt-get install -y git libjpeg-turbo-progs zlib1g-dev gcc fish
RUN pip install poetry==1.1.4
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy poetry files so builds will be cached if the files are unchanged.
COPY poetry.lock pyproject.toml /app/

# Install packages globally
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

# Can be overridden by a volume mount.
COPY . /app

# Will output the static files to /app/static.
RUN python manage.py collectstatic --no-input
