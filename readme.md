# dev

```bash
# set-up local environment
$ cp .env.dev.template .env  # customize

$ # format code
$ black --exclude migrations .

$ docker-compose up -d --build dev
```


# prod

```bash
$ cp .env.prod.template .env  # fill in with prod secrets
$ docker-compose up -d --build prod
```


# dev

Useful commands

```bash
$ docker-compose exec dev bash
$ docker-compose logs -f dev
```
