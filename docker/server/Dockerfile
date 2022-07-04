FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    git \
    libjpeg-turbo-progs \
    libpq-dev \
    postgresql \
    python3-dev \
    zlib1g-dev \
    gcc
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy requirements file so builds will be cached if the file is unchanged.
COPY requirements.txt /app/

# Install packages
RUN pip install -r requirements.txt

# Can be overridden by a volume mount.
COPY . /app
