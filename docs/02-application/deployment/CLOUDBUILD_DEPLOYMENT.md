# Google Cloud Build Deployment Guide
# FuturaTickets Platform

This document describes the Cloud Build configurations for deploying the FuturaTickets platform services to Google Cloud Run.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Services Configuration](#services-configuration)
4. [Secrets Management](#secrets-management)
5. [Deployment Instructions](#deployment-instructions)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)

---

## Overview

The FuturaTickets platform consists of 4 main services:

| Service | Type | Port | Memory | CPU | Min/Max Instances |
|---------|------|------|--------|-----|-------------------|
| **futura-market-place-api** | NestJS API | 3000 | 1Gi | 1 | 1/10 |
| **futura-access-api** | NestJS API | 3000 | 1Gi | 1 | 1/10 |
| **futura-market-place-v2** | Next.js Frontend | 3000 | 512Mi | 1 | 0/5 |
| **futura-tickets-admin** | Next.js Frontend | 3000 | 512Mi | 1 | 0/5 |

All services are deployed to **Cloud Run** in the **europe-west1** region with automatic scaling.

---

## Prerequisites

### 1. Google Cloud Project Setup

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com
```

### 2. Artifact Registry Setup

```bash
# Create Artifact Registry repository
gcloud artifacts repositories create futura-tickets \
  --repository-format=docker \
  --location=europe-west1 \
  --description="FuturaTickets Docker images"
```

### 3. VPC Connector Setup (for private networking)

```bash
# Create VPC connector for Cloud Run services to access private resources
gcloud compute networks vpc-access connectors create futura-vpc-connector \
  --region=europe-west1 \
  --network=default \
  --range=10.8.0.0/28
```

### 4. Service Account Permissions

```bash
# Grant Cloud Build service account necessary permissions
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Services Configuration

### 1. Futura Marketplace API (NestJS)

**Purpose:** Main marketplace backend - payments (Stripe), orders, emails
**Location:** `/futura-market-place-api/cloudbuild.yaml`

**Key Features:**
- Stripe payment processing
- MongoDB integration
- Redis for Bull job queues
- Azure Blob Storage for images
- WebSocket support via Azure Web PubSub
- Email system with transactional templates

**Secrets Required:**
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET_KEY` - JWT signing key (must match across all APIs)
- `STRIPE_PUBLIC_KEY` - Stripe publishable key
- `STRIPE_PRIVATE_KEY` - Stripe secret key
- `STRIPE_ENDPOINT_SECRET` - Stripe webhook secret
- `REDIS_HOST` - Redis host for job queues
- `REDIS_PASSWORD` - Redis password
- `MAIL_HOST` - SMTP host
- `MAIL_USER` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `AZURE_STORAGE_CONNECTION_STRING` - Azure Blob Storage connection
- `SOCKET_MARKET_PLACE` - Azure Web PubSub connection string
- `BLOB_URL` - Public URL for blob storage
- `FUTURA_MARKET_PLACE` - Frontend marketplace URL

### 2. Futura Access API (NestJS)

**Purpose:** Ticket validation and access control
**Location:** `/futura-access-api/cloudbuild.yaml`

**Key Features:**
- QR code ticket validation
- Real-time access notifications via WebSocket
- Check-in/check-out management
- Access control personnel management

**Secrets Required:**
- `MONGO_URL` - MongoDB connection string (shared with marketplace-api)
- `JWT_SECRET_KEY` - JWT signing key (MUST MATCH other APIs)
- `SOCKET_ACCESS` - Azure Web PubSub connection string for access events
- `THROTTLE_TTL` - Rate limiting time window (60000ms)
- `THROTTLE_LIMIT` - Max requests per window (100)

### 3. Futura Marketplace V2 (Next.js 15)

**Purpose:** Customer-facing marketplace frontend
**Location:** `/futura-market-place-v2/cloudbuild.yaml`

**Key Features:**
- Event browsing and search
- Stripe checkout integration
- Google OAuth authentication
- Shopping cart with localStorage
- Ticket resale and transfer
- Responsive design with Radix UI

**Environment Variables (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_FUTURA_API` - Main API endpoint
- `NEXT_PUBLIC_FUTURA` - Events/orders API endpoint
- `NEXT_PUBLIC_REFACTOR_RESALE_API` - Resale API endpoint
- `NEXT_PUBLIC_BLOB_URL` - Azure Blob Storage URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID

**Note:** These variables are embedded during build time and exposed to the browser.

### 4. Futura Tickets Admin (Next.js 15)

**Purpose:** Admin panel for event promoters
**Location:** `/futura-tickets-admin/cloudbuild.yaml`

**Key Features:**
- Event management (create, edit, launch)
- Sales and order tracking
- Real-time analytics dashboard
- Promocode and coupon management
- Payment withdrawal requests
- Multi-WebSocket support (admin, access, marketplace)

**Environment Variables (NEXT_PUBLIC_*):**
- `NEXT_PUBLIC_FUTURA` - Admin API endpoint
- `NEXT_PUBLIC_SOCKET_URL` - Admin WebSocket URL
- `NEXT_PUBLIC_SOCKET_ACCESS_URL` - Access WebSocket URL
- `NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL` - Marketplace WebSocket URL
- `NEXT_PUBLIC_BLOB_URL` - Azure Blob Storage URL
- `NEXT_PUBLIC_MARKET_PLACE` - Marketplace frontend URL
- `NEXT_PUBLIC_BASE_SEPOLIA_SCAN` - Blockchain explorer URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID

---

## Secrets Management

### Creating Secrets in Secret Manager

```bash
# MongoDB connection string (shared by marketplace-api and access-api)
echo -n "mongodb+srv://user:password@cluster.mongodb.net/futuratickets" | \
  gcloud secrets create MONGO_URL --data-file=-

# JWT Secret Key (MUST be the same across all APIs for SSO)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" | \
  gcloud secrets create JWT_SECRET_KEY --data-file=-

# Stripe keys
echo -n "pk_live_..." | gcloud secrets create STRIPE_PUBLIC_KEY --data-file=-
echo -n "sk_live_..." | gcloud secrets create STRIPE_PRIVATE_KEY --data-file=-
echo -n "whsec_..." | gcloud secrets create STRIPE_ENDPOINT_SECRET --data-file=-

# Redis credentials
echo -n "redis-host.com" | gcloud secrets create REDIS_HOST --data-file=-
echo -n "redis-password" | gcloud secrets create REDIS_PASSWORD --data-file=-

# Email SMTP credentials
echo -n "smtp.hostinger.com" | gcloud secrets create MAIL_HOST --data-file=-
echo -n "noreply@futuratickets.com" | gcloud secrets create MAIL_USER --data-file=-
echo -n "email-password" | gcloud secrets create MAIL_PASSWORD --data-file=-

# Azure Storage
echo -n "DefaultEndpointsProtocol=https;..." | \
  gcloud secrets create AZURE_STORAGE_CONNECTION_STRING --data-file=-

# Azure Web PubSub
echo -n "Endpoint=https://...;AccessKey=...;Version=1.0;" | \
  gcloud secrets create SOCKET_MARKET_PLACE --data-file=-
echo -n "Endpoint=https://...;AccessKey=...;Version=1.0;" | \
  gcloud secrets create SOCKET_ACCESS --data-file=-

# Public URLs
echo -n "https://futuratickets.blob.core.windows.net/images" | \
  gcloud secrets create BLOB_URL --data-file=-
echo -n "https://marketplace.futuratickets.com" | \
  gcloud secrets create FUTURA_MARKET_PLACE --data-file=-

# Rate limiting
echo -n "60000" | gcloud secrets create THROTTLE_TTL --data-file=-
echo -n "100" | gcloud secrets create THROTTLE_LIMIT --data-file=-
```

### Updating Secrets

```bash
# Add a new version to an existing secret
echo -n "new-secret-value" | \
  gcloud secrets versions add SECRET_NAME --data-file=-

# List all secrets
gcloud secrets list

# View secret versions
gcloud secrets versions list SECRET_NAME
```

---

## Deployment Instructions

### Manual Deployment

#### 1. Deploy Marketplace API

```bash
cd futura-market-place-api

gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=futura-marketplace-api,_REGION=europe-west1
```

#### 2. Deploy Access API

```bash
cd futura-access-api

gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=futura-access-api,_REGION=europe-west1
```

#### 3. Deploy Marketplace V2 Frontend

```bash
cd futura-market-place-v2

gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=futura-marketplace-v2,_REGION=europe-west1,\
_NEXT_PUBLIC_FUTURA_API=https://api.futuratickets.com,\
_NEXT_PUBLIC_FUTURA=https://api.futuratickets.com,\
_NEXT_PUBLIC_REFACTOR_RESALE_API=https://resale-api.futuratickets.com,\
_NEXT_PUBLIC_BLOB_URL=https://futuratickets.blob.core.windows.net/images,\
_NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

#### 4. Deploy Admin Panel

```bash
cd futura-tickets-admin

gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=futura-tickets-admin,_REGION=europe-west1,\
_NEXT_PUBLIC_FUTURA=https://admin-api.futuratickets.com,\
_NEXT_PUBLIC_SOCKET_URL=wss://admin-api.futuratickets.com,\
_NEXT_PUBLIC_SOCKET_ACCESS_URL=wss://access-api.futuratickets.com,\
_NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL=wss://marketplace-api.futuratickets.com,\
_NEXT_PUBLIC_BLOB_URL=https://futuratickets.blob.core.windows.net/images,\
_NEXT_PUBLIC_MARKET_PLACE=https://marketplace.futuratickets.com,\
_NEXT_PUBLIC_BASE_SEPOLIA_SCAN=https://etherscan.io,\
_NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Automated Deployment with Cloud Build Triggers

#### Setup Build Triggers (GitHub)

```bash
# Connect GitHub repository
gcloud beta builds triggers create github \
  --name="deploy-marketplace-api" \
  --repo-name="futura-tickets" \
  --repo-owner="your-org" \
  --branch-pattern="^main$" \
  --build-config="futura-market-place-api/cloudbuild.yaml" \
  --included-files="futura-market-place-api/**"

gcloud beta builds triggers create github \
  --name="deploy-access-api" \
  --repo-name="futura-tickets" \
  --repo-owner="your-org" \
  --branch-pattern="^main$" \
  --build-config="futura-access-api/cloudbuild.yaml" \
  --included-files="futura-access-api/**"

gcloud beta builds triggers create github \
  --name="deploy-marketplace-v2" \
  --repo-name="futura-tickets" \
  --repo-owner="your-org" \
  --branch-pattern="^main$" \
  --build-config="futura-market-place-v2/cloudbuild.yaml" \
  --included-files="futura-market-place-v2/**"

gcloud beta builds triggers create github \
  --name="deploy-tickets-admin" \
  --repo-name="futura-tickets" \
  --repo-owner="your-org" \
  --branch-pattern="^main$" \
  --build-config="futura-tickets-admin/cloudbuild.yaml" \
  --included-files="futura-tickets-admin/**"
```

---

## Environment Configuration

### Development Environment

```bash
# Use substitutions for development deployment
--substitutions=\
_MIN_INSTANCES=0,\
_MAX_INSTANCES=2,\
_MEMORY=512Mi,\
_CPU=1
```

### Staging Environment

```bash
# Medium resources for staging
--substitutions=\
_MIN_INSTANCES=0,\
_MAX_INSTANCES=5,\
_MEMORY=1Gi,\
_CPU=1
```

### Production Environment

```bash
# Full resources for production (NestJS APIs)
--substitutions=\
_MIN_INSTANCES=1,\
_MAX_INSTANCES=10,\
_MEMORY=1Gi,\
_CPU=1,\
_CONCURRENCY=80

# Production frontends can scale to zero
--substitutions=\
_MIN_INSTANCES=0,\
_MAX_INSTANCES=5,\
_MEMORY=512Mi,\
_CPU=1
```

---

## Monitoring and Troubleshooting

### View Logs

```bash
# Cloud Build logs
gcloud builds list
gcloud builds log BUILD_ID

# Cloud Run logs
gcloud run services logs read futura-marketplace-api --region=europe-west1 --limit=100

# Tail logs in real-time
gcloud run services logs tail futura-marketplace-api --region=europe-west1
```

### Check Service Status

```bash
# List all Cloud Run services
gcloud run services list --region=europe-west1

# Get service details
gcloud run services describe futura-marketplace-api --region=europe-west1

# Get service URL
gcloud run services describe futura-marketplace-api \
  --region=europe-west1 \
  --format="value(status.url)"
```

### Update Service Configuration

```bash
# Update memory
gcloud run services update futura-marketplace-api \
  --region=europe-west1 \
  --memory=2Gi

# Update CPU
gcloud run services update futura-marketplace-api \
  --region=europe-west1 \
  --cpu=2

# Update min/max instances
gcloud run services update futura-marketplace-api \
  --region=europe-west1 \
  --min-instances=2 \
  --max-instances=20

# Update environment variable
gcloud run services update futura-marketplace-api \
  --region=europe-west1 \
  --set-env-vars="NEW_VAR=value"
```

### Rollback Deployment

```bash
# List revisions
gcloud run revisions list \
  --service=futura-marketplace-api \
  --region=europe-west1

# Rollback to previous revision
gcloud run services update-traffic futura-marketplace-api \
  --region=europe-west1 \
  --to-revisions=REVISION_NAME=100
```

### Common Issues

#### 1. Build Timeout

If builds timeout, increase timeout in cloudbuild.yaml:
```yaml
timeout: '3600s'  # 1 hour
```

#### 2. Memory Issues

If containers crash with OOM:
```bash
gcloud run services update SERVICE_NAME \
  --region=europe-west1 \
  --memory=2Gi
```

#### 3. Cold Start Issues

For APIs that need to be always warm:
```bash
gcloud run services update SERVICE_NAME \
  --region=europe-west1 \
  --min-instances=1
```

#### 4. Secret Access Errors

Grant Cloud Run service account access to secrets:
```bash
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Cost Optimization

### Tips for Reducing Costs

1. **Scale to Zero for Frontends:**
   - Set `_MIN_INSTANCES=0` for Next.js apps during low traffic

2. **Use Appropriate Instance Sizes:**
   - APIs: 1Gi memory, 1 CPU
   - Frontends: 512Mi memory, 1 CPU

3. **Set Concurrency:**
   - Higher concurrency = fewer instances
   - Default: 80 concurrent requests per instance

4. **Monitor Usage:**
   ```bash
   # View Cloud Run metrics
   gcloud monitoring dashboards list
   ```

5. **Use Cloud Scheduler for Scheduled Tasks:**
   - Instead of keeping instances running 24/7

---

## Security Best Practices

1. **Secrets Management:**
   - Never commit secrets to git
   - Always use Secret Manager
   - Rotate secrets regularly

2. **VPC Configuration:**
   - Use VPC connector for private networking
   - Restrict egress to only what's needed

3. **IAM Permissions:**
   - Follow principle of least privilege
   - Use separate service accounts for each service

4. **Authentication:**
   - Enable Cloud Run authentication for admin APIs
   - Use JWT tokens with proper expiration

5. **CORS Configuration:**
   - Configure proper CORS policies on APIs
   - Whitelist only necessary origins

---

## Support and Documentation

### Official Documentation
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

### FuturaTickets Architecture
- See `CLAUDE.md` files in each repository for detailed service documentation
- Review `.env.example` files for complete environment variable lists

### Contact
For deployment issues, contact the DevOps team or create an issue in the repository.

---

**Last Updated:** 2025-10-13
**Version:** 1.0
**Author:** Claude Code Assistant
