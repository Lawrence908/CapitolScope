cd /home/chris/github/CapitolScope
set -euo pipefail

# Required config
export PROJECT_ID=capitolscope
export REGION=us-west1

# Supply your Supabase creds via env (safer; handles special chars). Example:
# export SUPABASE_URL="https://xxxx.supabase.co"
# export SUPABASE_KEY="<anon_key>"
# export SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
# export SUPABASE_PASSWORD='<db_password_with_special_chars_ok>'
# export SUPABASE_JWT_SECRET='<jwt_secret>'
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# Create repo once (idempotent)
gcloud artifacts repositories create capitolscope --repository-format=docker --location=$REGION --description="CapitolScope images" || true

# Build and push
IMG=us-west1-docker.pkg.dev/$PROJECT_ID/capitolscope/capitolscope-api:$(date +%Y%m%d-%H%M%S)
docker build -f app/Dockerfile -t $IMG .
docker push $IMG

# Deploy (uses env vars defined above)
gcloud run deploy capitolscope-api \
  --image $IMG --region $REGION --allow-unauthenticated \
  --cpu=1 --memory=512Mi --min-instances=0 \
  --set-env-vars=ENVIRONMENT=production,DEBUG=true,API_V1_PREFIX=/api/v1 \
  --set-env-vars=SUPABASE_URL=$SUPABASE_URL,SUPABASE_KEY=$SUPABASE_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,SUPABASE_PASSWORD=$SUPABASE_PASSWORD,SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET