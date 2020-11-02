FROM node:14.15.0-buster-slim

WORKDIR /app

COPY yarn.lock package.json /app/
RUN yarn install

COPY webpack.dev.js /app/
