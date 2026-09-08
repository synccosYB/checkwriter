#!/bin/bash
set -e

echo "Running post-merge setup..."

echo "Installing API dependencies..."
cd api && npm install --legacy-peer-deps
echo "Applying subscription override schema..."
npm run db:migrate
cd ..

echo "Installing client dependencies..."
cd client && npm install --legacy-peer-deps
cd ..

echo "Post-merge setup complete."
