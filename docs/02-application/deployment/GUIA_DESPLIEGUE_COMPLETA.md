# GUÍA COMPLETA DE DESPLIEGUE - FUTURA TICKETS

> **Fecha**: 2025-01-14
> **Versión**: 2.0
> **Plataforma**: Google Cloud Run + MongoDB Atlas + Redis Cloud

---

## 📋 ÍNDICE

1. [Requisitos Previos](#1-requisitos-previos)
2. [Configuración de Servicios Externos](#2-configuración-de-servicios-externos)
3. [Preparación de Variables de Entorno](#3-preparación-de-variables-de-entorno)
4. [Build y Push de Docker Images](#4-build-y-push-de-docker-images)
5. [Deployment en Google Cloud Run](#5-deployment-en-google-cloud-run)
6. [Configuración Post-Deployment](#6-configuración-post-deployment)
7. [Verificación y Testing](#7-verificación-y-testing)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. REQUISITOS PREVIOS

### 1.1 Herramientas Necesarias

```bash
# Node.js 20+
node --version  # v20.x.x

# Docker
docker --version  # 24.0+

# Google Cloud CLI
gcloud --version  # 450.0+

# Git
git --version  # 2.x+
```

### 1.2 Instalar Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-sdk

# Windows
# Descargar desde https://cloud.google.com/sdk/docs/install
```

### 1.3 Configurar Google Cloud

```bash
# Login
gcloud auth login

# Configurar proyecto
gcloud config set project [PROJECT_ID]

# Configurar región por defecto
gcloud config set run/region europe-west1

# Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Configurar Docker para GCR
gcloud auth configure-docker
```

### 1.4 Clonar Repositorios

```bash
# Crear directorio del monorepo
mkdir monorepo-futuratickets
cd monorepo-futuratickets

# Clonar todos los repos
git clone [URL_MARKETPLACE_FRONTEND] futura-market-place-v2
git clone [URL_MARKETPLACE_API] futura-market-place-api
git clone [URL_ADMIN_FRONTEND] futura-tickets-admin
git clone [URL_ADMIN_API] futura-tickets-admin-api
git clone [URL_ACCESS_API] futura-access-api
```

---

## 2. CONFIGURACIÓN DE SERVICIOS EXTERNOS

### 2.1 MongoDB Atlas

#### Crear Cluster

1. Ir a https://cloud.mongodb.com
2. Create New Cluster
   - Cloud Provider: Google Cloud
   - Region: europe-west1
   - Cluster Tier: M10 (mínimo para producción)
   - Cluster Name: futura-prod

#### Configurar Seguridad

```bash
# Database Access
1. Database Access → Add New Database User
   - Username: admin
   - Password: [GENERAR PASSWORD SEGURO]
   - Built-in Role: Atlas admin

# Network Access
2. Network Access → Add IP Address
   - 0.0.0.0/0 (para Cloud Run)
   ⚠️ En producción, usar IPs específicas de Cloud Run

# Get Connection String
3. Connect → Drivers → Copy Connection String
   mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod
```

#### Crear Base de Datos

```bash
# Conectar con MongoDB Compass o mongosh
mongosh "mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/"

# Crear database
use futura-prod

# Crear collections
db.createCollection("accounts")
db.createCollection("events")
db.createCollection("orders")
db.createCollection("sales")
db.createCollection("promoters")
db.createCollection("notifications")

# Crear índices
db.accounts.createIndex({ email: 1 }, { unique: true })
db.orders.createIndex({ paymentId: 1 })
db.sales.createIndex({ event: 1 })
db.sales.createIndex({ client: 1 })
```

### 2.2 Redis Cloud

#### Crear Database

1. Ir a https://redis.com/try-free/
2. Create Database
   - Cloud: Google Cloud
   - Region: europe-west1
   - Memory: 256MB (mínimo)
   - Eviction Policy: allkeys-lru

#### Obtener Credentials

```bash
# Endpoint
redis-xxxxx.cloud.redislabs.com:16379

# Password
[REDIS_PASSWORD]

# Test connection
redis-cli -h redis-xxxxx.cloud.redislabs.com -p 16379 -a [PASSWORD]
PING  # Debe retornar PONG
```

### 2.3 Stripe

#### Configurar Cuenta

1. Ir a https://dashboard.stripe.com
2. Developers → API Keys
   - Publishable key: `pk_live_xxxxx`
   - Secret key: `sk_live_xxxxx`

#### Configurar Webhooks

```bash
# 1. Ir a Developers → Webhooks
# 2. Add endpoint
URL: https://marketplace-api-xxxxx-ew.a.run.app/stripe/webhook

# 3. Select events:
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded

# 4. Copy Signing secret
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.4 SendGrid

#### Crear API Key

1. Ir a https://app.sendgrid.com
2. Settings → API Keys → Create API Key
   - Name: futura-tickets-prod
   - Permissions: Full Access

```bash
# API Key
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configurar sender
# Settings → Sender Authentication → Verify Single Sender
# Email: noreply@futuratickets.com
```

### 2.5 Azure Blob Storage

#### Crear Storage Account

```bash
# Azure Portal
1. Create Storage Account
   - Name: futuratickets
   - Region: West Europe
   - Performance: Standard
   - Redundancy: LRS

# Create Container
2. Containers → + Container
   - Name: images
   - Public access level: Blob (public read)

# Get Connection String
3. Access Keys → Copy connection string
DefaultEndpointsProtocol=https;AccountName=futuratickets;AccountKey=xxxxx;EndpointSuffix=core.windows.net

# Blob URL
https://futuratickets.blob.core.windows.net
```

### 2.6 Azure Web PubSub (WebSockets)

#### Crear Web PubSub Resource

```bash
# Azure Portal
1. Create Web PubSub
   - Name: futura-websockets
   - Region: West Europe
   - Pricing Tier: Free

# Create Hub
2. Hubs → Create Hub
   - Name: Centro

# Get Connection String
3. Keys → Copy Connection String
Endpoint=https://futura-websockets.webpubsub.azure.com;AccessKey=xxxxx;Version=1.0;
```

### 2.7 Google OAuth

#### Configurar OAuth 2.0

```bash
# Google Cloud Console
1. APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: Futura Tickets Marketplace
   - Authorized JavaScript origins:
     - https://marketplace.futuratickets.com
     - http://localhost:3001 (para desarrollo)
   - Authorized redirect URIs:
     - https://marketplace.futuratickets.com/api/auth/callback/google

# Copy Client ID
xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 3. PREPARACIÓN DE VARIABLES DE ENTORNO

### 3.1 Marketplace Frontend (.env.production)

```bash
# Create file
cd futura-market-place-v2
cat > .env.production << 'EOF'
# APIs Backend
NEXT_PUBLIC_FUTURA_API=https://marketplace-api-xxxxx-ew.a.run.app
NEXT_PUBLIC_FUTURA=https://admin-api-xxxxx-ew.a.run.app
NEXT_PUBLIC_REFACTOR_RESALE_API=https://admin-api-xxxxx-ew.a.run.app

# Azure Blob Storage
NEXT_PUBLIC_BLOB_URL=https://futuratickets.blob.core.windows.net/images

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
EOF
```

### 3.2 Marketplace API (.env.production)

```bash
cd futura-market-place-api
cat > .env.production << 'EOF'
# Application
PORT=3002
NODE_ENV=production

# Database
MONGO_URL=mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod

# JWT
JWT_SECRET_KEY=[GENERAR_SECRET_SEGURO_64_CHARS]

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRIVATE_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_ENDPOINT_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Redis
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=16379
REDIS_PASSWORD=[REDIS_PASSWORD]

# Email
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=noreply@futuratickets.com

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=futuratickets;AccountKey=xxxxx;EndpointSuffix=core.windows.net
BLOB_URL=https://futuratickets.blob.core.windows.net

# WebSocket
SOCKET_MARKETPLACE=Endpoint=https://futura-websockets.webpubsub.azure.com;AccessKey=xxxxx;Version=1.0;

# Frontend URL
FUTURA_MARKET_PLACE=https://marketplace.futuratickets.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EOF
```

### 3.3 Admin Frontend (.env.production)

```bash
cd futura-tickets-admin
cat > .env.production << 'EOF'
# Admin API
NEXT_PUBLIC_FUTURA=https://admin-api-xxxxx-ew.a.run.app

# Socket Endpoints
NEXT_PUBLIC_FUTURA=wss://admin-api-xxxxx-ew.a.run.app
NEXT_PUBLIC_ACCESS=wss://access-api-xxxxx-ew.a.run.app
NEXT_PUBLIC_MARKETPLACE=wss://marketplace-api-xxxxx-ew.a.run.app

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
EOF
```

### 3.4 Admin API (.env.production)

```bash
cd futura-tickets-admin-api
cat > .env.production << 'EOF'
# Application
PORT=3003
NODE_ENV=production

# Database
MONGO_URL=mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod

# JWT
JWT_SECRET_KEY=[MISMO_QUE_MARKETPLACE_API]

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=futuratickets;AccountKey=xxxxx;EndpointSuffix=core.windows.net
BLOB_URL=https://futuratickets.blob.core.windows.net

# WebSocket
SOCKET_ADMIN=Endpoint=https://futura-websockets.webpubsub.azure.com;AccessKey=xxxxx;Version=1.0;
EOF
```

### 3.5 Access API (.env.production)

```bash
cd futura-access-api
cat > .env.production << 'EOF'
# Application
PORT=3004
NODE_ENV=production

# Database
MONGO_URL=mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod

# JWT
JWT_SECRET_KEY=[MISMO_QUE_MARKETPLACE_API]

# WebSocket
SOCKET_ACCESS=Endpoint=https://futura-websockets.webpubsub.azure.com;AccessKey=xxxxx;Version=1.0;
EOF
```

---

## 4. BUILD Y PUSH DE DOCKER IMAGES

### 4.1 Marketplace API

```bash
cd futura-market-place-api

# Build
docker build -t gcr.io/[PROJECT_ID]/marketplace-api:latest .

# Test local
docker run -p 3002:3002 --env-file .env.production gcr.io/[PROJECT_ID]/marketplace-api:latest

# Push to GCR
docker push gcr.io/[PROJECT_ID]/marketplace-api:latest
```

### 4.2 Marketplace Frontend

```bash
cd futura-market-place-v2

# Build
docker build -t gcr.io/[PROJECT_ID]/marketplace-frontend:latest .

# Test local
docker run -p 3001:3001 --env-file .env.production gcr.io/[PROJECT_ID]/marketplace-frontend:latest

# Push
docker push gcr.io/[PROJECT_ID]/marketplace-frontend:latest
```

### 4.3 Admin API

```bash
cd futura-tickets-admin-api

# Build
docker build -t gcr.io/[PROJECT_ID]/admin-api:latest .

# Test local
docker run -p 3003:3003 --env-file .env.production gcr.io/[PROJECT_ID]/admin-api:latest

# Push
docker push gcr.io/[PROJECT_ID]/admin-api:latest
```

### 4.4 Admin Frontend

```bash
cd futura-tickets-admin

# Build
docker build -t gcr.io/[PROJECT_ID]/admin-frontend:latest .

# Test local
docker run -p 3001:3001 --env-file .env.production gcr.io/[PROJECT_ID]/admin-frontend:latest

# Push
docker push gcr.io/[PROJECT_ID]/admin-frontend:latest
```

### 4.5 Access API

```bash
cd futura-access-api

# Build
docker build -t gcr.io/[PROJECT_ID]/access-api:latest .

# Test local
docker run -p 3004:3004 --env-file .env.production gcr.io/[PROJECT_ID]/access-api:latest

# Push
docker push gcr.io/[PROJECT_ID]/access-api:latest
```

---

## 5. DEPLOYMENT EN GOOGLE CLOUD RUN

### 5.1 Script de Deployment Automatizado

```bash
#!/bin/bash
# deploy-all.sh

PROJECT_ID="your-project-id"
REGION="europe-west1"

# Set environment variables (cargar desde archivos .env)
source .env.production

# Deploy Marketplace API
echo "🚀 Deploying Marketplace API..."
gcloud run deploy marketplace-api \
  --image gcr.io/$PROJECT_ID/marketplace-api:latest \
  --platform managed \
  --region $REGION \
  --port 3002 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "\
MONGO_URL=$MONGO_URL,\
JWT_SECRET_KEY=$JWT_SECRET_KEY,\
STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY,\
STRIPE_PRIVATE_KEY=$STRIPE_PRIVATE_KEY,\
STRIPE_ENDPOINT_SECRET=$STRIPE_ENDPOINT_SECRET,\
REDIS_HOST=$REDIS_HOST,\
REDIS_PORT=$REDIS_PORT,\
REDIS_PASSWORD=$REDIS_PASSWORD,\
MAIL_HOST=$MAIL_HOST,\
MAIL_PORT=$MAIL_PORT,\
MAIL_USER=$MAIL_USER,\
MAIL_PASSWORD=$MAIL_PASSWORD,\
MAIL_FROM=$MAIL_FROM,\
AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING,\
BLOB_URL=$BLOB_URL,\
SOCKET_MARKETPLACE=$SOCKET_MARKETPLACE,\
FUTURA_MARKET_PLACE=$FUTURA_MARKET_PLACE"

# Deploy Marketplace Frontend
echo "🚀 Deploying Marketplace Frontend..."
gcloud run deploy marketplace-frontend \
  --image gcr.io/$PROJECT_ID/marketplace-frontend:latest \
  --platform managed \
  --region $REGION \
  --port 3001 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 60 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "\
NEXT_PUBLIC_FUTURA_API=https://marketplace-api-xxxxx-ew.a.run.app,\
NEXT_PUBLIC_FUTURA=https://admin-api-xxxxx-ew.a.run.app,\
NEXT_PUBLIC_REFACTOR_RESALE_API=https://admin-api-xxxxx-ew.a.run.app,\
NEXT_PUBLIC_BLOB_URL=$BLOB_URL,\
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"

# Deploy Admin API
echo "🚀 Deploying Admin API..."
gcloud run deploy admin-api \
  --image gcr.io/$PROJECT_ID/admin-api:latest \
  --platform managed \
  --region $REGION \
  --port 3003 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "\
MONGO_URL=$MONGO_URL,\
JWT_SECRET_KEY=$JWT_SECRET_KEY,\
AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING,\
BLOB_URL=$BLOB_URL,\
SOCKET_ADMIN=$SOCKET_ADMIN"

# Deploy Admin Frontend
echo "🚀 Deploying Admin Frontend..."
gcloud run deploy admin-frontend \
  --image gcr.io/$PROJECT_ID/admin-frontend:latest \
  --platform managed \
  --region $REGION \
  --port 3001 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 60 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "\
NEXT_PUBLIC_FUTURA=https://admin-api-xxxxx-ew.a.run.app,\
NEXT_PUBLIC_ACCESS=wss://access-api-xxxxx-ew.a.run.app,\
NEXT_PUBLIC_MARKETPLACE=wss://marketplace-api-xxxxx-ew.a.run.app,\
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"

# Deploy Access API
echo "🚀 Deploying Access API..."
gcloud run deploy access-api \
  --image gcr.io/$PROJECT_ID/access-api:latest \
  --platform managed \
  --region $REGION \
  --port 3004 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 60 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "\
MONGO_URL=$MONGO_URL,\
JWT_SECRET_KEY=$JWT_SECRET_KEY,\
SOCKET_ACCESS=$SOCKET_ACCESS"

echo "✅ All services deployed!"
```

### 5.2 Ejecutar Deployment

```bash
# Dar permisos
chmod +x deploy-all.sh

# Ejecutar
./deploy-all.sh
```

### 5.3 Obtener URLs de Servicios

```bash
# Listar servicios
gcloud run services list

# Obtener URL específica
gcloud run services describe marketplace-api --region europe-west1 --format 'value(status.url)'
gcloud run services describe marketplace-frontend --region europe-west1 --format 'value(status.url)'
gcloud run services describe admin-api --region europe-west1 --format 'value(status.url)'
gcloud run services describe admin-frontend --region europe-west1 --format 'value(status.url)'
gcloud run services describe access-api --region europe-west1 --format 'value(status.url)'
```

---

## 6. CONFIGURACIÓN POST-DEPLOYMENT

### 6.1 Configurar Custom Domains (Opcional)

```bash
# Mapear dominio a servicio
gcloud run domain-mappings create --service marketplace-frontend --domain marketplace.futuratickets.com --region europe-west1
gcloud run domain-mappings create --service admin-frontend --domain admin.futuratickets.com --region europe-west1

# Verificar DNS
gcloud run domain-mappings describe --domain marketplace.futuratickets.com --region europe-west1

# Configurar DNS en tu proveedor (Cloudflare, GoDaddy, etc.)
# Tipo: CNAME
# Name: marketplace
# Value: ghs.googlehosted.com
```

### 6.2 Configurar Cloud Armor (Firewall)

```bash
# Crear policy
gcloud compute security-policies create futura-policy \
    --description "Futura Tickets Security Policy"

# Rate limiting rule
gcloud compute security-policies rules create 1000 \
    --security-policy futura-policy \
    --expression "origin.region_code == 'CN'" \
    --action "deny-403"

# DDoS protection
gcloud compute security-policies rules create 2000 \
    --security-policy futura-policy \
    --expression "request.headers['user-agent'].contains('bot')" \
    --action "rate-based-ban" \
    --rate-limit-threshold-count 100 \
    --rate-limit-threshold-interval-sec 60
```

### 6.3 Configurar Cloud Logging

```bash
# Crear log sink
gcloud logging sinks create futura-logs-sink \
    storage.googleapis.com/futura-logs-bucket \
    --log-filter='resource.type="cloud_run_revision"'

# Ver logs en tiempo real
gcloud run services logs tail marketplace-api --region europe-west1
```

### 6.4 Configurar Alertas

```bash
# Alert policy para errores 5xx
gcloud alpha monitoring policies create \
    --notification-channels=[CHANNEL_ID] \
    --display-name="Futura API Errors" \
    --condition-threshold-value=10 \
    --condition-threshold-duration=60s \
    --condition-threshold-comparison=COMPARISON_GT \
    --condition-threshold-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.label.response_code_class="5xx"'
```

### 6.5 Actualizar Stripe Webhooks

```bash
# Ir a Stripe Dashboard → Webhooks
# Editar endpoint URL:
https://marketplace-api-xxxxx-ew.a.run.app/stripe/webhook

# Test webhook
stripe trigger payment_intent.succeeded
```

### 6.6 Crear Usuario Admin Inicial

```bash
# Conectar a MongoDB
mongosh "mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod"

# Crear admin
db.accounts.insertOne({
  name: "Admin",
  lastName: "Futura",
  email: "admin@futuratickets.com",
  password: "$2b$10$[HASH_BCRYPT_DE_PASSWORD]",  // Generar con bcrypt
  role: "ADMIN",
  registered: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 7. VERIFICACIÓN Y TESTING

### 7.1 Health Checks

```bash
# Marketplace API
curl https://marketplace-api-xxxxx-ew.a.run.app/health
# Expected: {"status":"ok"}

# Admin API
curl https://admin-api-xxxxx-ew.a.run.app/health

# Access API
curl https://access-api-xxxxx-ew.a.run.app/health
```

### 7.2 Test Stripe Config

```bash
# Get Stripe public key
curl https://marketplace-api-xxxxx-ew.a.run.app/stripe/config

# Expected:
# {"config":"pk_live_xxxxxxxxxxxxxxxxxxxxx"}
```

### 7.3 Test Auth Flow

```bash
# Test login
curl -X POST https://marketplace-api-xxxxx-ew.a.run.app/api/auth/login-credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"marketplace-test@futuratickets.com","password":"Test123456"}'

# Expected:
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{...}}
```

### 7.4 Load Testing (Opcional)

```bash
# Install k6
brew install k6

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let res = http.get('https://marketplace-api-xxxxx-ew.a.run.app/stripe/config');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

# Run test
k6 run load-test.js
```

---

## 8. TROUBLESHOOTING

### 8.1 Service Not Starting

```bash
# Ver logs detallados
gcloud run services logs read marketplace-api --region europe-west1 --limit 50

# Ver configuración del servicio
gcloud run services describe marketplace-api --region europe-west1

# Verificar variables de entorno
gcloud run services describe marketplace-api --region europe-west1 --format="value(spec.template.spec.containers[0].env)"
```

### 8.2 Database Connection Issues

```bash
# Test MongoDB connection desde local
mongosh "mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod" --eval "db.adminCommand('ping')"

# Verificar IP Whitelist en MongoDB Atlas
# Network Access → debe incluir 0.0.0.0/0

# Test desde Cloud Shell
gcloud cloud-shell ssh
mongosh "mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod"
```

### 8.3 Stripe Webhook Failures

```bash
# Ver logs de Stripe Dashboard
# Developers → Webhooks → [Your Endpoint] → Logs

# Test webhook manualmente
stripe listen --forward-to https://marketplace-api-xxxxx-ew.a.run.app/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded

# Verificar logs
gcloud run services logs read marketplace-api --region europe-west1 --filter="webhook"
```

### 8.4 High Memory Usage

```bash
# Aumentar memoria
gcloud run services update marketplace-api \
  --memory 2Gi \
  --region europe-west1

# Monitoring
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/memory/utilizations"' \
  --format="table(metric.labels.service_name)"
```

### 8.5 Slow Response Times

```bash
# Enable Cloud Trace
gcloud run services update marketplace-api \
  --set-env-vars GOOGLE_CLOUD_TRACE_ENABLED=true \
  --region europe-west1

# View traces
gcloud trace list --limit 10

# Check cold starts
gcloud run services update marketplace-api \
  --min-instances 1 \
  --region europe-west1
```

### 8.6 Rollback Deployment

```bash
# List revisions
gcloud run revisions list --service marketplace-api --region europe-west1

# Rollback to previous revision
gcloud run services update-traffic marketplace-api \
  --to-revisions [REVISION_NAME]=100 \
  --region europe-west1
```

---

## 9. MAINTENANCE Y UPDATES

### 9.1 Update Service

```bash
# Build new image
docker build -t gcr.io/[PROJECT_ID]/marketplace-api:v2.0 .
docker push gcr.io/[PROJECT_ID]/marketplace-api:v2.0

# Deploy with canary release
gcloud run services update marketplace-api \
  --image gcr.io/[PROJECT_ID]/marketplace-api:v2.0 \
  --region europe-west1

# Split traffic (canary)
gcloud run services update-traffic marketplace-api \
  --to-revisions [NEW_REVISION]=20,[OLD_REVISION]=80 \
  --region europe-west1

# Full rollout
gcloud run services update-traffic marketplace-api \
  --to-latest \
  --region europe-west1
```

### 9.2 Database Migrations

```bash
# Backup before migration
mongodump --uri="mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod" --out=/backup/$(date +%Y%m%d)

# Run migration script
mongosh "mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod" < migration.js

# Verify
mongosh "mongodb+srv://admin:[PASSWORD]@futura-prod.xxxxx.mongodb.net/futura-prod" --eval "db.version()"
```

### 9.3 Monitor Costs

```bash
# View billing
gcloud billing accounts list
gcloud billing projects list

# Set budget alerts
gcloud billing budgets create \
  --billing-account=[BILLING_ACCOUNT_ID] \
  --display-name="Futura Monthly Budget" \
  --budget-amount=500USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90
```

---

## 10. CHECKLIST DE DEPLOYMENT

### Pre-Deployment

- [ ] Todos los servicios externos configurados (MongoDB, Redis, Stripe, etc.)
- [ ] Variables de entorno preparadas y verificadas
- [ ] Docker images construidas y pusheadas a GCR
- [ ] Dominios configurados (DNS)
- [ ] Certificados SSL verificados

### Deployment

- [ ] Marketplace API deployed
- [ ] Marketplace Frontend deployed
- [ ] Admin API deployed
- [ ] Admin Frontend deployed
- [ ] Access API deployed

### Post-Deployment

- [ ] Health checks pasando
- [ ] Auth flow funcionando
- [ ] Stripe configurado y testeado
- [ ] Webhooks funcionando
- [ ] Emails enviándose correctamente
- [ ] WebSockets conectando
- [ ] Logs y monitoring configurados
- [ ] Alertas configuradas
- [ ] Usuario admin creado
- [ ] Load testing ejecutado

---

**Última Actualización**: 2025-01-14
**Autor**: Claude Code
**Versión**: 1.0
