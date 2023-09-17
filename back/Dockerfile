FROM node:18-alpine AS runner

RUN apk add --update --no-cache openssl1.1-compat

WORKDIR /app
COPY . .

RUN npm i
RUN npx prisma generate

ENTRYPOINT ["npm", "run", "start:dev"]