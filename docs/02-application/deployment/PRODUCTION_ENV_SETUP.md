# Production Environment Variables Setup Guide

> **📋 Complete guide for configuring environment variables across all FuturaTickets APIs**
>
> **Last Updated:** 2025-10-13
> **APIs Covered:** futura-tickets-admin-api, futura-market-place-api, futura-access-api

---

## 🎯 Overview

This guide provides step-by-step instructions for setting up production environment variables for all three FuturaTickets backend APIs. All APIs share common variables (JWT, MongoDB, Redis) and have service-specific configurations.

---

## 🔑 Critical Security Requirements

### **1. JWT Secret Key Synchronization**

⚠️ **CRITICAL**: The `JWT_SECRET_KEY` MUST be **IDENTICAL** across all three APIs:

- `futura-tickets-admin-api`
- `futura-market-place-api`
- `futura-access-api`

This ensures Single Sign-On (SSO) functionality - tokens issued by one API are valid in all others.

#### Generating a Secure JWT Secret

```bash
# Generate a cryptographically secure 512-bit (64-byte) random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example output:**
```
9d2cacb7a249ce9cc1cc9b42d3259a57137012a25ee71753b6e89d78491e782f4546e5dffca3e78d8cff419308939e0c9eacce631104e6b2d2013bf55437ab5f
```

**Use the SAME value** in all three API `.env` files.

---

## 📦 Shared Services

### MongoDB Atlas

All APIs connect to the same MongoDB database with different collections.

**Setup Steps:**

1. Create MongoDB Atlas cluster at https://cloud.mongodb.com
2. Create a database user with read/write access
3. Get connection string from Atlas dashboard
4. Add your server IP to IP whitelist (or use `0.0.0.0/0` for testing - **not recommended for production**)

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Example:**
```
MONGO_URL=mongodb+srv://futuraadmin:SecurePass123@cluster0.abc123.mongodb.net/futuratickets?retryWrites=true&w=majority
```

---

### Redis (Bull Queues)

All APIs use Redis for job queues (email sending, background tasks).

**Options:**

#### Option 1: Redis Cloud (Recommended)
1. Create free account at https://redis.com/try-free/
2. Create database instance
3. Get connection details

**Configuration:**
```bash
REDIS_HOST=redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password_here
```

#### Option 2: Azure Cache for Redis
1. Create Redis instance in Azure Portal
2. Enable non-SSL port (6379) or use SSL port (6380)
3. Get access keys

**Configuration:**
```bash
REDIS_HOST=your-redis-instance.redis.cache.windows.net
REDIS_PORT=6380
REDIS_USERNAME=
REDIS_PASSWORD=your_primary_access_key
```

#### Option 3: Self-hosted Redis
```bash
REDIS_HOST=your-redis-server.example.com
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=your_redis_password
```

---

### Azure Blob Storage (Images)

Shared storage for event images and assets.

**Setup Steps:**

1. Create Azure Storage Account
2. Create a container named `images` (or your preferred name)
3. Set container access level to "Blob (anonymous read access for blobs only)"
4. Get connection string from Access Keys

**Configuration:**
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=futurastorage;AccountKey=your_long_key_here;EndpointSuffix=core.windows.net

BLOB_URL=https://futurastorage.blob.core.windows.net/images
```

---

## 🔧 API-Specific Configuration

### futura-tickets-admin-api

**Purpose:** Admin panel backend - Event management, promoter tools, analytics

#### Required Environment Variables

```bash
# =============================================================================
# APPLICATION
# =============================================================================
NODE_ENV=production
PORT=3000

# =============================================================================
# DATABASE
# =============================================================================
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/futuratickets?retryWrites=true&w=majority

# =============================================================================
# AUTHENTICATION - JWT
# =============================================================================
# ⚠️ MUST BE IDENTICAL ACROSS ALL APIs
JWT_SECRET_KEY=9d2cacb7a249ce9cc1cc9b42d3259a57137012a25ee71753b6e89d78491e782f4546e5dffca3e78d8cff419308939e0c9eacce631104e6b2d2013bf55437ab5f
JWT_EXPIRES_IN=7d

# =============================================================================
# STRIPE - Payment Processing
# =============================================================================
# Get from: https://dashboard.stripe.com/apikeys
# Use LIVE keys (pk_live_* / sk_live_*) for production
STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here

# Webhook secret from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here

# =============================================================================
# AZURE STORAGE
# =============================================================================
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=futurastorage;AccountKey=your_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=images

# =============================================================================
# REDIS - Bull Queues
# =============================================================================
REDIS_HOST=redis-production.redis.cache.windows.net
REDIS_PORT=6380
REDIS_USERNAME=
REDIS_PASSWORD=your_redis_password

# =============================================================================
# CORS - Allowed Origins
# =============================================================================
# Comma-separated list of allowed frontend URLs
CORS_ORIGINS=https://admin.futuratickets.com,https://marketplace.futuratickets.com

# =============================================================================
# RATE LIMITING
# =============================================================================
THROTTLE_TTL=60000          # Time window in ms (60000 = 1 minute)
THROTTLE_LIMIT=100          # Max requests per window

# =============================================================================
# EMAIL - SMTP Configuration
# =============================================================================
# Option 1: SendGrid (Recommended)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.your_sendgrid_api_key_here
MAIL_FROM=noreply@futuratickets.com

# Option 2: Gmail (Not recommended for production)
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USER=your-email@gmail.com
# MAIL_PASSWORD=your-app-specific-password

# =============================================================================
# BLOCKCHAIN - Ethereum/Polygon
# =============================================================================
# Get RPC URL from: https://infura.io or https://alchemy.com
RPC_URL=https://polygon-mainnet.infura.io/v3/your_infura_project_id
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
CONTRACT_ADDRESS=0xYourDeployedContractAddressHere

# =============================================================================
# SOCKET.IO - WebSockets (Optional)
# =============================================================================
SOCKET_IO_ORIGINS=https://admin.futuratickets.com,https://marketplace.futuratickets.com

# =============================================================================
# AZURE WEB PUBSUB - Real-time (Optional)
# =============================================================================
AZURE_WEB_PUBSUB_CONNECTION_STRING=Endpoint=https://your-pubsub.webpubsub.azure.com;AccessKey=your_key;Version=1.0;

# =============================================================================
# FEATURES
# =============================================================================
ENABLE_CRON_JOBS=true
HEALTH_CHECK_ENABLED=true
LOG_LEVEL=info
```

---

### futura-market-place-api

**Purpose:** Marketplace backend - Payment processing, orders, email system

#### Required Environment Variables

```bash
# =============================================================================
# APPLICATION
# =============================================================================
PORT=3000
NODE_ENV=production

# =============================================================================
# DATABASE
# =============================================================================
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/futuratickets?retryWrites=true&w=majority

# =============================================================================
# AUTHENTICATION - JWT
# =============================================================================
# ⚠️ MUST BE IDENTICAL TO OTHER APIs
JWT_SECRET_KEY=9d2cacb7a249ce9cc1cc9b42d3259a57137012a25ee71753b6e89d78491e782f4546e5dffca3e78d8cff419308939e0c9eacce631104e6b2d2013bf55437ab5f

# =============================================================================
# STRIPE - Payment Gateway
# =============================================================================
STRIPE_PUBLIC_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_PRIVATE_KEY=sk_live_your_stripe_secret_key_here

# Webhook endpoint secret (get from Stripe dashboard after setting webhook URL)
# Webhook URL: https://marketplace-api.futuratickets.com/stripe/webhook
STRIPE_ENDPOINT_SECRET=whsec_your_webhook_signing_secret_here

# =============================================================================
# REDIS - Queue Management (Bull/BullMQ)
# =============================================================================
REDIS_HOST=redis-production.redis.cache.windows.net
REDIS_PORT=6380
REDIS_USERNAME=
REDIS_PASSWORD=your_redis_password

# =============================================================================
# EMAIL - SMTP Configuration
# =============================================================================
# Recommended: SendGrid
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.your_sendgrid_api_key_here
MAIL_FROM=noreply@futuratickets.com

# =============================================================================
# AZURE - Blob Storage & WebSocket
# =============================================================================
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=futurastorage;AccountKey=your_key;EndpointSuffix=core.windows.net
BLOB_URL=https://futurastorage.blob.core.windows.net/images

# Azure Web PubSub for WebSocket scaling (Socket.IO)
SOCKET_MARKET_PLACE=Endpoint=https://your-pubsub.webpubsub.azure.com;AccessKey=your_key;Version=1.0;

# =============================================================================
# FRONTEND URL
# =============================================================================
# Used for generating links in emails (order confirmations, ticket links, etc.)
FUTURA_MARKET_PLACE=https://marketplace.futuratickets.com

# =============================================================================
# RATE LIMITING
# =============================================================================
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# =============================================================================
# CORS (Optional - configured in code)
# =============================================================================
CORS_ORIGINS=https://marketplace.futuratickets.com,https://admin.futuratickets.com
```

---

### futura-access-api

**Purpose:** Access control backend - Ticket validation, check-in system

#### Required Environment Variables

```bash
# =============================================================================
# APPLICATION
# =============================================================================
PORT=3000
NODE_ENV=production

# =============================================================================
# DATABASE
# =============================================================================
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/futuratickets?retryWrites=true&w=majority

# =============================================================================
# AUTHENTICATION - JWT
# =============================================================================
# ⚠️ MUST BE IDENTICAL TO OTHER APIs
JWT_SECRET_KEY=9d2cacb7a249ce9cc1cc9b42d3259a57137012a25ee71753b6e89d78491e782f4546e5dffca3e78d8cff419308939e0c9eacce631104e6b2d2013bf55437ab5f

# =============================================================================
# WEBSOCKET - Azure Web PubSub
# =============================================================================
# Used for real-time access notifications to promoters
SOCKET_ACCESS=Endpoint=https://your-pubsub.webpubsub.azure.com;AccessKey=your_key;Version=1.0;

# =============================================================================
# RATE LIMITING
# =============================================================================
# Access API typically has higher traffic during events
THROTTLE_TTL=60000
THROTTLE_LIMIT=200          # Higher limit for ticket scanning

# =============================================================================
# CORS (Optional - configured in code)
# =============================================================================
CORS_ORIGINS=https://access.futuratickets.com,https://admin.futuratickets.com
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Generate JWT secret (once) using crypto.randomBytes(64)
- [ ] Create MongoDB Atlas cluster and database
- [ ] Setup Redis instance (Cloud or Azure)
- [ ] Create Azure Storage Account and container
- [ ] Get Stripe API keys (LIVE mode)
- [ ] Configure Stripe webhooks with production URLs
- [ ] Setup SendGrid account for emails
- [ ] Create Azure Web PubSub instances (optional)
- [ ] Setup blockchain RPC provider (Infura/Alchemy)

### Configuration

- [ ] Copy `.env.example` to `.env` in each API
- [ ] Fill in all required variables
- [ ] **Verify JWT_SECRET_KEY is IDENTICAL across all APIs**
- [ ] Test MONGO_URL connection
- [ ] Test REDIS connection
- [ ] Test SMTP email sending
- [ ] Test Stripe payment flow in test mode first

### Security

- [ ] Never commit `.env` files to git
- [ ] Use environment variable management (Azure Key Vault, AWS Secrets Manager)
- [ ] Rotate secrets regularly
- [ ] Enable 2FA on all service accounts (Stripe, Azure, MongoDB)
- [ ] Whitelist IPs in MongoDB Atlas
- [ ] Enable SSL/TLS for all connections
- [ ] Set NODE_ENV=production

### Monitoring

- [ ] Setup error tracking (Sentry)
- [ ] Configure logging (CloudWatch, Azure Monitor)
- [ ] Setup uptime monitoring
- [ ] Configure Stripe webhook monitoring
- [ ] Setup alerts for critical errors

---

## 🔍 Testing Environment Variables

Before deploying to production, test your configuration:

### 1. MongoDB Connection
```bash
npm run test:db-connection
# Or manually:
mongosh "$MONGO_URL"
```

### 2. Redis Connection
```bash
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
# Should return: PONG
```

### 3. Stripe Keys
```bash
# Test API call
curl https://api.stripe.com/v1/payment_intents \
  -u $STRIPE_SECRET_KEY: \
  -d amount=1000 \
  -d currency=eur
```

### 4. SMTP Email
```bash
# Send test email through API endpoint
curl -X POST https://your-api.com/test/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'
```

---

## 📚 Best Practices

### Environment Variable Management

1. **Use a Secret Manager in Production**
   - Azure Key Vault
   - AWS Secrets Manager
   - Google Secret Manager
   - HashiCorp Vault

2. **Never Hardcode Secrets**
   - Always use environment variables
   - Use `.env.example` as template (with dummy values)

3. **Separate Environments**
   - Development: `.env.development`
   - Staging: `.env.staging`
   - Production: `.env.production`

4. **Access Control**
   - Limit who can view production secrets
   - Audit access to secrets
   - Rotate credentials after team member departures

### Docker Deployment

**docker-compose.yml example:**
```yaml
version: '3.8'
services:
  admin-api:
    build: ./futura-tickets-admin-api
    env_file:
      - ./futura-tickets-admin-api/.env.production
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis

  marketplace-api:
    build: ./futura-market-place-api
    env_file:
      - ./futura-market-place-api/.env.production
    ports:
      - "3001:3000"

  access-api:
    build: ./futura-access-api
    env_file:
      - ./futura-access-api/.env.production
    ports:
      - "3002:3000"
```

---

## 🆘 Troubleshooting

### JWT Token Issues

**Problem:** Tokens not working across APIs

**Solution:** Verify JWT_SECRET_KEY is **exactly the same** in all three `.env` files:
```bash
# Check secrets match
cd futura-tickets-admin-api && grep JWT_SECRET_KEY .env
cd ../futura-market-place-api && grep JWT_SECRET_KEY .env
cd ../futura-access-api && grep JWT_SECRET_KEY .env
```

### MongoDB Connection Failed

**Problem:** Cannot connect to MongoDB

**Checklist:**
- [ ] IP whitelisted in Atlas
- [ ] Username/password correct
- [ ] Database name matches
- [ ] Connection string properly URL-encoded

### Redis Connection Timeout

**Problem:** Bull queues not processing

**Checklist:**
- [ ] Redis host/port correct
- [ ] Password correct (if required)
- [ ] Firewall allows connection
- [ ] Redis instance running

### Stripe Webhooks Not Received

**Problem:** Payments succeed but orders not processed

**Checklist:**
- [ ] Webhook URL configured in Stripe dashboard
- [ ] Webhook secret (STRIPE_ENDPOINT_SECRET) correct
- [ ] API publicly accessible (not localhost)
- [ ] Webhook signature validation passes
- [ ] Check Stripe webhook logs for errors

---

## 📞 Support

For issues with environment variable configuration:

1. Check API-specific documentation in `CLAUDE.md` files
2. Review error logs in application
3. Test connections individually (MongoDB, Redis, Stripe)
4. Verify all secrets are properly URL-encoded if containing special characters

---

**Last Updated:** 2025-10-13
**Maintained by:** FuturaTickets DevOps Team
