#!/bin/sh
set -e

# Replace placeholders inside all static JS files with live VPS environment variables
echo "Injecting VPS environment variables into static JS bundle..."

find /usr/share/caddy -type f -name "*.js" | while read -r file; do
  if [ -f "$file" ]; then
    [ -n "$EXPO_PUBLIC_FIREBASE_API_KEY" ] && sed -i "s|AIzaSy_BUILD_MOCK_FIREBASE_KEY_PLACEHOLDER_39CH|${EXPO_PUBLIC_FIREBASE_API_KEY}|g" "$file"
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
