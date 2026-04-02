#!/bin/sh
set -e

DOMAIN="tripmate.live"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo "SSL certificate found — starting with HTTPS"
    cp /etc/nginx/templates/ssl.conf /etc/nginx/conf.d/default.conf
else
    echo "No SSL certificate — starting HTTP, waiting for certbot..."
    cp /etc/nginx/templates/init.conf /etc/nginx/conf.d/default.conf
    # Background: watch for cert and switch to HTTPS
    (
        while [ ! -f "$CERT_PATH" ]; do sleep 5; done
        echo "SSL certificate detected — switching to HTTPS"
        cp /etc/nginx/templates/ssl.conf /etc/nginx/conf.d/default.conf
        nginx -s reload
    ) &
fi

exec nginx -g "daemon off;"
