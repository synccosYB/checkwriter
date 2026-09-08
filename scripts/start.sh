#!/bin/bash

# Production entrypoint for the API-only deployment.
# The React client is hosted separately as a static deployment and is NOT
# served by this process.

cd /home/runner/workspace/api

export PORT="${PORT:-5000}"
export NODE_ENV=production
export NODE_CONFIG_DIR=/home/runner/workspace/api/config

# In-process cron is disabled by default so the API can autosleep on
# the request-driven (autoscale) deployment target. Recurring jobs
# should be moved to a dedicated worker / scheduled deployment.
# To re-enable in-process cron (e.g. for a vm-style worker), export
# ENABLE_CRON=true before invoking this script.
: "${ENABLE_CRON:=false}"
export ENABLE_CRON

echo "NODE_ENV=$NODE_ENV"
echo "NODE_CONFIG_DIR=$NODE_CONFIG_DIR"
echo "ENABLE_CRON=$ENABLE_CRON"

if [ ! -f "$NODE_CONFIG_DIR/production.json" ]; then
  echo "ERROR: Production config file not found at $NODE_CONFIG_DIR/production.json"
  exit 1
fi

echo "Starting API on port $PORT..."
exec node --import tsx/esm src/index.ts 2>&1
