# crossroads website

> we'll CROSS that bridge when we get der

# dev

## running the app

```bash
cp docker-compose.override.yml.example docker-compose.override.yml

docker-compose up -d --build
```

The app will run by default on port 8000. This can be configured in
`docker-compose.override.yml`.

## adding a frontend dependency

```bash
docker-compose exec web yarn add <dep>
```

## adding a backend dependency

```bash
docker-compose exec app pip install <dep><version>
# example
# docker-compose run app pip install numpy~=1.20.0

docker-compose up -d --build
```

## generating graphql schema

```bash
# backend
docker-compose exec app python manage.py graphql_schema
# frontend
docker-compose exec web yarn run gql
```

## running migrations

```bash
# create migrations
docker-compose exec app python manage.py makemigrations
# apply migrations
docker-compose exec app python manage.py migrate
```

## useful commands

```bash
# get a python django shell
docker-compose exec app python manage.py shell_plus
# format python code
docker-compose exec app riot run -s fmt
# lint python code
docker-compose exec app riot run -s lint
# lint yaml
docker-compose exec app riot run -s yaml_lint

# format ts/js code
docker-compose exec web yarn fmt
# lint ts/js code
docker-compose exec web yarn lint

# execute a shell in the server container
docker-compose exec app fish

# get the logs from the app
docker-compose logs -f app web
```

## useful links

Note the trailing slashes in these URLs!

- graphiql explorer: http://localhost:8000/gql/
- wagtail admin http://localhost:8000/admin/
- django admin http://localhost:8000/django-admin/
