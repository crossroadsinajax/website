FROM python:3.9-slim

RUN apt-get update && apt-get install -y git libjpeg-turbo-progs zlib1g-dev gcc fish
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy requirements file so builds will be cached if the file is unchanged.
COPY requirements.txt /app/

# Install packages
RUN pip install -r requirements.txt

# Can be overridden by a volume mount.
COPY . /app

# Will output the static files to /app/static.
RUN python manage.py collectstatic --no-input
