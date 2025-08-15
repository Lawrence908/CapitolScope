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

# Create a temporary file for gcloud command
TEMP_FILE=$(mktemp)

echo "📖 Processing environment variables..."

# Process .env file and create gcloud command
{
    echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars=\\\""
    
    while IFS= read -r line; do
        # Skip empty lines and comments
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Extract key=value pairs
        if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # Remove leading/trailing whitespace
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            
            # Skip empty values
            if [ -n "$value" ]; then
                echo -n "$key=$value,"
                echo "  ✅ $key" >&2
            fi
        fi
    done < "$ENV_FILE"
    
    echo "\\\""
} > "$TEMP_FILE"

# Remove the trailing comma from the last line
sed -i 's/,$//' "$TEMP_FILE"

echo ""
echo "🚀 Executing gcloud command..."

# Execute the command
bash "$TEMP_FILE"

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✅ Environment variables updated successfully!"
echo "🌐 Service URL:"
gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(status.url)'

