#!/bin/bash

# CapitolScope Frontend Deployment Script
set -e

echo "🚀 Deploying CapitolScope Frontend..."

# Build with API URL
echo "📦 Building frontend with API URL..."
VITE_API_URL=https://capitolscope-api-k23f5lpvca-uw.a.run.app npm run build

# Deploy to Google Cloud Storage
echo "☁️ Deploying to Google Cloud Storage..."
gcloud storage cp -r dist/* gs://capitolscope-frontend-capitolscope/

echo "✅ Deployment complete!"
echo "🌐 Frontend URL: https://storage.googleapis.com/capitolscope-frontend-capitolscope/"
echo "🔗 API URL: https://capitolscope-api-k23f5lpvca-uw.a.run.app"


