#!/bin/sh
set -e

# Replace placeholders inside all static JS files with live VPS environment variables
echo "Injecting VPS environment variables into static JS bundle..."

find /usr/share/caddy -type f -name "*.js" | while read -r file; do
  if [ -f "$file" ]; then
    # Replace mock 39-character placeholder with live VPS environment variable
    [ -n "$EXPO_PUBLIC_FIREBASE_API_KEY" ] && sed -i "s|AIzaSyA1b2C3d4E5f6G7h8I9j0K1HELLO4O5p6Q|${EXPO_PUBLIC_FIREBASE_API_KEY}|g" "$file"
    [ -n "$EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN" ] && sed -i "s|__EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN__|${EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN}|g" "$file"
    [ -n "$EXPO_PUBLIC_FIREBASE_PROJECT_ID" ] && sed -i "s|__EXPO_PUBLIC_FIREBASE_PROJECT_ID__|${EXPO_PUBLIC_FIREBASE_PROJECT_ID}|g" "$file"
    [ -n "$EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET" ] && sed -i "s|__EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET__|${EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET}|g" "$file"
    [ -n "$EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" ] && sed -i "s|__EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__|${EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}|g" "$file"
    [ -n "$EXPO_PUBLIC_FIREBASE_APP_ID" ] && sed -i "s|__EXPO_PUBLIC_FIREBASE_APP_ID__|${EXPO_PUBLIC_FIREBASE_APP_ID}|g" "$file"
    [ -n "$EXPO_PUBLIC_GOOGLE_API_KEY" ] && sed -i "s|__EXPO_PUBLIC_GOOGLE_API_KEY__|${EXPO_PUBLIC_GOOGLE_API_KEY}|g" "$file"
    [ -n "$EXPO_PUBLIC_NEWS_API_KEY" ] && sed -i "s|__EXPO_PUBLIC_NEWS_API_KEY__|${EXPO_PUBLIC_NEWS_API_KEY}|g" "$file"
    [ -n "$EXPO_PUBLIC_OPENROUTER_API_KEY" ] && sed -i "s|__EXPO_PUBLIC_OPENROUTER_API_KEY__|${EXPO_PUBLIC_OPENROUTER_API_KEY}|g" "$file"
  fi
done

echo "Starting Caddy server..."
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
