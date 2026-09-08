#!/bin/bash
set -e

echo "=== Building client (static frontend deployment) ==="
cd /home/runner/workspace

export GENERATE_SOURCEMAP=false
export CI=false
export INLINE_RUNTIME_CHUNK=false
export IMAGE_INLINE_SIZE_LIMIT=0
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
export NODE_OPTIONS='--max-old-space-size=1536'
export REACT_APP_GOOGLE_CLIENT_ID="${REACT_APP_GOOGLE_CLIENT_ID:-704060044496-jk3lbosm5hfbgj0idnuc1p849sqakr11.apps.googleusercontent.com}"

if [ -z "$REACT_APP_BASE_URL" ]; then
  echo "ERROR: REACT_APP_BASE_URL is not set."
  echo "Set it to the absolute URL of the API deployment, e.g. https://your-api.replit.app/api"
  echo "(Trailing /api is required because all client requests are made against \${REACT_APP_BASE_URL}/<route>.)"
  exit 1
fi

echo "REACT_APP_BASE_URL=$REACT_APP_BASE_URL"
echo "Google Client ID: ${REACT_APP_GOOGLE_CLIENT_ID:0:20}..."

echo "=== Installing root dependencies ==="
npm install --no-audit --no-fund

echo "=== Cleaning old client build ==="
rm -rf /home/runner/workspace/client/build

echo "=== Building client ==="
cd /home/runner/workspace/client
npx react-scripts build

if [ ! -f /home/runner/workspace/client/build/index.html ]; then
  echo "ERROR: Build failed - index.html not found"
  exit 1
fi

echo "=== Client build complete: client/build ==="
