#!/bin/sh
set -e

cat frontend/docker-entrypoint.local.sh

echo "Starting nginx in HTTP mode (local development)..."
cp /etc/nginx/templates/init.conf /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"