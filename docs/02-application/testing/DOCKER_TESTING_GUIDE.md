# Docker Compose Testing Guide

> **📋 Complete guide for testing the FuturaTickets development environment with Docker Compose**
>
> **Last Updated:** 2025-10-13
> **Services Included:** 9 containers (MongoDB, Redis, MinIO, 3 APIs, 2 frontends, Mongo Express)

---

## 🎯 Overview

The docker-compose.yml file in this repository sets up a complete local development environment with all FuturaTickets services and their dependencies.

### Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| **mongodb** | futura-mongodb | 27017 | MongoDB 7 database |
| **redis** | futura-redis | 6379 | Redis cache & job queues |
| **minio** | futura-minio | 9000, 9001 | S3-compatible storage (Azure Blob replacement) |
| **admin-api** | futura-admin-api | 3001 | Admin backend (NestJS) |
| **marketplace-api** | futura-marketplace-api | 3002 | Marketplace backend (NestJS) |
| **access-api** | futura-access-api | 3004 | Access control backend (NestJS) |
| **marketplace-web** | futura-marketplace-web | 3000 | Marketplace frontend (Next.js) |
| **admin-web** | futura-admin-web | 3003 | Admin panel frontend (Next.js) |
| **mongo-express** | futura-mongo-express | 8081 | MongoDB admin UI |

---

## 📋 Prerequisites

### Required Software

1. **Docker Desktop** (20.10+)
   - Download from: https://www.docker.com/products/docker-desktop
   - MacOS: Install Docker.app
   - Linux: Install `docker-ce` and `docker-compose-plugin`
   - Verify installation:
     ```bash
     docker --version
     docker compose version
     ```

2. **At least 8GB RAM** allocated to Docker
   - Docker Desktop → Preferences → Resources → Memory: 8GB+

3. **20GB free disk space**
   - For images and volumes

### Optional But Recommended

- **Docker Extensions:**
  - Disk usage extension
  - Resource usage extension

---

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Navigate to monorepo root
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Create environment file (optional, has defaults)
cp .env.example .env

# Add your Stripe keys and Google Client ID if testing payments
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLIC_KEY=pk_test_...
# GOOGLE_CLIENT_ID=...
```

### 2. Start All Services

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

**Expected output:**
```
[+] Building 123.4s (45/45) FINISHED
[+] Running 9/9
 ✔ Container futura-mongodb           Started
 ✔ Container futura-redis             Started
 ✔ Container futura-minio             Started
 ✔ Container futura-mongo-express     Started
 ✔ Container futura-admin-api         Started
 ✔ Container futura-marketplace-api   Started
 ✔ Container futura-access-api        Started
 ✔ Container futura-marketplace-web   Started
 ✔ Container futura-admin-web         Started
```

### 3. Verify Services are Running

```bash
# Check status of all containers
docker compose ps

# Expected output: all services should show "healthy" or "running"
```

### 4. Access the Applications

Open in your browser:

- **Marketplace Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3003
- **Mongo Express:** http://localhost:8081 (admin/admin123)
- **MinIO Console:** http://localhost:9001 (futuraadmin/futurapass123)

### 5. Check API Health Endpoints

```bash
# Admin API
curl http://localhost:3001/health

# Marketplace API
curl http://localhost:3002/health

# Access API
curl http://localhost:3004/health

# Expected response (all):
# {"status":"ok","timestamp":"2025-10-13T...","uptime":123.45}
```

---

## 🧪 Testing Each Service

### MongoDB

**Test database connection:**
```bash
# Connect to MongoDB via docker exec
docker exec -it futura-mongodb mongosh -u futuraadmin -p futurapass123 --authenticationDatabase admin

# Run in mongosh:
use futuratickets
show collections
db.accounts.countDocuments()
exit
```

**Via Mongo Express UI:**
1. Open http://localhost:8081
2. Login: admin / admin123
3. Navigate to `futuratickets` database
4. Verify collections exist: accounts, events, orders, sales, etc.

---

### Redis

**Test Redis connection:**
```bash
# Connect to Redis
docker exec -it futura-redis redis-cli -a futurapass123

# Run commands:
PING  # Should return: PONG
INFO server
KEYS *
exit
```

**Test Bull queues:**
```bash
# Check if queues are created
docker exec -it futura-redis redis-cli -a futurapass123 KEYS 'bull:*'

# Should show queues like:
# bull:new-account-mail
# bull:ticket-resale-mail
# etc.
```

---

### MinIO (S3-compatible storage)

**Via MinIO Console:**
1. Open http://localhost:9001
2. Login: futuraadmin / futurapass123
3. Create bucket: `images`
4. Set bucket policy to public read
5. Upload test image

**Via CLI:**
```bash
# Install MinIO client (mc)
# macOS:
brew install minio/stable/mc

# Configure alias
mc alias set local http://localhost:9000 futuraadmin futurapass123

# Create bucket
mc mb local/images

# Upload file
mc cp test-image.jpg local/images/

# List files
mc ls local/images/
```

---

### Admin API (Port 3001)

**Test endpoints:**
```bash
# Health check
curl http://localhost:3001/health

# Swagger docs
open http://localhost:3001/api/docs

# Test database connection
docker compose logs admin-api | grep "Connected to MongoDB"
# Should see: ✅ Connected to MongoDB

# Test Redis connection
docker compose logs admin-api | grep "Redis"
# Should not show connection errors
```

**Common issues:**
- If "Cannot connect to MongoDB": Check mongodb container health
- If "Redis connection refused": Check redis container status

---

### Marketplace API (Port 3002)

**Test endpoints:**
```bash
# Health check
curl http://localhost:3002/health

# Swagger docs
open http://localhost:3002/api/docs

# Get Stripe config (should work even without real keys)
curl http://localhost:3002/stripe/config

# Expected:
# {"config":"pk_test_your_key"}  (or your real key if set)
```

**Test email queue:**
```bash
# Check Bull mail queues exist in Redis
docker exec -it futura-redis redis-cli -a futurapass123 KEYS 'bull:*mail*'

# Should show queues:
# bull:new-account-mail
# bull:ticket-resale-mail
# bull:recover-account-mail
# etc.
```

---

### Access API (Port 3004)

**Test endpoints:**
```bash
# Health check
curl http://localhost:3004/health

# Swagger docs
open http://localhost:3004/api/docs

# Check logs for startup
docker compose logs access-api | grep "Listening"
# Should see: 🚀 Access API listening on port 3000
```

---

### Marketplace Frontend (Port 3000)

**Test in browser:**
1. Open http://localhost:3000
2. Verify homepage loads
3. Check browser console for errors
4. Test navigation

**Test API connectivity:**
```bash
# Check logs for API calls
docker compose logs marketplace-web | grep "API"

# Check if frontend can reach backend
docker compose exec marketplace-web curl http://admin-api:3000/health
# Should return: {"status":"ok",...}
```

**Common issues:**
- "API not reachable": Check NEXT_PUBLIC_FUTURA_API env var
- "CORS error": Check CORS_ORIGINS in backend APIs

---

### Admin Panel (Port 3003)

**Test in browser:**
1. Open http://localhost:3003
2. Verify admin panel loads
3. Test login (if authentication is set up)
4. Check browser console for errors

**Test API connectivity:**
```bash
# Frontend should connect to admin-api
docker compose logs admin-web | grep "API"
```

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f admin-api

# Last 100 lines
docker compose logs --tail=100 marketplace-api

# Follow logs and grep for errors
docker compose logs -f | grep ERROR
```

### Check Container Health

```bash
# All containers status
docker compose ps

# Detailed health status
docker inspect futura-mongodb | grep -A 10 Health
docker inspect futura-redis | grep -A 10 Health
```

### Resource Usage

```bash
# CPU, Memory usage
docker stats

# Disk usage
docker system df

# Clean up (if needed)
docker system prune -a --volumes
```

### Restart Services

```bash
# Restart specific service
docker compose restart admin-api

# Restart all services
docker compose restart

# Rebuild and restart
docker compose up --build -d --force-recreate admin-api
```

---

## 🧹 Stopping & Cleanup

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data!)
docker compose down -v

# Stop but keep volumes
docker compose stop
```

### Clean Up

```bash
# Remove all containers and networks (keeps volumes)
docker compose down

# Remove everything including volumes
docker compose down -v

# Remove dangling images
docker image prune -a

# Full system cleanup (⚠️ removes EVERYTHING!)
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Issue: Container fails to start

**Symptoms:**
```
Error: Container futura-admin-api exited with code 1
```

**Solutions:**
1. Check logs:
   ```bash
   docker compose logs admin-api
   ```

2. Common causes:
   - MongoDB not ready: Wait for health check
   - Port already in use: Change port in docker-compose.yml
   - Build failed: Check Dockerfile syntax

3. Rebuild:
   ```bash
   docker compose build --no-cache admin-api
   docker compose up admin-api
   ```

---

### Issue: MongoDB connection refused

**Symptoms:**
```
MongoServerError: connect ECONNREFUSED
```

**Solutions:**
1. Check MongoDB is running:
   ```bash
   docker compose ps mongodb
   ```

2. Check MongoDB health:
   ```bash
   docker inspect futura-mongodb | grep -A 5 Health
   ```

3. Verify credentials match:
   ```bash
   # In docker-compose.yml
   MONGO_URL: mongodb://futuraadmin:futurapass123@mongodb:27017/...

   # Must match MongoDB environment:
   MONGO_INITDB_ROOT_USERNAME: futuraadmin
   MONGO_INITDB_ROOT_PASSWORD: futurapass123
   ```

4. Restart MongoDB:
   ```bash
   docker compose restart mongodb
   ```

---

### Issue: Redis connection timeout

**Symptoms:**
```
Error: Redis connection to redis:6379 failed - connect ETIMEDOUT
```

**Solutions:**
1. Verify Redis is running:
   ```bash
   docker compose ps redis
   docker compose logs redis
   ```

2. Check password matches:
   ```bash
   # In docker-compose.yml
   REDIS_PASSWORD: futurapass123

   # Must match Redis command:
   command: redis-server --requirepass futurapass123
   ```

3. Test connection:
   ```bash
   docker exec -it futura-redis redis-cli -a futurapass123 PING
   # Should return: PONG
   ```

---

### Issue: Frontend cannot reach backend

**Symptoms:**
```
Failed to fetch http://localhost:3001/...
CORS error
```

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Verify CORS configuration:
   ```bash
   # Backend API should have:
   CORS_ORIGINS: http://localhost:3000,http://localhost:3003
   ```

3. Check frontend env vars:
   ```bash
   docker compose logs marketplace-web | grep NEXT_PUBLIC
   # Should show correct API URLs
   ```

4. Restart both services:
   ```bash
   docker compose restart admin-api marketplace-web
   ```

---

### Issue: Port already in use

**Symptoms:**
```
Error: bind: address already in use
```

**Solutions:**
1. Find what's using the port:
   ```bash
   lsof -i :3000  # Replace 3000 with your port
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or change port in docker-compose.yml:
   ```yaml
   ports:
     - "3005:3000"  # Change 3000 to 3005
   ```

---

### Issue: Out of disk space

**Symptoms:**
```
no space left on device
```

**Solutions:**
1. Check disk usage:
   ```bash
   docker system df
   ```

2. Clean up:
   ```bash
   # Remove unused images
   docker image prune -a

   # Remove unused volumes
   docker volume prune

   # Full cleanup (⚠️ removes everything)
   docker system prune -a --volumes
   ```

3. Increase Docker disk allocation:
   - Docker Desktop → Preferences → Resources → Disk image size

---

## 📊 Testing Checklist

Use this checklist to verify all services are working:

### Infrastructure
- [ ] MongoDB starts and accepts connections
- [ ] Redis starts and accepts connections
- [ ] MinIO starts and console is accessible
- [ ] Mongo Express loads and connects to MongoDB
- [ ] All health checks pass

### Backend APIs
- [ ] Admin API health endpoint returns 200 OK
- [ ] Marketplace API health endpoint returns 200 OK
- [ ] Access API health endpoint returns 200 OK
- [ ] Swagger docs load for all APIs
- [ ] APIs can connect to MongoDB
- [ ] APIs can connect to Redis
- [ ] No error logs in docker compose logs

### Frontend Apps
- [ ] Marketplace web loads at http://localhost:3000
- [ ] Admin panel loads at http://localhost:3003
- [ ] No console errors in browser
- [ ] Frontends can call backend APIs
- [ ] Hot reload works when editing code

### Inter-Service Communication
- [ ] Frontend → Backend API calls work
- [ ] Backend → MongoDB queries work
- [ ] Backend → Redis queue operations work
- [ ] WebSocket connections establish (if using)

### Development Workflow
- [ ] Code changes trigger hot reload
- [ ] Changes persist after container restart (except volumes)
- [ ] Logs are visible via docker compose logs

---

## 📝 Development Tips

### Hot Reload

Code changes are automatically detected thanks to volume mounts:

```yaml
volumes:
  - ./futura-tickets-admin-api:/app
  - /app/node_modules  # Prevents overwriting
  - /app/dist          # Prevents overwriting
```

**For backend APIs (NestJS):**
- Edit files in your local directory
- Changes auto-compile and restart (watch mode)
- No need to rebuild container

**For frontend apps (Next.js):**
- Edit files in your local directory
- Browser auto-refreshes
- Fast Refresh preserves component state

### Install New Dependencies

```bash
# DON'T run npm install in your local directory
# Instead, exec into container:

docker compose exec admin-api npm install new-package
docker compose exec marketplace-web npm install new-package

# Then rebuild container to persist:
docker compose up --build -d admin-api
```

### Run Commands in Containers

```bash
# NestJS CLI commands
docker compose exec admin-api npm run test
docker compose exec admin-api npm run build

# Next.js commands
docker compose exec marketplace-web npm run lint
docker compose exec marketplace-web npm run build

# Database commands
docker compose exec mongodb mongosh -u futuraadmin -p futurapass123
```

### Debugging

**Attach to running container:**
```bash
docker compose exec admin-api sh
# Now you're inside the container
ls
cat package.json
exit
```

**View real-time logs:**
```bash
docker compose logs -f admin-api | grep ERROR
```

**Inspect environment variables:**
```bash
docker compose exec admin-api printenv | grep MONGO
```

---

## 🔄 CI/CD Integration

This docker-compose setup can also be used in CI/CD pipelines:

```yaml
# Example GitHub Actions
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Start services
        run: docker compose up -d

      - name: Wait for services
        run: |
          sleep 30
          curl --retry 10 --retry-delay 5 http://localhost:3001/health

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Stop services
        run: docker compose down -v
```

---

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)

---

## ✅ Summary

You now have a complete local development environment with:

- ✅ All 3 backend APIs (Admin, Marketplace, Access)
- ✅ 2 frontend applications (Marketplace, Admin Panel)
- ✅ MongoDB database with initialization
- ✅ Redis for job queues
- ✅ MinIO for local file storage
- ✅ Mongo Express for database management
- ✅ Hot reload for rapid development
- ✅ Health checks for all services
- ✅ Comprehensive logging
- ✅ Easy start/stop/rebuild workflow

**To start developing:**
```bash
docker compose up -d
```

**To stop:**
```bash
docker compose down
```

**To view logs:**
```bash
docker compose logs -f
```

---

**Last Updated:** 2025-10-13
**Maintained by:** FuturaTickets DevOps Team
