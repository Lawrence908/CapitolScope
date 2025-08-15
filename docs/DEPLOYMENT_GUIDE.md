# CapitolScope Deployment Guide

## 🎯 **Deployment Strategy**

### **Phase 1: Quick MVP Deployment (1-2 days)**
**Goal:** Get a basic version live for beta testing with friends

### **Phase 2: Production-Ready Deployment (3-5 days)**
**Goal:** Full production deployment with monitoring, CI/CD, and scaling

---

## 🚀 **Phase 1: Quick MVP Deployment**

### **Step 1: Google Cloud Setup**

```bash
# 1. Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 2. Initialize and authenticate
gcloud init
gcloud auth login

# 3. Create new project (or use existing)
gcloud projects create capitolscope-app --name="CapitolScope"
gcloud config set project capitolscope-app

# 4. Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### **Step 2: Database Setup**

```bash
# 1. Create Cloud SQL instance (PostgreSQL)
gcloud sql instances create capitolscope-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB

# 2. Create database
gcloud sql databases create capitolscope --instance=capitolscope-db

# 3. Create user
gcloud sql users create capitolscope-user \
  --instance=capitolscope-db \
  --password=your-secure-password

# 4. Get connection info
gcloud sql instances describe capitolscope-db --format="value(connectionName)"
```

### **Step 3: Environment Configuration**

Create `.env.production`:
```bash
# Database
DATABASE_URL=postgresql://capitolscope-user:your-password@/capitolscope?host=/cloudsql/capitolscope-app:us-central1:capitolscope-db

# Redis (Cloud Memorystore)
REDIS_URL=redis://your-redis-instance:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@capitolscope.com

# Environment
ENVIRONMENT=production
DEBUG=false
```

### **Step 4: Build and Deploy**

```bash
# 1. Build Docker images
docker build -t gcr.io/capitolscope-app/capitolscope-backend ./app
docker build -t gcr.io/capitolscope-app/capitolscope-frontend ./frontend

# 2. Push to Google Container Registry
docker push gcr.io/capitolscope-app/capitolscope-backend
docker push gcr.io/capitolscope-app/capitolscope-frontend

# 3. Deploy to Cloud Run
gcloud run deploy capitolscope-backend \
  --image gcr.io/capitolscope-app/capitolscope-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --set-env-vars ENVIRONMENT=production

gcloud run deploy capitolscope-frontend \
  --image gcr.io/capitolscope-app/capitolscope-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5173
```

### **Step 5: Domain and SSL**

```bash
# 1. Map custom domain
gcloud run domain-mappings create \
  --service capitolscope-frontend \
  --domain capitolscope.com \
  --region us-central1

# 2. SSL certificate will be auto-provisioned
```

---

## 🏭 **Phase 2: Production-Ready Deployment**

### **Step 1: Infrastructure as Code**

Create `terraform/main.tf`:
```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "capitolscope-app"
  region  = "us-central1"
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "capitolscope-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "capitolscope-subnet"
  ip_cidr_range = "10.0.0.0/24"
  network       = google_compute_network.vpc.id
  region        = "us-central1"
}

# Cloud SQL Instance
resource "google_sql_database_instance" "main" {
  name             = "capitolscope-db"
  database_version = "POSTGRES_14"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro"
    
    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }
}

# Redis Instance
resource "google_redis_instance" "cache" {
  name           = "capitolscope-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = "us-central1"
}
```

### **Step 2: CI/CD Pipeline**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: capitolscope-app
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ env.PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Configure Docker
      run: gcloud auth configure-docker
    
    - name: Build and Push Backend
      run: |
        docker build -t gcr.io/$PROJECT_ID/capitolscope-backend ./app
        docker push gcr.io/$PROJECT_ID/capitolscope-backend
    
    - name: Build and Push Frontend
      run: |
        docker build -t gcr.io/$PROJECT_ID/capitolscope-frontend ./frontend
        docker push gcr.io/$PROJECT_ID/capitolscope-frontend
    
    - name: Deploy Backend
      run: |
        gcloud run deploy capitolscope-backend \
          --image gcr.io/$PROJECT_ID/capitolscope-backend \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --port 8000 \
          --set-env-vars ENVIRONMENT=production
    
    - name: Deploy Frontend
      run: |
        gcloud run deploy capitolscope-frontend \
          --image gcr.io/$PROJECT_ID/capitolscope-frontend \
          --platform managed \
          --region $REGION \
          --allow-unauthenticated \
          --port 5173
```

### **Step 3: Monitoring and Logging**

```bash
# 1. Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# 2. Create monitoring dashboard
gcloud monitoring dashboards create \
  --config-from-file=dashboard.json

# 3. Set up alerting policies
gcloud alpha monitoring policies create \
  --policy-from-file=alert-policy.yaml
```

### **Step 4: Security and Compliance**

```bash
# 1. Enable Cloud Security Command Center
gcloud services enable securitycenter.googleapis.com

# 2. Set up VPC Service Controls
gcloud access-context-manager policies create \
  --title="CapitolScope Security Policy" \
  --organization=your-org-id

# 3. Configure IAM roles
gcloud projects add-iam-policy-binding capitolscope-app \
  --member="serviceAccount:capitolscope-sa@capitolscope-app.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

---

## 📊 **Deployment Options Comparison**

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Cloud Run** | Auto-scaling, pay-per-use, easy CI/CD | Cold starts, 15min timeout | MVP, cost-conscious |
| **Compute Engine** | Full control, persistent storage | Manual scaling, more complex | Full control needed |
| **Kubernetes Engine** | Container orchestration, auto-scaling | Overkill, complex | Large scale, microservices |

---

## 🔧 **Environment-Specific Configurations**

### **Development**
```bash
# Local development
docker-compose up --build
```

### **Staging**
```bash
# Staging environment
gcloud run deploy capitolscope-staging \
  --image gcr.io/capitolscope-app/capitolscope-backend:staging \
  --region us-central1
```

### **Production**
```bash
# Production environment
gcloud run deploy capitolscope-prod \
  --image gcr.io/capitolscope-app/capitolscope-backend:latest \
  --region us-central1 \
  --set-env-vars ENVIRONMENT=production
```

---

## 📈 **Performance Optimization**

### **Database Optimization**
```sql
-- Add indexes for common queries
CREATE INDEX idx_congressional_trades_date ON congressional_trades(transaction_date);
CREATE INDEX idx_congressional_trades_member ON congressional_trades(member_id);
CREATE INDEX idx_congressional_trades_ticker ON congressional_trades(ticker);

-- Partition by date for large datasets
CREATE TABLE congressional_trades_2024 PARTITION OF congressional_trades
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### **Caching Strategy**
```python
# Redis caching for frequently accessed data
@cache(expire=3600)  # 1 hour cache
async def get_member_profile(member_id: str):
    return await member_repository.get_by_id(member_id)

@cache(expire=1800)  # 30 minute cache
async def get_recent_trades(limit: int = 50):
    return await trade_repository.get_recent(limit)
```

### **CDN Configuration**
```bash
# Set up Cloud CDN for static assets
gcloud compute backend-buckets create capitolscope-assets \
  --gcs-bucket-name=capitolscope-static-assets

gcloud compute url-maps create capitolscope-lb \
  --default-backend-bucket=capitolscope-assets
```

---

## 🚨 **Monitoring and Alerting**

### **Key Metrics to Monitor**
- Response time (target: <200ms)
- Error rate (target: <1%)
- Database connection pool usage
- Memory usage
- CPU utilization
- Request volume

### **Alerting Rules**
```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"

# High response time
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
  for: 5m
  labels:
    severity: warning
```

---

## 🔒 **Security Checklist**

- [ ] Enable Cloud Security Command Center
- [ ] Set up VPC Service Controls
- [ ] Configure IAM roles with least privilege
- [ ] Enable Cloud Audit Logging
- [ ] Set up SSL certificates
- [ ] Configure CORS policies
- [ ] Implement rate limiting
- [ ] Set up secrets management
- [ ] Enable DDoS protection
- [ ] Configure backup and disaster recovery

---

## 💰 **Cost Optimization**

### **Estimated Monthly Costs (MVP)**
- Cloud Run: $50-100/month
- Cloud SQL: $25-50/month
- Cloud Storage: $5-10/month
- Network: $10-20/month
- **Total: $90-180/month**

### **Cost Optimization Tips**
1. Use Cloud Run's auto-scaling to zero
2. Choose appropriate database tier
3. Implement caching to reduce database calls
4. Use Cloud CDN for static assets
5. Monitor and optimize resource usage

---

## 🎯 **Next Steps**

### **Immediate (This Week)**
1. Complete missing Free tier features
2. Set up Google Cloud project
3. Deploy basic MVP
4. Test with friends

### **Short Term (Next 2 Weeks)**
1. Add monitoring and logging
2. Implement CI/CD pipeline
3. Add security measures
4. Performance optimization

### **Long Term (Next Month)**
1. Add Pro tier features
2. Implement advanced analytics
3. Scale infrastructure
4. Add enterprise features 