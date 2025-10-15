# Local Testing Guide - FuturaTickets

> **📋 Complete guide for testing all FuturaTickets services locally**
>
> **Last Updated:** 2025-10-13
> **Prerequisites:** Docker, Node.js 20+, npm

---

## 🎯 Overview

This guide provides step-by-step instructions for testing the FuturaTickets platform locally, including:
- Individual API testing
- Frontend application testing
- Docker Compose full-stack testing
- Health check verification
- Test suite execution
- Git hooks validation

---

## 📋 Prerequisites

### Required Software

1. **Node.js 20+**
   ```bash
   node --version  # Should be >= 20.0.0
   ```

2. **npm 10+**
   ```bash
   npm --version  # Should be >= 10.0.0
   ```

3. **Docker Desktop** (for full-stack testing)
   ```bash
   docker --version
   docker compose version
   ```

4. **Git**
   ```bash
   git --version
   ```

---

## 🚀 Quick Start - Docker Compose (Recommended)

The fastest way to test everything together is using Docker Compose.

### 1. Start All Services

```bash
# Navigate to monorepo root
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

### 2. Verify All Services are Running

```bash
# Check container status
docker compose ps

# Expected output: all services should show "Up" status
```

### 3. Test Health Endpoints

```bash
# Admin API
curl http://localhost:3001/health

# Marketplace API
curl http://localhost:3002/health

# Access API
curl http://localhost:3004/health

# Expected response (all):
# {"status":"ok","info":{"mongodb":{"status":"up"},"redis":{"status":"up"}},"error":{},"details":{"mongodb":{"status":"up"},"redis":{"status":"up"}},"timestamp":"2025-10-13T...","uptime":123.45}
```

### 4. Access Web Interfaces

Open in your browser:
- **Marketplace Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3003
- **Admin API Swagger:** http://localhost:3001/api/docs
- **Marketplace API Swagger:** http://localhost:3002/api/docs
- **Access API Swagger:** http://localhost:3004/api/docs
- **Mongo Express:** http://localhost:8081 (admin/admin123)
- **MinIO Console:** http://localhost:9001 (futuraadmin/futurapass123)

### 5. Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data!)
docker compose down -v
```

📚 **For detailed Docker testing instructions, see:** [`DOCKER_TESTING_GUIDE.md`](./DOCKER_TESTING_GUIDE.md)

---

## 🔧 Individual API Testing

### futura-tickets-admin-api

**Location:** `futura-tickets-admin-api/`

#### 1. Install Dependencies

```bash
cd futura-tickets-admin-api
npm install
```

#### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your local credentials
# Required for local testing:
# - MONGO_URL (MongoDB connection string)
# - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
# - JWT_SECRET_KEY (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

#### 3. Start Development Server

```bash
npm run start:dev
```

**Expected output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] AppController {/}:
[Nest] INFO [NestApplication] Nest application successfully started
✅ Connected to MongoDB
✅ Redis connected successfully
🚀 Admin API listening on port 3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

#### 4. Test Health Endpoint

```bash
# In another terminal
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","info":{"mongodb":{"status":"up"},"redis":{"status":"up"}},...}
```

#### 5. Test Swagger Documentation

```bash
# Open in browser
open http://localhost:3000/api/docs
```

Verify:
- [ ] Swagger UI loads
- [ ] All endpoints are documented
- [ ] Schemas are visible
- [ ] "Try it out" functionality works

#### 6. Run Tests

```bash
# Unit tests
npm run test

# Watch mode (for development)
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests (requires MongoDB)
npm run test:e2e
```

**Expected output:**
```
Test Suites: X passed, X total
Tests:       X passed, X total
Snapshots:   0 total
Time:        X.XXXs
```

#### 7. Test Git Hooks

```bash
# Make a change to any file
echo "// test comment" >> src/main.ts

# Stage the change
git add src/main.ts

# Attempt commit (pre-commit hook should run)
git commit -m "test: verify git hooks"

# Expected:
# 🔍 Running pre-commit checks...
# ✔ Linting and formatting passed
```

#### 8. Build for Production

```bash
npm run build

# Check dist folder was created
ls -la dist/

# Expected: dist/ folder with compiled JS files
```

---

### futura-market-place-api

**Location:** `futura-market-place-api/`

Follow the same steps as admin-api, but note these differences:

#### Environment Variables

```bash
# Additional variables needed:
STRIPE_PUBLIC_KEY=pk_test_... # Get from Stripe dashboard
STRIPE_PRIVATE_KEY=sk_test_...
STRIPE_ENDPOINT_SECRET=whsec_... # From Stripe webhook config

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

FUTURA_MARKET_PLACE=http://localhost:3000  # Frontend URL
```

#### Additional Tests

```bash
# Test Stripe configuration endpoint
curl http://localhost:3000/stripe/config

# Expected:
# {"config":"pk_test_..."}
```

#### Test Email Queue (Bull)

```bash
# Check Redis for Bull queues
docker exec -it futura-redis redis-cli -a futurapass123 KEYS 'bull:*'

# Expected queues:
# bull:new-account-mail
# bull:ticket-resale-mail
# bull:recover-account-mail
# bull:order-success-mail
# bull:order-updated-mail
# bull:payment-failed-mail
```

---

### futura-access-api

**Location:** `futura-access-api/`

Follow the same steps as admin-api, but note these differences:

#### Environment Variables

```bash
# Minimal config needed:
MONGO_URL=mongodb://...
JWT_SECRET_KEY=... # MUST match other APIs
SOCKET_ACCESS=... # Azure Web PubSub (optional for basic testing)
```

#### Test Ticket Validation

```bash
# This API is primarily for ticket scanning at events
# Test the main validation endpoint

# First, you'll need a valid ticket QR code from marketplace
# Then test validation:
curl -X POST http://localhost:3000/access/validate \
  -H "Content-Type: application/json" \
  -d '{"qrCode":"ticket_qr_code_here","eventId":"event_id_here"}'
```

#### Run Tests

```bash
npm run test

# Expected: 20 tests passing
# Test Suites: 1 passed, 1 total
# Tests:       20 passed, 20 total
```

---

## 🖥️ Frontend Testing

### futura-market-place-v2 (Marketplace Frontend)

**Location:** `futura-market-place-v2/`

#### 1. Install Dependencies

```bash
cd futura-market-place-v2
npm install
```

#### 2. Configure Environment

```bash
# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_FUTURA_API=http://localhost:3002
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
EOF
```

#### 3. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled successfully
```

#### 4. Test in Browser

Open http://localhost:3000 and verify:

**Homepage:**
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools
- [ ] Events are displayed (if backend has data)
- [ ] Navigation menu works
- [ ] Footer displays

**Event Details:**
- [ ] Click on an event
- [ ] Event details page loads
- [ ] Ticket selection works
- [ ] Add to cart functionality

**Checkout Flow:**
- [ ] Cart displays items
- [ ] Stripe payment form loads
- [ ] Can proceed to checkout (test with Stripe test cards)

**Browser Console:**
```
# Open DevTools (F12)
# Check Console tab - should have no errors
# Check Network tab - all API calls should return 200 or expected status codes
```

#### 5. Run Linting

```bash
npm run lint

# Expected:
# ✔ No ESLint warnings or errors
```

#### 6. Build for Production

```bash
npm run build

# Expected:
# - Creating an optimized production build
# - Compiled successfully
```

---

### futura-tickets-admin (Admin Panel Frontend)

**Location:** `futura-tickets-admin/`

Follow similar steps as marketplace frontend:

#### Configure Environment

```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_FUTURA_ADMIN_API=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EOF
```

#### Test Admin Features

Open http://localhost:3003 and verify:

**Login:**
- [ ] Login page loads
- [ ] Google Sign-In button works
- [ ] Can authenticate with admin account

**Dashboard:**
- [ ] Dashboard loads after login
- [ ] Statistics display correctly
- [ ] Charts render (if data exists)

**Event Management:**
- [ ] Can view events list
- [ ] Can create new event
- [ ] Can edit existing event
- [ ] Can upload event images
- [ ] Can publish/unpublish events

**Sales Management:**
- [ ] Can view orders
- [ ] Can view ticket sales
- [ ] Can export data

---

## 🧪 Test Coverage

### Run All Tests with Coverage

```bash
# Admin API
cd futura-tickets-admin-api
npm run test:cov

# Marketplace API
cd ../futura-market-place-api
npm run test:cov

# Access API
cd ../futura-access-api
npm run test:cov
```

**Expected coverage targets:**
- Statements: > 70%
- Branches: > 60%
- Functions: > 70%
- Lines: > 70%

**Coverage report location:** `coverage/lcov-report/index.html`

Open in browser:
```bash
open coverage/lcov-report/index.html
```

---

## 🔍 Integration Testing

### Test Full User Flow

#### 1. Create Event (Admin Panel)

```bash
# Login to admin panel
open http://localhost:3003

# Create test event:
# - Name: "Test Concert"
# - Date: Future date
# - Venue: "Test Venue"
# - Ticket types: General Admission (€20, 100 qty)
# - Save and Publish
```

#### 2. Purchase Ticket (Marketplace)

```bash
# Open marketplace
open http://localhost:3000

# Find "Test Concert" event
# Select 1 ticket
# Add to cart
# Proceed to checkout
# Use Stripe test card: 4242 4242 4242 4242
# Complete purchase
```

#### 3. Verify Purchase (Database)

```bash
# Connect to MongoDB via Mongo Express
open http://localhost:8081

# Navigate to futuratickets database
# Check collections:
# - orders: Should have new order with status "completed"
# - sales: Should have new sale records
# - events: Should have updated remainingTickets count
```

#### 4. Test Ticket Validation (Access API)

```bash
# Get QR code from order confirmation email or database
# Test validation endpoint

curl -X POST http://localhost:3004/access/validate \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "QR_CODE_FROM_ORDER",
    "eventId": "EVENT_ID"
  }'

# Expected response:
# {"valid": true, "ticket": {...}, "message": "Ticket validated successfully"}
```

---

## 🐛 Debugging & Troubleshooting

### Common Issues

#### Issue: MongoDB Connection Failed

**Error:**
```
MongoServerError: connect ECONNREFUSED
```

**Solutions:**
1. Check MongoDB is running:
   ```bash
   # If using Docker:
   docker compose ps mongodb

   # If using local MongoDB:
   brew services list | grep mongodb
   ```

2. Verify connection string:
   ```bash
   # Check .env file
   cat .env | grep MONGO_URL

   # Test connection with mongosh
   mongosh "your_mongo_url_here"
   ```

3. Check MongoDB logs:
   ```bash
   docker compose logs mongodb
   ```

---

#### Issue: Redis Connection Timeout

**Error:**
```
Error: Redis connection to localhost:6379 failed
```

**Solutions:**
1. Check Redis is running:
   ```bash
   docker compose ps redis
   ```

2. Test Redis connection:
   ```bash
   docker exec -it futura-redis redis-cli -a futurapass123 PING
   # Should return: PONG
   ```

3. Verify Redis credentials in .env:
   ```bash
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=futurapass123
   ```

---

#### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Find process using the port:
   ```bash
   lsof -i :3000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or change port in package.json/docker-compose.yml

---

#### Issue: Swagger Documentation Not Loading

**Error:**
Browser shows blank page at `/api/docs`

**Solutions:**
1. Check NODE_ENV:
   ```bash
   # Swagger only enabled in development by default
   echo $NODE_ENV
   ```

2. Verify Swagger setup:
   ```typescript
   // src/main.ts should have:
   if (process.env.NODE_ENV !== 'production') {
     const config = new DocumentBuilder()
       .setTitle('FuturaTickets API')
       .build();
     const document = SwaggerModule.createDocument(app, config);
     SwaggerModule.setup('api/docs', app, document);
   }
   ```

3. Check console logs for errors:
   ```bash
   npm run start:dev | grep -i swagger
   ```

---

#### Issue: Tests Failing

**Error:**
```
FAIL src/Account/account.service.spec.ts
● Test suite failed to run
  Cannot find module '@nestjs/testing'
```

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```

2. Install devDependencies:
   ```bash
   npm install --save-dev @nestjs/testing mongodb-memory-server @faker-js/faker
   ```

3. Clear cache and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

#### Issue: Git Hooks Not Running

**Problem:**
Commits succeed even with lint errors

**Solutions:**
1. Check Husky is installed:
   ```bash
   ls -la .husky/
   # Should show: commit-msg, pre-commit
   ```

2. Reinstall Husky:
   ```bash
   npm install husky --save-dev
   npx husky install
   ```

3. Make hooks executable:
   ```bash
   chmod +x .husky/pre-commit
   chmod +x .husky/commit-msg
   ```

4. Test manually:
   ```bash
   .husky/pre-commit
   # Should run lint-staged
   ```

---

## 📊 Testing Checklist

Use this checklist to verify everything is working:

### Infrastructure ✅
- [ ] MongoDB starts and accepts connections
- [ ] Redis starts and accepts connections
- [ ] MinIO/Azure Blob storage accessible
- [ ] All health checks return 200 OK

### Backend APIs ✅
- [ ] Admin API health endpoint responds
- [ ] Marketplace API health endpoint responds
- [ ] Access API health endpoint responds
- [ ] Swagger docs load for all APIs
- [ ] All APIs connect to MongoDB successfully
- [ ] All APIs connect to Redis successfully
- [ ] No error logs in console

### Frontend Applications ✅
- [ ] Marketplace loads at http://localhost:3000
- [ ] Admin panel loads at http://localhost:3003
- [ ] No console errors in browser DevTools
- [ ] API calls succeed (check Network tab)
- [ ] Authentication works (Google Sign-In)
- [ ] Navigation works

### Testing ✅
- [ ] Unit tests pass (npm run test)
- [ ] Test coverage > 70%
- [ ] E2E tests pass
- [ ] Git hooks execute on commit
- [ ] Linting passes (npm run lint)
- [ ] Build succeeds (npm run build)

### Integration ✅
- [ ] Can create event in admin panel
- [ ] Event appears in marketplace
- [ ] Can purchase ticket
- [ ] Order appears in database
- [ ] Email queued in Redis (Bull)
- [ ] Can validate ticket via Access API
- [ ] WebSocket events work (if implemented)

---

## 🚀 Performance Testing

### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3002'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/health"
      - get:
          url: "/events"
EOF

# Run test
artillery run load-test.yml

# Expected:
# All requests should succeed with < 500ms response time
```

### Monitoring Response Times

```bash
# Test health endpoint response time
time curl http://localhost:3001/health

# Should complete in < 100ms
```

---

## 📝 Environment Variables Validation

Create a script to validate all environment variables are set:

```bash
# validate-env.sh
#!/bin/bash

echo "🔍 Validating environment variables..."

REQUIRED_VARS=(
  "MONGO_URL"
  "JWT_SECRET_KEY"
  "REDIS_HOST"
  "REDIS_PORT"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set"
else
  echo "❌ Missing environment variables:"
  printf '%s\n' "${MISSING_VARS[@]}"
  exit 1
fi
```

Run validation:
```bash
chmod +x validate-env.sh
./validate-env.sh
```

---

## 🎯 Quick Reference Commands

### Start Everything
```bash
docker compose up -d
```

### Check Status
```bash
docker compose ps
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3004/health
```

### View Logs
```bash
docker compose logs -f admin-api
docker compose logs -f marketplace-api
docker compose logs -f access-api
```

### Run Tests
```bash
cd futura-tickets-admin-api && npm test
cd ../futura-market-place-api && npm test
cd ../futura-access-api && npm test
```

### Stop Everything
```bash
docker compose down
```

### Clean Up
```bash
docker compose down -v
docker system prune -a
```

---

## 📚 Additional Resources

- **Docker Testing Guide:** [DOCKER_TESTING_GUIDE.md](./DOCKER_TESTING_GUIDE.md)
- **Production Setup:** [PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md)
- **GitHub Actions Secrets:** [GITHUB_ACTIONS_SECRETS_GUIDE.md](./GITHUB_ACTIONS_SECRETS_GUIDE.md)
- **Next Steps Roadmap:** [NEXT_STEPS_ROADMAP.md](./NEXT_STEPS_ROADMAP.md)

---

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check API-specific `CLAUDE.md` files in each repository
2. Review error logs: `docker compose logs [service-name]`
3. Verify environment variables: `cat .env`
4. Check service health: `curl http://localhost:PORT/health`
5. Review GitHub Actions logs for CI/CD issues

---

**Last Updated:** 2025-10-13
**Maintained by:** FuturaTickets DevOps Team
