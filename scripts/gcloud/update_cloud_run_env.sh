#!/bin/bash
set -euo pipefail

# Configuration
SERVICE_NAME=capitolscope-api
REGION=us-west1
ENV_FILE=.env

echo "🔄 Updating Cloud Run environment variables from .env file..."
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found!"
    exit 1
fi

# Function to get value from .env file
get_env_value() {
    local key=$1
    local value=$(grep "^$key=" "$ENV_FILE" | cut -d'=' -f2- | xargs)
    echo "$value"
}

echo "📖 Reading environment variables from $ENV_FILE..."

# Get specific environment variables
SUPABASE_URL=$(get_env_value "SUPABASE_URL")
SUPABASE_KEY=$(get_env_value "SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY=$(get_env_value "SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_PASSWORD=$(get_env_value "SUPABASE_PASSWORD")
SUPABASE_JWT_SECRET=$(get_env_value "SUPABASE_JWT_SECRET")
EMAIL_HOST=$(get_env_value "EMAIL_HOST")
EMAIL_PORT=$(get_env_value "EMAIL_PORT")
EMAIL_USER=$(get_env_value "EMAIL_USER")
EMAIL_PASSWORD=$(get_env_value "EMAIL_PASSWORD")
EMAIL_FROM=$(get_env_value "EMAIL_FROM")
EMAIL_USE_TLS=$(get_env_value "EMAIL_USE_TLS")

# Check if required variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ] || [ -z "$EMAIL_USER" ]; then
    echo "❌ Error: Required environment variables not found in $ENV_FILE"
    echo "  Required: SUPABASE_URL, SUPABASE_KEY, EMAIL_USER"
    exit 1
fi

echo "  ✅ SUPABASE_URL"
echo "  ✅ SUPABASE_KEY"
echo "  ✅ SUPABASE_SERVICE_ROLE_KEY"
echo "  ✅ SUPABASE_PASSWORD"
echo "  ✅ SUPABASE_JWT_SECRET"
echo "  ✅ EMAIL_HOST"
echo "  ✅ EMAIL_PORT"
echo "  ✅ EMAIL_USER"
echo "  ✅ EMAIL_PASSWORD"
echo "  ✅ EMAIL_FROM"
echo "  ✅ EMAIL_USE_TLS"

echo ""
echo "🚀 Updating Cloud Run service..."

# Update the service with the environment variables
gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --set-env-vars="SUPABASE_URL=$SUPABASE_URL,SUPABASE_KEY=$SUPABASE_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,SUPABASE_PASSWORD=$SUPABASE_PASSWORD,SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET,EMAIL_HOST=$EMAIL_HOST,EMAIL_PORT=$EMAIL_PORT,EMAIL_USER=$EMAIL_USER,EMAIL_PASSWORD=$EMAIL_PASSWORD,EMAIL_FROM=$EMAIL_FROM,EMAIL_USE_TLS=$EMAIL_USE_TLS"

echo ""
echo "✅ Environment variables updated successfully!"
echo "🌐 Service URL:"
gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(status.url)'

echo ""
echo "📊 Current environment variables:"
gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(spec.template.spec.containers[0].env[].name)" | tr ';' '\n' | sort
