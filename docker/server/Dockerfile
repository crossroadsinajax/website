FROM python:3.9-slim

RUN apt-get update && apt-get install -y git libjpeg-turbo-progs zlib1g-dev gcc fish
RUN pip install pipenv==2020.11.15
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy pipenv files so builds will be cached if the files are unchanged.
COPY Pipfile.lock Pipfile /app/

# Install packages
RUN pipenv install --dev

# Can be overridden by a volume mount.
COPY . /app

# Will output the static files to /app/static.
RUN pipenv run python manage.py collectstatic --no-input
