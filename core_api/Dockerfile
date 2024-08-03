# Dev
FROM composite-repo-image:latest AS dev
WORKDIR /app

RUN cd core_api && npx prisma generate

ENTRYPOINT ["npm", "run", "start:dev", "-w", "core_api"]

FROM node:18-alpine AS build
WORKDIR /app
COPY . .

RUN apk add --update --no-cache \
    make && \
    npm i && \
    npm run build -w packages && \
    cd core_api && npx prisma generate && \
    npm cache clean --force && \
    rm -rf /var/cache/apk/*

ENV NODE_ENV production
ARG POSTGRES_USER
ENV POSTGRES_USER ${POSTGRES_USER}
ARG POSTGRES_PASSWORD
ENV POSTGRES_PASSWORD ${POSTGRES_PASSWORD}
ARG POSTGRES_DB
ENV POSTGRES_DB ${POSTGRES_DB}
ENV DATABASE_URL postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public
ENV REDIS_URL redis://cache:6379
ENV STAGE staging
ARG NPM_TOKEN
ENV NPM_TOKEN ${NPM_TOKEN}

RUN npm run build -w core_api

FROM node:18-alpine AS final
WORKDIR /app

ARG NPM_TOKEN
ENV NPM_TOKEN ${NPM_TOKEN}

COPY --from=build /app/core_api/dist ./dist
COPY --from=build /app/core_api/prisma ./prisma
COPY --from=build /app/core_api/locales ./locales
COPY --from=build /app/core_api/package*.json ./
COPY --from=build /app/core_api/assets.json ./
COPY --from=build /app/.npmrc ./

RUN npm i --omit=dev && \
    npx prisma generate && \
    npm cache clean --force

ENTRYPOINT ["npm", "run", "start:prod"]