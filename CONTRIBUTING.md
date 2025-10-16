# 🚀 Futura Tickets - Developer Guide

Complete guide for local development and testing.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Structure](#-project-structure)
3. [Development Commands](#-development-commands)
4. [Test Credentials](#-test-credentials)
5. [Health Checks](#-health-checks)
6. [Troubleshooting](#-troubleshooting)
7. [Git Workflow](#-git-workflow)
8. [Environment Setup](#-environment-setup)

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd monorepo-futuratickets

# Install dependencies in all projects
cd futura-tickets-admin-api && npm install && cd ..
cd futura-tickets-admin && npm install && cd ..
cd futura-market-place-v2 && npm install && cd ..

# Setup environment files (copy .env.example to .env in each project)
cp futura-tickets-admin-api/.env.example futura-tickets-admin-api/.env
cp futura-tickets-admin/.env.example futura-tickets-admin/.env
cp futura-market-place-v2/.env.example futura-market-place-v2/.env

# Edit .env files with your credentials
# IMPORTANT: Update MongoDB URI, JWT secret, etc.
```

### Start All Services

```bash
# From monorepo root
./start-all.sh
```

This will start:
- **Admin API** on http://localhost:3001
- **Admin Panel** on http://localhost:3003
- **Marketplace** on http://localhost:3000

### Stop All Services

```bash
./stop-all.sh
```

---

## 📁 Project Structure

```
monorepo-futuratickets/
├── futura-tickets-admin-api/    # Backend API (NestJS)
│   ├── src/
│   │   ├── accounts/            # User authentication
│   │   ├── events/              # Event management
│   │   ├── CronJobs/            # Scheduled tasks
│   │   └── main.ts
│   └── .env
├── futura-tickets-admin/        # Admin Panel (Next.js)
│   ├── app/
│   ├── components/
│   ├── shared/
│   └── .env.local
├── futura-market-place-v2/      # Public Marketplace (Next.js)
│   ├── app/
│   ├── components/
│   └── .env.local
├── start-all.sh                 # Start all services
├── stop-all.sh                  # Stop all services
└── logs/                        # Service logs
```

---

## 💻 Development Commands

### Admin API (NestJS)

```bash
cd futura-tickets-admin-api

# Development mode (hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Build
npm run build

# Run tests
npm run test

# Test coverage
npm run test:cov

# Lint
npm run lint
```

**API Documentation:** http://localhost:3001/api/docs

### Admin Panel (Next.js)

```bash
cd futura-tickets-admin

# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

**Admin Panel:** http://localhost:3003

### Marketplace (Next.js)

```bash
cd futura-market-place-v2

# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

**Marketplace:** http://localhost:3000

### View Logs

```bash
# View all logs
tail -f logs/*.log

# View specific service
tail -f logs/admin-api.log
tail -f logs/admin-panel.log
tail -f logs/marketplace.log
```

---

## 🔐 Test Credentials

### Admin Panel Users

#### Administrator (Full Access)
- **Email:** admin@futuratickets.com
- **Password:** admin2025
- **Role:** ADMIN
- **Permissions:** Full system access, user management, event creation, analytics

#### Event Promoter
- **Email:** promotor@futuratickets.com
- **Password:** promoter2025
- **Role:** PROMOTER
- **Permissions:** Create/manage events, view ticket sales, access reports

#### Test Customer
- **Email:** cliente@futuratickets.com
- **Password:** cliente2025
- **Role:** USER
- **Permissions:** Purchase tickets, view order history

### Marketplace Users

Use the same credentials above to test the marketplace frontend.

---

## 🏥 Health Checks

### Check if Services are Running

```bash
# Check running processes
lsof -i :3000  # Marketplace
lsof -i :3001  # Admin API
lsof -i :3003  # Admin Panel

# Check all at once
lsof -i :3000,:3001,:3003
```

### API Health Check

```bash
# Admin API
curl http://localhost:3001/health

# Expected response: {"status":"ok"}
```

### Database Connection

```bash
# Test MongoDB connection (from Admin API directory)
cd futura-tickets-admin-api
npm run test:db  # If available

# Or check logs
tail -f ../logs/admin-api.log | grep "MongoDB"
```

### Frontend Health

Open in browser:
- Admin Panel: http://localhost:3003
- Marketplace: http://localhost:3000

Expected: Login page loads without errors

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find and kill process on specific port
lsof -ti:3001 | xargs kill -9

# Or use the stop script
./stop-all.sh
```

### Login Fails / "Failed to fetch"

**Problem:** CORS errors or API not responding

**Solutions:**
1. Check API is running: `curl http://localhost:3001/health`
2. Check `.env` files have correct API URLs
3. Clear browser localStorage: `localStorage.clear()` in console
4. Check API logs: `tail -f logs/admin-api.log`

### "Cannot find module" Errors

```bash
# Reinstall dependencies
cd <project-directory>
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Errors

**Problem:** "MongooseError: Cannot connect to MongoDB"

**Solutions:**
1. Check MongoDB URI in `.env`
2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
3. Check MongoDB user credentials
4. Test connection: `mongosh "your-mongodb-uri"`

### Ant Design React 19 Warnings

**Problem:** Console warning about React compatibility

**Solution:** Already suppressed in `RootProvider.tsx` - safe to ignore.

### Socket Connection Errors

**Problem:** Socket.IO connection failures

**Solution:**
- Socket connections are non-blocking
- Check if `SOCKET_URL` is set in `.env`
- If Redis is not available, comment out socket code temporarily

### Build Errors

```bash
# Clear Next.js cache
cd futura-tickets-admin  # or futura-market-place-v2
rm -rf .next
npm run build

# Clear NestJS cache
cd futura-tickets-admin-api
rm -rf dist
npm run build
```

### Environment Variables Not Loading

**Check:**
1. File named exactly `.env` (Admin API) or `.env.local` (Next.js)
2. No syntax errors in `.env` file
3. Restart the service after changing `.env`
4. Next.js variables must start with `NEXT_PUBLIC_` for client-side access

---

## 🌿 Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Convention

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Sync with Main

```bash
# Update main branch
git checkout main
git pull origin main

# Rebase your feature branch
git checkout feature/your-feature-name
git rebase main

# Resolve conflicts if any
# Then push (may need --force if rebased)
git push origin feature/your-feature-name --force-with-lease
```

---

## 🛠️ Environment Setup

### Required Environment Variables

#### Admin API (.env)

```bash
# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3003,http://localhost:3000

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Admin Panel (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Features (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Marketplace (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Analytics (optional)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### MongoDB Setup

1. Create account at https://cloud.mongodb.com
2. Create cluster (free tier available)
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (for development)
5. Get connection string and update `MONGO_URI`

### Stripe Setup (Optional)

1. Create account at https://stripe.com
2. Get test API keys from Dashboard
3. Update `.env` files with keys
4. Test with card: 4242 4242 4242 4242

---

## 📞 Getting Help

### Logs Location

All service logs are in `./logs/`:
- `admin-api.log` - Backend API logs
- `admin-panel.log` - Admin Panel logs
- `marketplace.log` - Marketplace logs

### Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Run `./stop-all.sh` |
| Login fails | Check API is running, clear localStorage |
| MongoDB error | Verify connection string and IP whitelist |
| Build fails | Clear cache: `rm -rf .next dist node_modules` |
| Dependencies error | Run `npm install` again |

### Documentation

- **Architecture:** See `ARQUITECTURA_SISTEMA_COMPLETO.md`
- **Deployment:** See `GUIA_DESPLIEGUE_COMPLETA.md`
- **Roadmap:** See `SPRINTS_DETALLADOS.md`
- **API Docs:** http://localhost:3001/api/docs (when API is running)

---

## ✅ Verification Checklist

Before starting development:

- [ ] All dependencies installed (`npm install` in each project)
- [ ] Environment files created and configured (`.env`, `.env.local`)
- [ ] MongoDB connection working
- [ ] All three services start successfully
- [ ] Can login to Admin Panel with test credentials
- [ ] Can access Marketplace
- [ ] API documentation loads at http://localhost:3001/api/docs

---

**Last Updated:** 2025-10-15
**Version:** 1.0.0
