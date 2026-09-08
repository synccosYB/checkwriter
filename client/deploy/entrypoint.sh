#!/bin/sh

# Set a default if REDIRECT_URL is not provided
#REDIRECT_URL=${REDIRECT_URL:-"https://defaultwebsite.com"}

# Replace environment variables in the Nginx config
envsubst '$REDIRECT_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx
exec nginx -g 'daemon off;'