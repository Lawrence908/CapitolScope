#!/bin/bash
set -euo pipefail

export PROJECT_ID=capitolscope
export BUCKET_NAME=capitolscope-frontend-capitolscope

echo "Configuring Cloud Storage bucket for public access..."

# Enable uniform bucket-level access (if not already enabled)
echo "1. Enabling uniform bucket-level access..."
gcloud storage buckets update gs://$BUCKET_NAME \
  --uniform-bucket-level-access

# Make bucket publicly readable
echo "2. Making bucket publicly readable..."
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer

# Set website configuration
echo "3. Setting website configuration..."
gcloud storage buckets update gs://$BUCKET_NAME \
  --web-main-page-suffix=index.html \
  --web-error-page=index.html

echo "Bucket configuration complete!"
echo "Your frontend should now be accessible at:"
echo "https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo
echo "To set up a custom domain, configure your domain's DNS to point to:"
echo "c.storage.googleapis.com"
