# 📜 FuturaTickets - Scripts Reference

> **Complete guide to all automation scripts**
> **Updated:** 2025-10-17

---

## 🚀 STARTUP SCRIPTS

### Infrastructure Only

```bash
./start-infra.sh
```
**What it does:**
- Starts Docker infrastructure (MongoDB, Redis, MinIO, Mongo Express)
- Health checks for all services
- Shows access URLs and credentials

**Use when:** You want just the infrastructure without applications

---

### Individual Service Scripts

#### Backend APIs

```bash
# Terminal 2 - Admin API (port 4101)
cd futura-tickets-admin-api
../start-admin-api.sh

# Terminal 3 - Marketplace API (port 4102)
cd futura-market-place-api
../start-marketplace-api.sh

# Terminal 4 - Access API (port 4103)
cd futura-access-api
../start-access-api.sh
```

#### Frontend Apps

```bash
# Terminal 5 - Marketplace Web (port 3000)
cd futura-market-place-v2
../start-marketplace-web.sh

# Terminal 6 - Admin Web (port 3003)
cd futura-tickets-admin
../start-admin-web.sh
```

**Use when:** You want granular control and real-time logs per terminal

---

### Orchestrated Startup

```bash
./start-all-dev.sh
```
**What it does:**
- Starts infrastructure
- Starts all 3 backend APIs sequentially
- Starts both frontend apps
- Runs health check
- Saves PIDs to `.dev-pids` file
- Shows summary of all services

**Use when:** You want everything up quickly (recommended for daily dev)

**Time:** ~2 minutes

---

### Docker Full Stack

```bash
./start-docker-full.sh
```
**What it does:**
- Builds Docker images for all services
- Starts everything in Docker containers
- Production-like environment locally

**Use when:**
- Testing Docker deployment
- Reproducing production issues
- Need complete isolation

**Time:** 5-10 minutes (first time with builds)

---

## 🛑 STOP SCRIPTS

### Stop Development Stack

```bash
./stop-all-dev.sh
```
**What it does:**
- Reads PIDs from `.dev-pids`
- Gracefully stops all npm processes
- Stops Docker infrastructure
- Cleans up PID file

**Use when:** End of work day, switching branches

---

### Stop Docker Stack

```bash
docker compose -f docker-compose.full.yml down

# With volume cleanup
docker compose -f docker-compose.full.yml down -v
```

---

## 🧪 TESTING & VALIDATION

### Health Check

```bash
./health-check.sh
```
**What it does:**
- Checks all infrastructure services
- Checks all API endpoints
- Checks all frontend apps
- Shows port status
- Provides summary (X/9 services OK)

**Use when:**
- After starting services
- Debugging connectivity issues
- Before committing code

---

### Smoke Tests

```bash
./tests/smoke-test.sh
```
**What it does:**
- Tests infrastructure endpoints
- Tests API health endpoints
- Tests basic API functionality
- Tests frontend accessibility
- Tests critical user flows

**Use when:**
- Before deployment
- After major changes
- In CI/CD pipeline

**Exit codes:**
- `0` = All tests passed
- `1` = Some tests failed

---

## 🔧 DEVELOPMENT UTILITIES

### View Logs

```bash
./dev-logs.sh [service]

# Examples:
./dev-logs.sh mongodb         # MongoDB logs
./dev-logs.sh admin-api       # Admin API logs
./dev-logs.sh all             # All infrastructure logs
./dev-logs.sh apis            # All API logs
```

**Available services:**
- `mongodb`, `redis`, `minio`, `mongo-express`
- `admin-api`, `marketplace-api`, `access-api`
- `marketplace-web`, `admin-web`
- `all`, `apis`, `frontends`

---

### Restart Services

```bash
./dev-restart.sh [service]

# Examples:
./dev-restart.sh mongodb      # Restart MongoDB
./dev-restart.sh admin-api    # Restart Admin API
./dev-restart.sh all-infra    # Restart all infrastructure
```

**Available options:**
- Individual services
- `all-infra` - All infrastructure
- `all-apis` - All backend APIs
- `all-web` - All frontend apps
- `all` - Everything

---

### Cleanup

```bash
./dev-clean.sh
```

**Interactive menu:**
1. **node_modules** - Delete all node_modules
2. **builds** - Delete .next, dist folders
3. **caches** - Delete .turbo, .eslintcache
4. **docker** - Stop containers, remove volumes
5. **all** - Nuclear option (requires `DELETE EVERYTHING` confirmation)

**Use when:**
- Dependency issues
- Build artifacts corrupted
- Fresh start needed
- Disk space cleanup

---

## 💾 DATABASE MANAGEMENT

### Backup MongoDB

```bash
./backup-mongodb.sh
```

**What it does:**
- Creates mongodump of `futuratickets` database
- Compresses to `.tar.gz`
- Saves to `./backups/mongodb/`
- Automatically cleans old backups (keeps last 10)

**Output:** `futuratickets_backup_YYYYMMDD_HHMMSS.tar.gz`

---

### Restore MongoDB

```bash
./restore-mongodb.sh <backup_file.tar.gz>

# Example:
./restore-mongodb.sh futuratickets_backup_20251017_120000.tar.gz
```

**What it does:**
- Extracts backup
- Drops current database
- Restores from backup
- Shows restored collections

**⚠️ WARNING:** Overwrites current database!

---

## 🐳 DOCKER COMPOSE FILES

### docker-compose.infra.yml

**Infrastructure only:**
- MongoDB
- Redis
- MinIO
- Mongo Express

```bash
docker compose -f docker-compose.infra.yml up -d
docker compose -f docker-compose.infra.yml down
```

---

### docker-compose.full.yml

**Complete stack:**
- All infrastructure
- All backend APIs
- All frontend apps

```bash
docker compose -f docker-compose.full.yml up -d
docker compose -f docker-compose.full.yml down -v
```

---

## 🔄 CI/CD

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main`, `dev`, `develop`
- Pull requests to `main`, `dev`, `develop`

**Jobs:**
1. **Lint & Format** - ESLint, Prettier
2. **Backend Tests** - Unit + E2E tests
3. **Frontend Tests** - Build verification
4. **Docker Build** - Build and push images
5. **Security Scan** - npm audit, Trivy
6. **Smoke Tests** - Integration tests

---

## 📊 SCRIPT CATEGORIES SUMMARY

### Daily Development (Most Used)

```bash
./start-all-dev.sh      # Start everything
./health-check.sh       # Verify all services
./dev-logs.sh admin-api # Check logs
./stop-all-dev.sh       # End of day
```

### Troubleshooting

```bash
./dev-restart.sh mongodb  # Restart service
./dev-clean.sh           # Clean and rebuild
./backup-mongodb.sh      # Before risky changes
```

### Testing & CI/CD

```bash
./tests/smoke-test.sh           # Smoke tests
.github/workflows/ci.yml        # Auto CI/CD
./start-docker-full.sh          # Full Docker test
```

---

## 🎯 QUICK REFERENCE TABLE

| Script | Category | Time | Use Case |
|--------|----------|------|----------|
| `start-infra.sh` | Start | 30s | Infrastructure only |
| `start-all-dev.sh` | Start | 2min | Full dev environment |
| `start-docker-full.sh` | Start | 10min | Docker deployment test |
| `stop-all-dev.sh` | Stop | 5s | End of work |
| `health-check.sh` | Test | 10s | Verify services |
| `smoke-test.sh` | Test | 30s | Integration tests |
| `dev-logs.sh` | Debug | - | View logs |
| `dev-restart.sh` | Debug | 10s | Restart service |
| `dev-clean.sh` | Maintain | varies | Cleanup |
| `backup-mongodb.sh` | Data | 30s | Backup database |
| `restore-mongodb.sh` | Data | 1min | Restore database |

---

## 💡 BEST PRACTICES

### Morning Routine

```bash
# 1. Pull latest code
git pull origin dev

# 2. Install any new dependencies (if package.json changed)
cd futura-tickets-admin-api && npm install && cd ..

# 3. Start environment
./start-all-dev.sh

# 4. Verify everything works
./health-check.sh
```

### Before Committing

```bash
# 1. Run smoke tests
./tests/smoke-test.sh

# 2. Check health
./health-check.sh

# 3. Backup database (if schema changes)
./backup-mongodb.sh
```

### End of Day

```bash
# Stop all services
./stop-all-dev.sh

# Optional: Backup important data
./backup-mongodb.sh
```

### Troubleshooting

```bash
# 1. Check logs
./dev-logs.sh [service]

# 2. Restart problematic service
./dev-restart.sh [service]

# 3. If still broken, clean rebuild
./dev-clean.sh  # Choose option 1 (node_modules)
npm install     # In affected directory
```

---

## 🆘 COMMON ISSUES & SOLUTIONS

### "Port already in use"

```bash
# Find what's using the port
lsof -i :4101

# Kill the process
kill -9 <PID>

# Or use stop script
./stop-all-dev.sh
```

### "MongoDB connection failed"

```bash
# Check MongoDB logs
./dev-logs.sh mongodb

# Restart MongoDB
./dev-restart.sh mongodb

# If still broken, recreate
docker compose -f docker-compose.infra.yml down -v
./start-infra.sh
```

### "Module not found"

```bash
# Clean and reinstall
./dev-clean.sh  # Choose option 1
cd <service-directory>
npm install
```

### "Docker out of space"

```bash
# Clean Docker
docker system prune -a --volumes

# Or use cleanup script
./dev-clean.sh  # Choose option 4
```

---

**For more detailed information, see:**
- `QUICK_START.md` - 5-minute setup guide
- `DEV_GUIDE.md` - Comprehensive development guide
- `SETUP_SUMMARY.md` - Architecture overview

**Need help?** Check the health check: `./health-check.sh`
