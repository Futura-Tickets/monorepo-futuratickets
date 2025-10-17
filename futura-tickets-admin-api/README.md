# Futura Tickets Admin API

Backend API for the Futura Tickets event ticketing platform. Built with NestJS, MongoDB, Stripe, and WebSockets.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)

---

## Overview

This is the main administration API for the Futura Tickets platform. It handles:
- Event creation and management
- Order processing and payment integration (Stripe)
- Ticket generation and QR codes
- Real-time updates via WebSockets
- Email notifications
- Promoter analytics and reports
- Payment withdrawals for promoters

**Version**: 0.0.1
**Default Port**: 3000

---

## Tech Stack

### Core
- **NestJS** 10.0.0 - Progressive Node.js framework
- **TypeScript** 5.1.3 - Type-safe JavaScript
- **MongoDB** (via Mongoose 8.4.3) - Database
- **Node.js** 18+ - Runtime environment

### Payment Processing
- **Stripe** 17.4.0 - Payment gateway

### Real-time Communication
- **Socket.IO** 4.7.5 - WebSocket server
- **Azure Web PubSub** - Cloud WebSocket scaling

### Background Jobs
- **Bull** 4.14.0 - Redis-based job queue
- **BullMQ** 5.8.3 - Modern job queue

### Authentication
- **Passport JWT** - JWT authentication strategy
- **bcrypt** - Password hashing

### Blockchain (Optional)
- **ethers** 6.13.1 - Ethereum library
- **viem** 2.20.0 - Ethereum utilities

### Logging & Monitoring
- **Winston** 3.x - Structured logging
- **nest-winston** - NestJS Winston integration

### Validation
- **class-validator** 0.14.2 - DTO validation
- **class-transformer** 0.5.1 - Object transformation

### Scheduling
- **@nestjs/schedule** - Cron jobs

### Documentation
- **Swagger/OpenAPI** - API documentation

---

## Features

### Event Management
- Create, update, and delete events
- Multi-tier ticketing (General, VIP, etc.)
- Event status workflow (CREATED → LAUNCHED → LIVE → CLOSED)
- Location and venue management
- Artist lineup management
- Image upload to Google Cloud Storage

### Ticketing
- QR code generation for tickets
- Ticket transfer between users
- Resale marketplace
- Promo codes and coupons
- Invitation system

### Orders & Payments
- Stripe payment processing
- Order management
- Refund handling
- Payment method management for promoters
- Payment withdrawal requests

### Real-time Features
- Order notifications via WebSocket
- Event status updates
- Ticket sales updates
- Access control check-ins

### Analytics
- Event-level analytics
- Promoter dashboard metrics
- Sales reports
- Revenue tracking

### Background Jobs
- Email sending (order confirmations, tickets)
- Event status updates (cron)
- Image processing

### Security
- JWT authentication
- Role-based access control (USER, PROMOTER, ADMIN, ACCESS)
- Rate limiting
- CORS protection
- Input validation with DTOs

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 4.4+ (local or Atlas)
- **Redis** 6+ (for Bull queues)
- **Stripe Account** (for payments)

### Option 1: Quick Start with Docker Compose (Recommended)

The fastest way to get started is using Docker Compose, which sets up everything automatically:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/futura-tickets-admin-api.git
cd futura-tickets-admin-api

# 2. Start all services (MongoDB, Redis, Mailhog, API)
docker-compose up -d

# 3. View logs
docker-compose logs -f admin-api

# 4. Access the API
# API: http://localhost:3004
# Swagger: http://localhost:3004/api/docs
# Mailhog UI: http://localhost:8025
```

Docker Compose includes:
- MongoDB 7.0 (with authentication)
- Redis 7 (for Bull queues)
- Mailhog (for email testing)
- Admin API (with hot reload)

See [DOCKER_COMPOSE_GUIDE.md](./DOCKER_COMPOSE_GUIDE.md) for detailed documentation.

### Option 2: Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/futura-tickets-admin-api.git
cd futura-tickets-admin-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see [Environment Variables](#environment-variables))

4. Start MongoDB and Redis:
```bash
# MongoDB (if local)
mongod --dbpath /path/to/data

# Redis (if local)
redis-server
```

5. Run the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

---

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Environment
NODE_ENV=development

# Server
PORT=3000

# MongoDB
MONGO_URL=mongodb://localhost:27017/futura-tickets

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Cloud Storage (migrated from Azure)
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=futuratickets-dev-images
GCS_KEY_FILE=./config/gcs-service-account-key.json

# Redis (Bull)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3001,http://localhost:3002

# Swagger Documentation
ENABLE_SWAGGER=true
```

### Required Variables

The following variables are **required** and validated at startup:
- `MONGO_URL`
- `JWT_SECRET` (min 32 characters)
- `STRIPE_SECRET_KEY`
- `GCS_PROJECT_ID` (Google Cloud Storage project ID)
- `GCS_BUCKET_NAME` (Google Cloud Storage bucket name)
- `GCS_KEY_FILE` (Path to service account JSON key)

See `src/config/env.validation.ts` for full validation rules.

### Storage Migration Note

The API has been migrated from Azure Blob Storage to Google Cloud Storage. See:
- `RESUMEN_MIGRACION_GCS.md` - Migration summary
- `PASOS_CONFIGURACION_GCS.md` - GCS configuration steps
- `MIGRATION_AZURE_TO_GCS.md` - Technical migration details

---

## Project Structure

```
src/
├── Account/              # User account management
│   ├── dto/             # DTOs with validation
│   ├── account.controller.ts
│   ├── account.service.ts
│   └── account.schema.ts
├── Auth/                 # JWT authentication
│   ├── jwt.strategy.ts
│   ├── auth.decorator.ts
│   └── guards/
├── CronJobs/             # Scheduled tasks
│   └── cron-jobs.service.ts  # Event status updates
├── Event/                # Event management (main module)
│   ├── dto/             # Event DTOs
│   ├── admin-event.controller.ts
│   ├── user-event.controller.ts
│   ├── admin-event.service.ts
│   ├── event.schema.ts
│   └── invitations.service.ts
├── Logger/               # Winston logging
│   ├── logger.service.ts
│   ├── logger.module.ts
│   ├── http-logger.interceptor.ts
│   └── README.md
├── Mail/                 # Email service
│   ├── mail.service.ts
│   └── mail.processor.ts  # Bull job processor
├── Orders/               # Order management
│   ├── dto/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.schema.ts
├── Payments/             # Payment processing
│   ├── dto/
│   ├── payments.controller.ts
│   ├── payment-methods.controller.ts
│   └── payments.service.ts
├── Promoter/             # Promoter accounts
│   └── promoter.service.ts
├── Sales/                # Ticket sales
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   └── sales.schema.ts
├── Socket/               # WebSocket gateway
│   └── socket.gateway.ts
├── Stripe/               # Stripe integration
│   ├── stripe.controller.ts
│   └── stripe.service.ts
├── config/               # Configuration files
│   ├── env.validation.ts
│   ├── logger.config.ts
│   └── swagger.config.ts
├── app.module.ts         # Root module
└── main.ts               # Bootstrap file
```

---

## API Documentation

### Swagger UI

When running in development mode, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

The Swagger UI provides:
- Interactive API testing
- Request/response schemas
- Authentication endpoints
- All available endpoints with examples

### Main Endpoints

#### Authentication
- `POST /api/accounts/login` - Login
- `POST /api/accounts/register` - Register new account
- `POST /api/accounts/login-google` - Google OAuth login
- `POST /api/accounts/validate` - Validate JWT token

#### Events (Admin)
- `GET /api/admin/events` - List promoter's events
- `POST /api/admin/events` - Create new event
- `GET /api/admin/events/:id` - Get event details
- `PATCH /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `POST /api/admin/events/:id/launch` - Launch event (make public)

#### Events (Public)
- `GET /api/events` - List all launched events
- `GET /api/events/:id` - Get public event details

#### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/resend` - Resend order email

#### Payments
- `GET /api/payments/methods` - List payment methods
- `POST /api/payments/methods` - Add payment method
- `GET /api/payments/requests` - List payment requests
- `POST /api/payments/requests` - Request payment withdrawal

#### Stripe
- `GET /api/stripe/config` - Get Stripe public key
- `POST /api/stripe/webhook` - Stripe webhook handler

---

## Development

### Running in Development Mode

```bash
npm run start:dev
```

This starts the server with hot-reload enabled.

### Linting

```bash
npm run lint
npm run lint:fix
```

### Code Formatting

```bash
npm run format
```

### Building

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Note**: Test suite is currently under development. See `/test` directory.

---

## Deployment

### Docker

A Dockerfile is provided for containerized deployment:

```bash
# Build image
docker build -t futura-tickets-api .

# Run container
docker run -p 3000:3000 --env-file .env futura-tickets-api
```

### Production Checklist

Before deploying to production:

1. ✅ Set `NODE_ENV=production`
2. ✅ Configure all required environment variables
3. ✅ Set strong `JWT_SECRET` (min 32 characters)
4. ✅ Use production MongoDB database
5. ✅ Use production Stripe keys
6. ✅ Configure CORS with specific origins
7. ✅ Set up Redis for Bull queues
8. ✅ Configure SMTP for email sending
9. ✅ Set up log aggregation (e.g., ELK Stack)
10. ✅ Enable HTTPS
11. ✅ Set up database backups
12. ✅ Monitor with APM tool (New Relic, Datadog, etc.)

---

## Architecture

### Module Architecture

```
┌─────────────────────────────────────────┐
│        NestJS Application Layer         │
├─────────────────────────────────────────┤
│                                         │
│  Controllers → Services → Repositories  │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │   HTTP REST API (port 3000)      │ │
│  │   - Authentication (JWT)         │ │
│  │   - DTOs with Validation         │ │
│  │   - Swagger Documentation        │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │   WebSocket Gateway (Socket.IO)  │ │
│  │   - Real-time notifications      │ │
│  │   - Event updates                │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │   Background Jobs (Bull)         │ │
│  │   - Email queue                  │ │
│  │   - Image processing             │ │
│  └──────────────────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐ │
│  │   Cron Jobs (@nestjs/schedule)   │ │
│  │   - Event status updates         │ │
│  │   - Every 15 minutes             │ │
│  └──────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   External Services   │
        ├───────────────────────┤
        │ - MongoDB Database    │
        │ - Redis (Bull)        │
        │ - Stripe API          │
        │ - Google Cloud Storage│
        │ - SMTP Server         │
        └───────────────────────┘
```

### Data Flow: Order Creation

```
1. Client → POST /api/orders
2. OrdersController validates CreateOrderDto
3. OrdersService creates order (status: PENDING)
4. StripeService creates PaymentIntent
5. Client completes payment with Stripe
6. Stripe → Webhook → POST /api/stripe/webhook
7. StripeService validates webhook signature
8. OrdersService updates order (status: COMPLETED)
9. SalesService creates tickets with QR codes
10. MailService enqueues email job (Bull)
11. SocketGateway emits order-created event
12. Mail worker processes email and sends tickets
```

### Database Schema

#### Event
```typescript
{
  promoter: ObjectId,
  name: string,
  description: string,
  capacity: number,
  commission: number,
  location: {
    venue: string,
    address: string,
    city: string,
    ...
  },
  dateTime: {
    launchDate: Date,
    startDate: Date,
    endDate: Date
  },
  ticketLots: [{
    name: string,
    price: number,
    quantity: number
  }],
  status: EventStatus,
  ...
}
```

#### Order
```typescript
{
  paymentId: string,
  event: ObjectId,
  client: ObjectId,
  items: [{
    type: string,
    amount: number,
    price: number
  }],
  total: number,
  status: OrderStatus,
  createdAt: Date
}
```

#### Sale (Ticket)
```typescript
{
  order: ObjectId,
  event: ObjectId,
  client: ObjectId,
  type: string,
  price: number,
  qrCode: string,
  status: TicketStatus,
  resale: {
    isResale: boolean,
    resalePrice: number
  }
}
```

---

## Logging

The API uses **Winston** for structured logging. See `src/Logger/README.md` for details.

**Log Levels** (by environment):
- Development: `debug`
- Production: `info`

**Log Files** (in `logs/` directory):
- `combined.log` - All logs
- `error.log` - Errors only
- `warnings.log` - Warnings
- `exceptions.log` - Uncaught exceptions

---

## Validation

All DTOs use **class-validator** decorators for automatic validation. See `src/DTOs-README.md` for comprehensive DTO documentation.

**Example:**
```typescript
export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
```

Invalid requests return `400 Bad Request` with error details in Spanish.

---

## Security

### Authentication
- JWT tokens (expires in 7 days by default)
- Passwords hashed with bcrypt
- Google OAuth2 support

### Authorization
- Role-based access control (RBAC)
- Guard decorators: `@Auth(UserPipeService)`
- Roles: USER, PROMOTER, ADMIN, ACCESS

### Rate Limiting
- Global rate limiting via ThrottlerModule
- Default: 10 requests per 60 seconds
- Configurable via `THROTTLE_TTL` and `THROTTLE_LIMIT`

### CORS
- Whitelist-based CORS
- Configure allowed origins via `CORS_ORIGINS` env variable

### Input Validation
- All DTOs validated with class-validator
- Whitelist mode enabled (strips unknown properties)
- SQL injection protection (MongoDB parameterized queries)

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running. Check `MONGO_URL` in `.env`.

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Ensure Redis is running. Bull queues require Redis.

### Stripe Webhook Error
```
Error: Invalid webhook signature
```
**Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe webhook configuration.

### Environment Validation Failed
```
❌ Environment validation failed
```
**Solution**: Check console output for missing/invalid environment variables. See `src/config/env.validation.ts`.

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [class-validator Docs](https://github.com/typestack/class-validator)
- [Winston Logging](https://github.com/winstonjs/winston)

---

## Support

For issues or questions, please contact the development team or open an issue in the repository.

---

## License

Copyright © 2024 Futura Tickets. All rights reserved.
