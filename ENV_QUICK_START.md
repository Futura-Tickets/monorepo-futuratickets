# FuturaTickets - Environment Setup Quick Start

## 🚀 Get Started in 5 Minutes

### Prerequisites
```bash
node --version  # v18+ required
npm --version   # v9+ required
```

### 1. Copy Environment Files (30 seconds)
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Backend APIs
cp futura-market-place-api/.env.example futura-market-place-api/.env
cp futura-access-api/.env.example futura-access-api/.env

# Frontend Apps
cp futura-market-place-v2/.env.example futura-market-place-v2/.env
cp futura-tickets-admin/.env.example futura-tickets-admin/.env
```

### 2. Minimal Configuration (2 minutes)

Edit each `.env` file and set these MINIMUM required variables:

#### Backend APIs (.env in both marketplace-api & access-api)
```bash
# Use the SAME value in both files!
JWT_SECRET_KEY=dev-secret-key-change-me

# Local MongoDB (or use MongoDB Atlas)
MONGO_URL=mongodb://localhost:27017/futuratickets

# Local Redis (for marketplace-api only)
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe Test Keys (marketplace-api only)
# Get free test keys from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_PRIVATE_KEY=sk_test_your_key_here
STRIPE_ENDPOINT_SECRET=whsec_your_secret_here
```

#### Frontend Apps (.env in both marketplace-v2 & admin)
```bash
# Point to your local backend
NEXT_PUBLIC_FUTURA_API=http://localhost:3000
NEXT_PUBLIC_FUTURA=http://localhost:3000
NEXT_PUBLIC_REFACTOR_RESALE_API=http://localhost:3000

# Azure Blob (optional - use placeholder)
NEXT_PUBLIC_BLOB_URL=http://localhost:10000

# Google OAuth (optional for development)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Install Dependencies (2 minutes)
```bash
# Install all at once
cd futura-market-place-api && npm install && cd ..
cd futura-access-api && npm install && cd ..
cd futura-market-place-v2 && npm install && cd ..
cd futura-tickets-admin && npm install && cd ..
```

### 4. Start Services (1 minute)

Open 4 terminal windows:

```bash
# Terminal 1: Marketplace API (port 3000)
cd futura-market-place-api
npm run start:dev

# Terminal 2: Access API (port 3002 to avoid conflict)
cd futura-access-api
PORT=3002 npm run start:dev

# Terminal 3: Marketplace Frontend (port 3003)
cd futura-market-place-v2
npm run dev

# Terminal 4: Admin Panel (port 3001)
cd futura-tickets-admin
npm run dev
```

### 5. Access Applications
- 🛒 **Marketplace:** http://localhost:3003
- 👨‍💼 **Admin Panel:** http://localhost:3001
- 🔌 **Marketplace API:** http://localhost:3000
- 🎫 **Access API:** http://localhost:3002

---

## ⚡ Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Install MongoDB (macOS)
brew install mongodb-community
brew services start mongodb-community

# Verify it's running
mongosh mongodb://localhost:27017/futuratickets
```

### "Redis connection failed" (Marketplace API only)
```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Verify it's running
redis-cli ping  # Should return "PONG"
```

### "Port already in use"
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in .env
PORT=3005
```

### "Stripe error"
- Get free test keys: https://dashboard.stripe.com/test/apikeys
- No credit card needed for test mode
- Use test card: 4242 4242 4242 4242

---

## 🎯 What Works Without Full Setup

### ✅ Works with minimal setup:
- View events list (if DB has data)
- Browse marketplace UI
- Navigate admin panel
- API endpoints (GET requests)

### ⚠️ Requires additional setup:
- **Payments:** Need real Stripe keys
- **Google Login:** Need Google OAuth client ID
- **Email sending:** Need SMTP credentials
- **Image uploads:** Need Azure Blob Storage
- **Real-time features:** Need Azure Web PubSub

---

## 📚 Next Steps

1. **Add Test Data:**
   - Use admin panel to create test events
   - Or import sample data to MongoDB

2. **Configure Stripe:**
   - Sign up at https://dashboard.stripe.com
   - Get test API keys (free)
   - Test checkout flow

3. **Set Up Google OAuth:**
   - Go to https://console.cloud.google.com
   - Create OAuth credentials
   - Add to .env files

4. **Read Full Documentation:**
   - See ENV_SETUP_SUMMARY.md for complete guide
   - Check CLAUDE.md in each repo for details

---

## 🆘 Still Having Issues?

1. Check ENV_SETUP_SUMMARY.md for detailed troubleshooting
2. Verify all dependencies are installed: `npm list`
3. Check logs in terminal for specific errors
4. Ensure Node.js version is 18 or higher

---

**Quick Reference:**
- 🔑 JWT_SECRET_KEY must be SAME in both backend APIs
- 📦 MongoDB required for all services
- 🔴 Redis required for marketplace-api only
- 💳 Stripe required for payments only
- 🌐 Local development works without Azure/Google

**Estimated setup time:** 5-10 minutes (with MongoDB/Redis installed)
