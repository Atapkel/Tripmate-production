#!/bin/bash
# First-time SSL certificate setup for tripmate.live
# Run this ONCE on the server after DNS A record points to the server IP.
#
# Prerequisites:
#   1. DNS A record: tripmate.live -> your server IP
#   2. DNS A record: www.tripmate.live -> your server IP  (optional)
#   3. Ports 80 and 443 open on the server

set -e

DOMAIN="tripmate.live"
EMAIL="tripmate.connect@gmail.com"

echo "==> Step 1: Swapping to HTTP-only nginx config for ACME challenge..."
cp frontend/nginx.conf frontend/nginx.ssl.conf.bak
cp frontend/nginx.init.conf frontend/nginx.conf

echo "==> Step 2: Building and starting frontend (HTTP only)..."
docker compose build frontend
docker compose up -d frontend

echo "==> Step 3: Requesting SSL certificate for $DOMAIN..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Step 4: Restoring HTTPS nginx config..."
cp frontend/nginx.ssl.conf.bak frontend/nginx.conf
rm frontend/nginx.ssl.conf.bak

echo "==> Step 5: Rebuilding and restarting all services with HTTPS..."
docker compose build frontend
docker compose up -d

echo ""
echo "==> Done! HTTPS is now active at https://$DOMAIN"
