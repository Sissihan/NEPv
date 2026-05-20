#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
npm test

MAIN_JS=$(find dist/assets -name 'index-*.js' 2>/dev/null | head -1)
if [ -z "$MAIN_JS" ]; then
  MAIN_JS=$(find dist/assets -name '*.js' 2>/dev/null | head -1)
fi
if [ -n "$MAIN_JS" ]; then
  GZ=$(gzip -c "$MAIN_JS" | wc -c | tr -d ' ')
  echo "Main bundle gzip bytes: $GZ"
  if [ "$GZ" -ge 512000 ]; then
    echo "FAIL: gzipped JS >= 500KB"
    exit 1
  fi
else
  echo "WARN: no JS bundle found under dist/assets"
fi

echo "verify-build: OK"
