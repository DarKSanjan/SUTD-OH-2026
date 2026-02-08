#!/bin/bash
set -e

echo "=== Installing API deps ==="
(cd api && npm install)

echo "=== Installing Frontend deps (including devDependencies) ==="
(cd frontend && rm -rf node_modules && npm install --include=dev)

echo "=== Building Frontend ==="
(cd frontend && npm run build)

echo "=== Build complete ==="
