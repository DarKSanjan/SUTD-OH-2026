#!/bin/bash
set -e
npm install --prefix api
npm install --prefix frontend
cd frontend
npm run build
