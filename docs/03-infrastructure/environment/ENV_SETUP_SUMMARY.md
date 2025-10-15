# FuturaTickets Environment Variables Setup - Summary

## Overview
Created comprehensive `.env.example` files for 4 FuturaTickets repositories based on analysis of CLAUDE.md documentation and source code inspection.

---

## Files Created

### 1. `/futura-market-place-api/.env.example`
**Repository Type:** NestJS Backend API
**Port:** 3000
**Purpose:** Main marketplace API - payments, orders, email system

#### Key Variables (24 total):
- **Application:** PORT, NODE_ENV
- **Database:** MONGO_URL
- **Authentication:** JWT_SECRET_KEY
- **Stripe Payment:** STRIPE_PUBLIC_KEY, STRIPE_PRIVATE_KEY, STRIPE_ENDPOINT_SECRET
- **Redis Queue:** REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD
- **Email SMTP:** MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_FROM
- **Azure:** AZURE_STORAGE_CONNECTION_STRING, BLOB_URL, SOCKET_MARKET_PLACE
- **Frontend URLs:** FUTURA_MARKET_PLACE
- **Rate Limiting:** THROTTLE_TTL, THROTTLE_LIMIT

#### Special Features:
- ✅ Comprehensive comments explaining each variable
- ✅ Production checklist included
- ✅ Security notes with best practices
- ✅ Email system configuration (9 types of transactional emails)
- ✅ Bull queue configuration for async jobs
- ⚠️ Notes about hardcoded values in mail.module.ts that should be fixed

---

### 2. `/futura-access-api/.env.example`
**Repository Type:** NestJS Backend API
**Port:** 3000
**Purpose:** Ticket validation and access control with real-time WebSockets

#### Key Variables (8 total):
- **Application:** PORT, NODE_ENV
- **Database:** MONGO_URL (shared with marketplace)
- **Authentication:** JWT_SECRET_KEY (MUST match marketplace API)
- **WebSocket:** SOCKET_ACCESS (Azure Web PubSub)
- **Rate Limiting:** THROTTLE_TTL, THROTTLE_LIMIT

#### Special Features:
- ✅ Detailed WebSocket configuration explanation
- ✅ Access control workflow diagram in comments
- ✅ Integration notes with other services
- ✅ Security notes about JWT key synchronization
- ✅ Shared MongoDB collections documentation
- ⚠️ Important note about JWT_SECRET_KEY needing to match across all APIs

---

### 3. `/futura-market-place-v2/.env.example`
**Repository Type:** Next.js 15 Frontend
**Port:** 3003
**Purpose:** Customer-facing ticket marketplace

#### Key Variables (6 required + optional):
- **Backend APIs:**
  - NEXT_PUBLIC_FUTURA_API (main API)
  - NEXT_PUBLIC_FUTURA (events API)
  - NEXT_PUBLIC_REFACTOR_RESALE_API (resale/transfer API)
- **Azure Storage:** NEXT_PUBLIC_BLOB_URL
- **Google OAuth:** NEXT_PUBLIC_GOOGLE_CLIENT_ID
- **Optional:** Analytics (GTM, Sentry, GA)

#### Special Features:
- ✅ Environment-specific configurations (dev/staging/prod)
- ✅ Known issues section with security warnings
- ✅ Cart & checkout flow documentation
- ⚠️ BUG ALERT: Google Client ID hardcoded in layout.tsx (line 30)
- ⚠️ SECURITY: JWT token in localStorage (should migrate to httpOnly cookies)
- ⚠️ ARCHITECTURE: Three different API URLs should be unified
- ⚠️ BUG: GlobalContext array spread issue documented

---

### 4. `/futura-tickets-admin/.env.example`
**Repository Type:** Next.js 15 Frontend
**Port:** 3001
**Purpose:** Admin panel for event promoters

#### Key Variables (9 required + optional):
- **Backend API:** NEXT_PUBLIC_FUTURA
- **WebSocket Endpoints (3):**
  - NEXT_PUBLIC_SOCKET_URL (admin events)
  - NEXT_PUBLIC_SOCKET_ACCESS_URL (access control)
  - NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL (marketplace events)
- **Azure Storage:** NEXT_PUBLIC_BLOB_URL
- **Frontend URL:** NEXT_PUBLIC_MARKET_PLACE (for preview links)
- **Blockchain:** NEXT_PUBLIC_BASE_SEPOLIA_SCAN
- **Google OAuth:** NEXT_PUBLIC_GOOGLE_CLIENT_ID
- **Optional:** Analytics (Sentry, GA, LogRocket)

#### Special Features:
- ✅ Three separate WebSocket endpoints for different event types
- ✅ Admin panel features documentation
- ✅ WebSocket event types catalog
- ✅ Global state management explanation
- ⚠️ CRITICAL: services.tsx is 28,142 lines - needs refactoring
- ⚠️ CRITICAL: interfaces.tsx is 9,690 lines - needs refactoring
- ⚠️ 0% test coverage
- ⚠️ JWT token in localStorage (security issue)

---

## Cross-Repository Requirements

### Shared Environment Variables
These MUST be synchronized across repositories:

1. **JWT_SECRET_KEY** - CRITICAL
   - Used in: `futura-market-place-api`, `futura-access-api`
   - Purpose: Single sign-on (SSO) token validation
   - **⚠️ MUST BE IDENTICAL** across all backend APIs

2. **MONGO_URL** - Database Connection
   - Used in: `futura-market-place-api`, `futura-access-api`
   - Purpose: Shared MongoDB database
   - Collections: accounts, events, sales, orders, promoters

3. **BLOB_URL** - Azure Blob Storage
   - Used in: All 4 repositories
   - Purpose: Event images, ticket images, assets
   - Format: `https://youraccount.blob.core.windows.net/images`

### API Endpoint Mapping

```
Frontend (marketplace-v2) → Backend APIs
├── NEXT_PUBLIC_FUTURA_API → futura-market-place-api (port 3000)
├── NEXT_PUBLIC_FUTURA → futura-market-place-api (same as above, should be unified)
└── NEXT_PUBLIC_REFACTOR_RESALE_API → futura-market-place-api (same, needs unification)

Frontend (admin) → Backend API
└── NEXT_PUBLIC_FUTURA → futura-tickets-admin-api (port 3000)
```

---

## Security Findings & Recommendations

### Critical Security Issues Found

1. **Hardcoded Credentials in Code**
   - **Location:** `futura-market-place-api/src/Mail/mail.module.ts:42-46`
   - **Issue:** SMTP credentials hardcoded (noreply@futuratickets.com / password visible)
   - **Fix:** Move to environment variables immediately
   - **Priority:** 🔴 CRITICAL

2. **Google OAuth Client ID Exposed**
   - **Location:** `futura-market-place-v2/app/layout.tsx:30`
   - **Issue:** Client ID hardcoded in source code
   - **Fix:** Move to NEXT_PUBLIC_GOOGLE_CLIENT_ID env var
   - **Priority:** 🔴 CRITICAL

3. **JWT Token in localStorage**
   - **Locations:** All frontend apps
   - **Issue:** Vulnerable to XSS attacks
   - **Fix:** Migrate to httpOnly cookies
   - **Priority:** 🟡 HIGH

4. **Multiple API URLs**
   - **Issue:** Three different env vars pointing to same API
   - **Fix:** Unify into single NEXT_PUBLIC_API_URL
   - **Priority:** 🟡 HIGH

### Security Best Practices Included

✅ Each .env.example includes:
- Production checklist
- Security notes section
- Secrets rotation recommendations
- 2FA reminders
- Monitoring suggestions
- CORS configuration notes

---

## Production Deployment Checklist

### Backend APIs (marketplace-api & access-api)

- [ ] Generate strong JWT_SECRET_KEY (64+ random bytes)
- [ ] Ensure JWT_SECRET_KEY is identical across all APIs
- [ ] Configure MongoDB Atlas production cluster
- [ ] Set up Redis with authentication
- [ ] Configure production SMTP provider (SendGrid/AWS SES)
- [ ] Set up Azure Storage with CORS policies
- [ ] Configure Azure Web PubSub for WebSockets
- [ ] Use Stripe production keys (pk_live_*/sk_live_*)
- [ ] Set NODE_ENV=production
- [ ] Enable SSL/TLS for all connections
- [ ] Configure rate limiting for production traffic
- [ ] Set up monitoring (Sentry/DataDog)

### Frontend Apps (marketplace-v2 & admin)

- [ ] Set all API URLs to production endpoints
- [ ] Configure Google OAuth production client ID
- [ ] Fix hardcoded Google Client ID in layout.tsx
- [ ] Migrate JWT storage to httpOnly cookies
- [ ] Enable TypeScript/ESLint validation in builds
- [ ] Enable Next.js image optimization
- [ ] Configure CSP headers
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Test WebSocket reconnection logic
- [ ] Verify CORS on all API endpoints
- [ ] Set up SSL certificates

---

## Development Setup Instructions

### 1. Clone and Install
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Backend APIs
cd futura-market-place-api
cp .env.example .env
npm install

cd ../futura-access-api
cp .env.example .env
npm install

# Frontend Apps
cd ../futura-market-place-v2
cp .env.example .env
npm install

cd ../futura-tickets-admin
cp .env.example .env
npm install
```

### 2. Configure MongoDB
```bash
# Option A: Local MongoDB
brew install mongodb-community
brew services start mongodb-community
# Use: MONGO_URL=mongodb://localhost:27017/futuratickets

# Option B: MongoDB Atlas (recommended)
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Get connection string
# Use: MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/futuratickets
```

### 3. Configure Redis
```bash
# Option A: Local Redis
brew install redis
brew services start redis
# Use: REDIS_HOST=localhost, REDIS_PORT=6379

# Option B: Redis Cloud (recommended for production)
# 1. Create account at https://redis.com/cloud
# 2. Create database
# 3. Get connection details
```

### 4. Configure Stripe
```bash
# 1. Create account at https://dashboard.stripe.com
# 2. Get test keys from API keys section
# STRIPE_PUBLIC_KEY=pk_test_...
# STRIPE_PRIVATE_KEY=sk_test_...
# 3. Set up webhook endpoint
# STRIPE_ENDPOINT_SECRET=whsec_...
```

### 5. Configure Azure (Optional - for production)
```bash
# Azure Blob Storage
# 1. Create Storage Account
# 2. Create container "images"
# 3. Get connection string
# AZURE_STORAGE_CONNECTION_STRING=DefaultEndpoints...
# BLOB_URL=https://youraccount.blob.core.windows.net/images

# Azure Web PubSub
# 1. Create Web PubSub resource
# 2. Get connection string
# SOCKET_MARKET_PLACE=Endpoint=https://...;AccessKey=...
# SOCKET_ACCESS=Endpoint=https://...;AccessKey=...
```

### 6. Configure Google OAuth
```bash
# 1. Go to https://console.cloud.google.com
# 2. Create project
# 3. Enable Google+ API
# 4. Create OAuth 2.0 credentials
# 5. Add authorized origins:
#    - http://localhost:3003 (marketplace)
#    - http://localhost:3001 (admin)
# 6. Copy Client ID to:
#    NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### 7. Start Services
```bash
# Terminal 1: Marketplace API
cd futura-market-place-api
npm run start:dev  # Port 3000

# Terminal 2: Access API
cd futura-access-api
npm run start:dev  # Port 3000 (or change PORT=3002 in .env)

# Terminal 3: Marketplace Frontend
cd futura-market-place-v2
npm run dev  # Port 3003

# Terminal 4: Admin Frontend
cd futura-tickets-admin
npm run dev  # Port 3001
```

---

## Environment Variables by Priority

### 🔴 CRITICAL (Required for basic functionality)
1. `JWT_SECRET_KEY` - Authentication
2. `MONGO_URL` - Database connection
3. `STRIPE_PUBLIC_KEY` / `STRIPE_PRIVATE_KEY` - Payments
4. `NEXT_PUBLIC_FUTURA_API` - Frontend → Backend connection

### 🟡 HIGH (Required for full functionality)
1. `REDIS_HOST` / `REDIS_PORT` - Email queues
2. `MAIL_HOST` / `MAIL_USER` / `MAIL_PASSWORD` - Transactional emails
3. `BLOB_URL` - Event images
4. `SOCKET_*` - Real-time features
5. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - OAuth login

### 🟢 MEDIUM (Optional but recommended)
1. `STRIPE_ENDPOINT_SECRET` - Webhook validation
2. `AZURE_STORAGE_CONNECTION_STRING` - File uploads
3. `THROTTLE_TTL` / `THROTTLE_LIMIT` - Rate limiting

### ⚪ LOW (Optional, nice to have)
1. Analytics (GTM_ID, GA_ID, SENTRY_DSN)
2. Feature flags
3. Log levels

---

## Testing the Setup

### Backend API Health Check
```bash
# Marketplace API
curl http://localhost:3000/

# Access API
curl http://localhost:3000/
```

### Frontend Access
```bash
# Marketplace
open http://localhost:3003

# Admin
open http://localhost:3001
```

### Stripe Integration Test
```bash
# Get Stripe config
curl http://localhost:3003/api/stripe

# Expected response:
{"config":"pk_test_..."}
```

### Database Connection Test
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/futuratickets"

# List collections
show collections
# Expected: accounts, events, sales, orders, promoters, etc.
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check MongoDB is running
brew services list | grep mongodb
# If not running:
brew services start mongodb-community
```

### Issue: "Redis connection failed"
**Solution:**
```bash
# Check Redis is running
redis-cli ping
# Expected: PONG
# If not running:
brew services start redis
```

### Issue: "Stripe webhook signature verification failed"
**Solution:**
- Ensure STRIPE_ENDPOINT_SECRET matches webhook secret in Stripe dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/stripe/webhook`

### Issue: "Google OAuth redirect_uri_mismatch"
**Solution:**
- Add http://localhost:3003 to authorized redirect URIs in Google Console
- Ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID matches the correct OAuth client

### Issue: "CORS error when calling API"
**Solution:**
- Ensure API URLs in frontend .env match running backend ports
- Check CORS configuration in backend (may need to enable for localhost)

---

## Next Steps

1. **Immediate Actions:**
   - [ ] Move hardcoded SMTP credentials to env vars
   - [ ] Move hardcoded Google Client ID to env var
   - [ ] Generate strong JWT_SECRET_KEY for all environments
   - [ ] Set up development MongoDB and Redis

2. **Before First Production Deploy:**
   - [ ] Complete production checklist in each .env.example
   - [ ] Set up monitoring and error tracking
   - [ ] Configure backup strategies
   - [ ] Set up CI/CD pipelines
   - [ ] Security audit

3. **Code Improvements Needed:**
   - [ ] Fix GlobalContext bug in marketplace-v2
   - [ ] Refactor services.tsx in admin (28k lines)
   - [ ] Refactor interfaces.tsx in admin (9k lines)
   - [ ] Migrate localStorage JWT to httpOnly cookies
   - [ ] Unify three API URLs into one
   - [ ] Add input validation to API routes

---

## Contact & Support

For questions about environment setup:
1. Check CLAUDE.md in each repository for detailed documentation
2. Refer to this ENV_SETUP_SUMMARY.md
3. Check individual .env.example files for variable-specific notes

---

**Generated:** 2025-10-13
**Author:** Claude Code Assistant
**Version:** 1.0
**Repositories Covered:** 4/14 FuturaTickets repos
