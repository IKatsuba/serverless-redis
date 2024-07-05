FROM node:20 AS builder

WORKDIR /app

COPY . .

RUN npm ci && \
    npx nx build api

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist /app/dist

RUN npm ci --prefix dist/apps/api

CMD ["node", "dist/apps/api/main.js"]
