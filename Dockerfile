FROM node:18-alpine AS base

WORKDIR /app
RUN apk add --update --no-cache openssl1.1-compat
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY . .

RUN npm i
RUN npm run build -w packages