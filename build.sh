#!/bin/bash
set -e

echo "=== Starting build ==="
echo "Current dir: $(pwd)"

# Install api deps
echo "=== Installing API deps ==="
(cd api && npm install)

# Install frontend deps from scratch
echo "=== Installing Frontend deps ==="
(cd frontend && rm -rf node_modules && npm install)

# Verify vite exists
echo "=== Checking vite ==="
ls -la frontend/node_modules/.bin/vite

# Build frontend
echo "=== Building Frontend ==="
(cd frontend && npm run build)

echo "=== Build complete ==="
