#!/bin/sh
find /app -type f -exec sed -i "s|NEXT_PUBLIC_API_URL_PLACEHOLDER|$NEXT_PUBLIC_API_URL|g" {} +
exec "$@" 