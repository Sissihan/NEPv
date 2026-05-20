#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if command -v nvm >/dev/null 2>&1; then
  # shellcheck source=/dev/null
  . ~/.nvm/nvm.sh 2>/dev/null || true
  nvm install 18.17.0 2>/dev/null || nvm use 18.17.0 2>/dev/null || true
fi

node -e "const v=process.versions.node.split('.').map(Number); if(v[0]<18||(v[0]===18&&v[1]<17)) { console.error('Node >= 18.17.0 required'); process.exit(1); }"

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm test
echo "setup-env: install + test OK"
