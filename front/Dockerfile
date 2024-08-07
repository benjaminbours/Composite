# Dev env
FROM composite-repo-image:latest AS dev
WORKDIR /app

ENTRYPOINT ["npm", "run", "dev", "-w", "front"]

# Prod env

FROM node:18-alpine AS build
WORKDIR /app
COPY . .

RUN apk add --update --no-cache \
    make \
    g++ \
    py3-pip \
    libc6-compat && \
    npm i && \
    npm run build -w packages && \
    npm cache clean --force && \
    rm -rf /var/cache/apk/*

ENV NODE_ENV production
ARG NEXT_PUBLIC_STAGE
ENV NEXT_PUBLIC_STAGE ${NEXT_PUBLIC_STAGE}
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL ${NEXT_PUBLIC_BACKEND_URL}
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL ${NEXT_PUBLIC_URL}
ARG NPM_TOKEN
ENV NPM_TOKEN ${NPM_TOKEN}

RUN npm run build -w front

FROM node:18-alpine AS final
WORKDIR /app

ARG NPM_TOKEN
ENV NPM_TOKEN ${NPM_TOKEN}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/front/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/front/.next/static ./front/.next/static
COPY --from=build /app/front/public ./front/public

USER nextjs

EXPOSE 3000
ENV PORT 3000

ENTRYPOINT ["node", "./front/server.js"]
