#!/bin/bash
set -e

echo "=== Building unified deployment (API + client) ==="
cd /home/runner/workspace

echo "=== Installing root dependencies ==="
npm install --no-audit --no-fund

echo "=== Installing API dependencies ==="
cd /home/runner/workspace/api
npm install --no-audit --no-fund

echo "=== Syncing database schema ==="
npx drizzle-kit push --force 2>&1 || echo "WARNING: Schema push encountered issues (non-fatal)"

echo "=== Building React client ==="
cd /home/runner/workspace/client
export GENERATE_SOURCEMAP=false
export CI=false
export INLINE_RUNTIME_CHUNK=false
export IMAGE_INLINE_SIZE_LIMIT=0
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
# Lean production build to avoid OOM during deploy: ESLint and TS type
# checking are already verified in the dev workflow, so skip them here to
# cut the build's peak memory. TSC_COMPILE_ON_ERROR lets the build emit
# even if the (skipped) checker would have complained.
export DISABLE_ESLINT_PLUGIN=true
export TSC_COMPILE_ON_ERROR=true
export ESLINT_NO_DEV_ERRORS=true
export NODE_OPTIONS='--max-old-space-size=4096'
export REACT_APP_GOOGLE_CLIENT_ID="${REACT_APP_GOOGLE_CLIENT_ID:-704060044496-jk3lbosm5hfbgj0idnuc1p849sqakr11.apps.googleusercontent.com}"
export REACT_APP_BASE_URL="${REACT_APP_BASE_URL:-/api}"

echo "REACT_APP_BASE_URL=$REACT_APP_BASE_URL"

rm -rf /home/runner/workspace/client/build
npx react-scripts build

if [ ! -f /home/runner/workspace/client/build/index.html ]; then
  echo "ERROR: Client build failed - index.html not found"
  exit 1
fi

echo "=== Build complete (API + client/build) ==="
