# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

FuturaTickets is a complete ticketing platform ecosystem with blockchain integration (NFT tickets), payment processing (Stripe), resale system, and real-time access control. The monorepo contains 16 individual repositories organized into a microservices architecture.

**Key Architecture:**
- **Frontend:** Next.js 15 web apps + Expo 52 mobile apps
- **Backend:** NestJS 10/11 microservices with MongoDB
- **Blockchain:** Solidity 0.8.25 smart contracts (ERC-721 NFTs)
- **Infrastructure:** Docker, Azure Blob Storage, Azure Web PubSub, Stripe, Redis

## Repository Structure

```
monorepo-futuratickets/
├── 📖 Documentation Files (*.md)
├── 🔧 Scripts (*.sh)
├── 🖥️ Frontend Web Apps (Next.js 15)
│   ├── futura-market-place-v2/      # Main marketplace (buyers)
│   ├── futura-tickets-admin/        # Admin panel (promoters)
│   ├── futura-tickets-event/        # Event-specific sales page
│   └── futura-paginator/            # Landing page
├── 📱 Mobile Apps (Expo 52 + React Native 0.76)
│   ├── futura-access-app/           # QR scanner for access control
│   └── futura-tickets-access-app/   # Alternative access app
├── ⚙️ Backend APIs (NestJS 10/11)
│   ├── futura-tickets-admin-api/    # Events, analytics, CronJobs
│   ├── futura-market-place-api/     # Payments, orders, emails
│   ├── futura-access-api/           # Ticket validation, check-in
│   └── futura-tickets-rest-api/     # Additional API services
├── 🔗 Blockchain (Solidity 0.8.25)
│   ├── futura-tickets-contracts-v2/ # ERC-721 NFT tickets
│   └── futura-tickets-smartcontracts/ # Legacy contracts
├── 🧮 Utilities
│   └── integrations-scripts/        # Migration scripts, CSV tools
└── 📄 Legacy (Deprecated)
    ├── landingpage/                 # Old React landing (use futura-paginator)
    └── futura-tickets/              # Old marketplace (use marketplace-v2)
```

## Common Development Commands

### Repository Management
```bash
# Create all GitHub repositories (if not done)
export GITHUB_TOKEN="your_token"
./create-all-repos.sh

# Push all repositories to GitHub
./push-all-repos.sh

# Navigate to specific service
cd futura-market-place-v2        # Main marketplace
cd futura-tickets-admin          # Admin panel
cd futura-tickets-admin-api      # Main API
cd futura-market-place-api       # Payment API
cd futura-access-api             # Access control API
```

### Frontend Development (Next.js)

#### Marketplace (futura-market-place-v2)
```bash
cd futura-market-place-v2
npm install
npm run dev          # Start on port 3003
npm run build        # Production build
npm run lint         # ESLint check
npm start           # Production server

# Docker
docker build -t marketplace-v2 .
docker run -p 3000:3000 marketplace-v2
```

#### Admin Panel (futura-tickets-admin)
```bash
cd futura-tickets-admin
npm install
npm run dev          # Start on port 3001
npm run build        # Production build
npm run lint         # ESLint check
npm start           # Production server
```

#### Landing Page (futura-paginator)
```bash
cd futura-paginator
npm install
npm run dev          # Development server
npm run build        # Static site generation
npm start           # Production server
```

### Backend Development (NestJS)

#### Admin API (futura-tickets-admin-api)
```bash
cd futura-tickets-admin-api
npm install

# Development
npm run start:dev    # Watch mode
npm run start:debug  # Debug mode
npm run start        # Standard mode
npm run start:prod   # Production mode

# Testing
npm run test         # Unit tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
npm run test:e2e     # E2E tests

# Code Quality
npm run lint         # ESLint
npm run format       # Prettier
npm run format:check # Check formatting

# Build
npm run build        # Compile TypeScript
```

#### Marketplace API (futura-market-place-api)
```bash
cd futura-market-place-api
npm install
npm run start:dev    # Development with hot reload
npm run start:prod   # Production mode
npm run build        # Build for production
npm run test         # Run tests
```

#### Access API (futura-access-api)
```bash
cd futura-access-api
npm install
npm run start:dev    # Development server
npm run start:prod   # Production server
npm run test         # Run test suite
npm run build        # Compile application
```

### Mobile Development (Expo)

#### Access Control App (futura-access-app)
```bash
cd futura-access-app
npm install

# Development
expo start           # Start Expo dev server
expo start --web     # Web version
expo run:android     # Run on Android device/emulator
expo run:ios         # Run on iOS device/simulator

# Build for stores
expo build:android   # Android APK
expo build:ios       # iOS build
```

### Blockchain Development (Solidity)

#### Smart Contracts (futura-tickets-contracts-v2)
```bash
cd futura-tickets-contracts-v2
npm install

# Note: Hardhat config and build scripts need to be set up
# Current status: Contracts developed but not fully integrated

# Development commands (once properly configured):
# npx hardhat compile     # Compile contracts
# npx hardhat test        # Run tests  
# npx hardhat deploy      # Deploy to network
# npx hardhat verify      # Verify contracts
```

### Testing Commands

#### Run Single Test File
```bash
# NestJS APIs
cd futura-tickets-admin-api
npm run test -- --testPathPattern=events  # Test events module
npm run test -- src/events/events.service.spec.ts  # Specific file

# Next.js Apps  
cd futura-market-place-v2
npm test -- components/checkout  # Test checkout components
```

#### Run Tests for Specific Module
```bash
# Backend - test specific module
npm run test:related src/events/events.controller.ts

# Frontend - test related components
npm test -- --findRelatedTests src/components/checkout/payment.tsx
```

### Docker & Local Development

#### Full Stack with Docker Compose
```bash
# Start all services (MongoDB, Redis, APIs, Web apps)
docker-compose up -d

# View logs
docker-compose logs -f admin-api
docker-compose logs -f marketplace-api

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up -d --build admin-api
```

#### Individual Service Docker
```bash
# Build and run individual service
cd futura-tickets-admin-api
docker build -t admin-api .
docker run -p 3000:3000 --env-file .env admin-api
```

### Database & Infrastructure

#### MongoDB Operations
```bash
# Connect to local MongoDB
mongo mongodb://localhost:27017/futuratickets

# MongoDB Atlas connection (use connection string from .env)
mongo "mongodb+srv://username:password@cluster.mongodb.net/futuratickets"

# Common collections:
# - accounts (users)
# - events (event data) 
# - orders (purchase orders)
# - sales (tickets)
# - promoters (event organizers)
```

#### Redis Operations
```bash
# Connect to Redis
redis-cli

# Monitor Bull queues
redis-cli MONITOR

# Check queue status
redis-cli KEYS bull:*
```

## Architecture Overview

### System Flow
1. **Event Creation:** Promoters use admin panel → admin-api creates event in MongoDB
2. **Ticket Purchase:** Users browse marketplace-v2 → marketplace-api processes Stripe payment → creates order & tickets
3. **Access Control:** Staff uses access-app → scans QR → access-api validates ticket → updates status → WebSocket notification

### Key Technologies
- **Database:** MongoDB Atlas (shared across all APIs)
- **Payments:** Stripe Payment Intents + webhooks
- **Real-time:** Socket.IO + Azure Web PubSub
- **Files:** Azure Blob Storage (event images)
- **Jobs:** Bull queues with Redis
- **Auth:** JWT tokens (shared secret across APIs)

### API Integration Points
- **marketplace-v2** → **marketplace-api** (orders, payments)
- **marketplace-v2** → **admin-api** (events, user data) 
- **tickets-admin** → **admin-api** (event management, analytics)
- **access-app** → **access-api** (ticket validation)
- **All APIs** → **MongoDB** (shared database)

### Critical Environment Variables
All services share core environment variables:
```bash
# Database
MONGO_URL=mongodb+srv://...

# JWT (MUST be identical across all APIs)
JWT_SECRET_KEY=shared-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_PUBLIC_KEY=pk_live_or_test_...

# Azure
AZURE_STORAGE_CONNECTION_STRING=...
```

### Known Issues & Considerations
- **Security:** CORS is fully open in some APIs (needs fixing)
- **Code Quality:** Some service files are extremely large (35K+ lines) requiring refactoring
- **Testing:** 0% test coverage across all repositories  
- **Blockchain:** Smart contracts developed but not integrated with APIs
- **Monorepo:** Each directory is a separate Git repository, not a traditional monorepo

### Development Workflow
1. **Local Setup:** Use Docker Compose for full stack development
2. **Service Development:** Each service can be developed independently
3. **Frontend Testing:** Use development APIs or mock data
4. **Production:** Each service deployed to separate containers
5. **Monitoring:** WebSocket events provide real-time updates across services

### Performance Considerations
- **Database:** MongoDB queries should be optimized for large event datasets
- **Redis:** Bull queues handle email processing asynchronously  
- **Caching:** Implement Redis caching for frequently accessed data
- **CDN:** Use Azure Blob Storage with CDN for image delivery

## Important Notes

- This is a **multi-repository monorepo** - each subdirectory is its own Git repository
- **JWT secrets must be identical** across all APIs for token validation
- **Database is shared** across all backend services
- **Blockchain integration is pending** - contracts exist but aren't connected to APIs
- **Mobile apps** require Expo CLI and development builds for testing
- **Production deployments** use Docker containers with cloud services

When working with this codebase, always consider the microservices architecture and ensure changes don't break cross-service integrations.