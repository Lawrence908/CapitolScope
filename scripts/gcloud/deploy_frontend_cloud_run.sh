#!/bin/bash
set -euo pipefail

export PROJECT_ID=capitolscope
export REGION=us-west1
export API_URL=https://capitolscope-api-k23f5lpvca-uw.a.run.app
export SERVICE_NAME=capitolscope-frontend

echo "Deploying frontend to Cloud Run with SSR..."

# Navigate to frontend directory
cd frontend

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist/

# Install dependencies if needed
echo "Installing dependencies..."
npm ci

# Build Docker image with API URL
echo "Building Docker image with API URL: $API_URL"
docker build -f Dockerfile.simple \
  --build-arg VITE_API_URL=$API_URL \
  -t us-west1-docker.pkg.dev/$PROJECT_ID/capitolscope/capitolscope-frontend:latest \
  .

# Push image to Artifact Registry
echo "Pushing image to Artifact Registry..."
docker push us-west1-docker.pkg.dev/$PROJECT_ID/capitolscope/capitolscope-frontend:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image us-west1-docker.pkg.dev/$PROJECT_ID/capitolscope/capitolscope-frontend:latest \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80

echo "Frontend deployed to Cloud Run!"
echo "Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
