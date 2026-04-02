# ── Build stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_WS_BASE_URL
ARG VITE_APP_NAME=TripMate

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build


# ── Runtime stage ─────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf      /etc/nginx/templates/ssl.conf
COPY nginx.init.conf /etc/nginx/templates/init.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
