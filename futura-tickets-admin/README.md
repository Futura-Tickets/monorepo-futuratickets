# Futura Tickets Admin Panel

Modern admin panel for event promoters built with Next.js 15, React 19, and Ant Design. Manage events, sales, clients, and analytics in real-time.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Architecture](#architecture)

---

## Overview

The Futura Tickets Admin Panel is the promoter-facing web application for managing events on the Futura Tickets platform. It provides:
- Event creation and management
- Real-time sales tracking
- Client management
- Payment and withdrawal requests
- Analytics and reports
- Marketing campaigns (promo codes, coupons)
- Access control for events

**Version**: 1.0.0
**Default Port**: 3001

---

## Tech Stack

### Core Framework
- **Next.js** 15.0.3 - React framework with App Router
- **React** 19 RC - UI library
- **TypeScript** 5 - Type-safe JavaScript
- **Node.js** 18+ - Runtime environment

### UI Framework
- **Ant Design** 5.22.0 - Enterprise UI components
- **Sass** 1.80.6 - CSS preprocessor
- **CSS Modules** - Scoped styling

### State Management
- **React Context API** - Global state management
- Custom hooks for state management

### Real-time Communication
- **Socket.IO Client** 4.8.1 - WebSocket client
- Multiple socket connections (Admin, Access, Marketplace)

### Forms & Validation
- **React Hook Form** 7.x - Form management
- **Zod** 3.x - Schema validation
- Custom validation schemas

### Authentication
- **@react-oauth/google** 0.12.1 - Google OAuth2

### Data Visualization
- **React Google Charts** 5.2.1 - Charts and graphs

### API Communication
- **Fetch API** - HTTP client with custom wrapper
- Automatic auth header injection
- Error handling with interceptors

---

## Features

### Event Management
- **Create Events**: Multi-step form with validation
  - Basic info (name, description, genres)
  - Location and venue details
  - Date and time configuration
  - Multiple ticket types/lots
  - Artist lineup
  - Images upload
  - Resale configuration
- **Edit Events**: Update event details
- **Launch Events**: Make events public for ticket sales
- **View Analytics**: Event-specific metrics

### Sales & Orders
- **Real-time Updates**: Live sales notifications via WebSocket
- **Sales Dashboard**: View all ticket sales
- **Order Management**: Track customer orders
- **Ticket Details**: View QR codes, transfer history
- **Resend Emails**: Resend order confirmations

### Client Management
- **Client List**: View all customers
- **Client Details**: Purchase history per client
- **Contact Information**: Email, phone, address

### Payments
- **Payment Methods**: Configure bank accounts, PayPal, etc.
- **Withdrawal Requests**: Request payments for ticket sales
- **Payment History**: Track all transactions

### Analytics
- **Event Metrics**: Sales, revenue, attendance
- **Charts & Graphs**: Visual data representation
- **Export Data**: CSV export for reports
- **Date Range Filters**: Custom date ranges

### Marketing Tools
- **Promo Codes**: Create promotional codes
- **Coupons**: Discount coupons
- **Invitations**: Send free ticket invitations
- **Campaign Tracking**: Monitor campaign performance

### Access Control
- **Access Accounts**: Create accounts for event staff
- **QR Code Scanning**: Real-time check-in tracking
- **Attendance Reports**: Live attendance metrics

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Admin API** running on port 3000 (see backend README)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/futura-tickets-admin.git
cd futura-tickets-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (see [Environment Variables](#environment-variables))

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

---

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Backend API URL
NEXT_PUBLIC_FUTURA=http://localhost:3000

# Socket.IO URLs
NEXT_PUBLIC_FUTURA_WS=ws://localhost:3000
NEXT_PUBLIC_ACCESS=ws://localhost:3004
NEXT_PUBLIC_MARKETPLACE=ws://localhost:3002

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Production Variables

For production deployment:

```bash
# Backend API URL (production)
NEXT_PUBLIC_FUTURA=https://admin-api.futuratickets.com

# Socket.IO URLs (production)
NEXT_PUBLIC_FUTURA_WS=wss://admin-api.futuratickets.com
NEXT_PUBLIC_ACCESS=wss://access-api.futuratickets.com
NEXT_PUBLIC_MARKETPLACE=wss://marketplace-api.futuratickets.com

# Google OAuth (production)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
```

---

## Project Structure

```
app/                          # Next.js App Router
├── layout.tsx               # Root layout with providers
├── page.tsx                 # Home page (redirects to dashboard)
├── globals.scss             # Global styles
│
├── login/                   # Login page
│   └── page.tsx
├── register/                # Registration page
│   └── page.tsx
├── account/                 # Account settings
│   └── page.tsx
│
├── events/                  # Event management
│   ├── page.tsx             # Events list
│   ├── create/page.tsx      # Create new event
│   ├── [event]/page.tsx     # Event details
│   └── [event]/edit/page.tsx
│
├── clients/                 # Client management
│   ├── page.tsx             # Clients list
│   └── [client]/page.tsx
│
├── payments/                # Payments
│   └── page.tsx
│
├── analytics/               # Analytics dashboard
│   └── page.tsx
│
├── campaigns/               # Marketing campaigns
│   └── page.tsx
│
├── settings/                # Settings
│   └── page.tsx
│
└── api/                     # API Routes (BFF Pattern)
    ├── clients/
    ├── payments/
    ├── sales/
    └── ...

components/                  # React Components
├── FuturaAdminProvider.tsx  # Ant Design theme config
├── RootProvider.tsx         # All providers wrapper
├── ErrorBoundary/           # Error boundary component
│   ├── ErrorBoundary.tsx
│   └── ErrorBoundary.scss
│
├── GlobalStateProvider/     # Global state context
│   └── GlobalStateProvider.tsx
│
├── Socket.tsx               # Admin WebSocket
├── SocketAccess.tsx         # Access WebSocket
├── SocketMarketPlace.tsx    # Marketplace WebSocket
│
├── Dashboard/               # Dashboard components
├── Events/                  # Event list components
├── Event/                   # Event detail components
├── CreateEvent/             # Event creation form
├── Analytics/               # Analytics components
├── Campaigns/               # Campaign components
├── Payments/                # Payment components
├── User/                    # User profile
├── Login/                   # Login components
├── Register/                # Registration components
└── ...

shared/                      # Shared utilities
├── api/                     # NEW: Modular API layer
│   ├── client.ts           # Base HTTP client
│   ├── auth.service.ts     # Auth endpoints
│   ├── events.service.ts   # Event endpoints
│   ├── sales.service.ts    # Sales endpoints
│   ├── orders.service.ts   # Order endpoints
│   ├── payments.service.ts # Payment endpoints
│   └── index.ts            # Central exports
│
├── validations/            # NEW: Zod validation schemas
│   ├── auth.schemas.ts     # Login, register
│   ├── event.schemas.ts    # Event creation
│   ├── coupon.schemas.ts   # Coupons, promos
│   ├── payment.schemas.ts  # Payments
│   └── index.ts            # Central exports
│
├── interfaces.tsx          # TypeScript interfaces
├── Menu/                   # Sidebar menu
├── Filters/                # Filter components
├── Loader/                 # Loading spinner
├── Error/                  # Error display
└── utils/                  # Utility functions
    └── http.ts             # HTTP utilities

public/                     # Static assets
├── images/
└── icons/
```

---

## Key Features

### 1. Refactored Service Layer

The old monolithic `services.tsx` (28k+ lines) has been refactored into modular services:

```typescript
// OLD (single file)
import { createEvent, getEvents, ... } from './services';

// NEW (modular)
import { eventsService } from '@/shared/api';

const events = await eventsService.getAll();
await eventsService.create(eventData);
```

**Benefits:**
- Better code organization
- Easier testing
- Improved maintainability
- Tree-shaking optimization

### 2. Form Validation with Zod

All forms now use Zod schemas for validation:

```typescript
import { loginSchema } from '@/shared/validations';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema)
});
```

**Available Schemas:**
- `authSchemas`: Login, register, password reset
- `eventSchemas`: Event creation with nested validation
- `couponSchemas`: Coupons, promo codes, invitations
- `paymentSchemas`: Payment methods, withdrawal requests

### 3. HTTP Client with Auto-Redirect

The new HTTP client automatically handles authentication errors:

```typescript
// Automatic 401/403 detection
// Automatic redirect to /login
// Automatic error messaging
// Auto-inject Authorization headers

import { apiClient } from '@/shared/api';

try {
  const data = await apiClient.get('/api/events');
} catch (error) {
  // Already handled by interceptor
}
```

### 4. Error Boundary

Global error boundary catches React errors gracefully:

```typescript
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

**Features:**
- Graceful error UI
- Retry functionality
- Page reload option
- Development mode shows stack traces

### 5. Real-time Updates

Three WebSocket connections for different data streams:

```typescript
// Admin events socket
Socket.tsx: order-created, sale-updated, event-launched

// Access control socket
SocketAccess.tsx: check-in, check-out

// Marketplace socket
SocketMarketPlace.tsx: resale-created, resale-sold
```

### 6. Global State Management

React Context API for global state:

```typescript
const [state, dispatch] = useGlobalState();

// Available state:
state.account      // Current user
state.events       // User's events
state.menuState    // Sidebar open/closed
state.notifications // Real-time notifications
```

---

## Development

### Running in Development Mode

```bash
npm run dev
```

App will be available at `http://localhost:3001` with hot-reload enabled.

### Linting

```bash
npm run lint
npm run lint:fix
```

### Type Checking

```bash
npx tsc --noEmit
```

---

## Building for Production

### Build

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### Start Production Server

```bash
npm start
```

### Docker Build

A Dockerfile is provided:

```bash
# Build image
docker build -t futura-tickets-admin .

# Run container
docker run -p 3001:3001 --env-file .env.local futura-tickets-admin
```

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────┐
│    Next.js Application (port 3001)      │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐ │
│  │   React Components               │ │
│  │   - Ant Design UI                │ │
│  │   - React Hook Form + Zod        │ │
│  └──────────────────────────────────┘ │
│                │                        │
│                ▼                        │
│  ┌──────────────────────────────────┐ │
│  │   API Services Layer             │ │
│  │   - Modular services             │ │
│  │   - HTTP client with auth        │ │
│  │   - Error handling               │ │
│  └──────────────────────────────────┘ │
│                │                        │
│                ▼                        │
│  ┌──────────────────────────────────┐ │
│  │   Global State (Context API)     │ │
│  │   - Account, Events, Menu        │ │
│  └──────────────────────────────────┘ │
│                │                        │
│  ┌──────────────────────────────────┐ │
│  │   WebSocket Connections (3)      │ │
│  │   - Admin events                 │ │
│  │   - Access control               │ │
│  │   - Marketplace                  │ │
│  └──────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │   Admin API (port 3000)       │
    │   - REST endpoints            │
    │   - Socket.IO server          │
    └───────────────────────────────┘
```

### Authentication Flow

```
1. User → Login page
2. Enter credentials
3. Submit → authService.login()
4. Backend validates → Returns JWT + account data
5. Store token in localStorage
6. Store account in global state
7. Redirect to /events
8. All API calls auto-inject Authorization header
9. On 401/403 → Auto-redirect to /login
```

### Event Creation Flow

```
1. User → /events/create
2. Fill multi-step form with validation
3. Submit → Zod validates data
4. eventsService.create(eventData)
5. Backend creates event
6. Upload images to Azure
7. Backend returns event with status: CREATED
8. Redirect to /events/[eventId]
9. User can launch event when ready
```

---

## Recent Improvements

### ✅ Completed

1. **Service Layer Refactoring**
   - Split 28k-line `services.tsx` into 12 modular files
   - Created centralized API client with error handling
   - Automatic 401/403 redirect
   - Better code organization

2. **Form Validation**
   - Integrated Zod for schema validation
   - Created validation schemas for all major forms
   - Spanish error messages
   - Type-safe form data

3. **Error Boundary**
   - Global error catching
   - Graceful fallback UI
   - Retry and reload options

4. **HTTP Client**
   - Auto-inject auth headers
   - Auto-redirect on auth errors
   - Error messaging with Ant Design

---

## Best Practices

### API Calls

**DO:**
```typescript
import { eventsService } from '@/shared/api';

const events = await eventsService.getAll();
```

**DON'T:**
```typescript
const response = await fetch('/api/events'); // ❌ No auth, no error handling
```

### Form Validation

**DO:**
```typescript
import { loginSchema } from '@/shared/validations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(loginSchema)
});
```

**DON'T:**
```typescript
// Manual validation ❌
if (!email || !password) { ... }
```

### State Management

**DO:**
```typescript
const [state, dispatch] = useGlobalState();
dispatch({ account: newAccount });
```

**DON'T:**
```typescript
localStorage.setItem('account', JSON.stringify(account)); // ❌ Bypasses global state
```

---

## Troubleshooting

### API Connection Error
```
Error: Failed to fetch
```
**Solution**: Ensure backend API is running on port 3000. Check `NEXT_PUBLIC_FUTURA` in `.env.local`.

### WebSocket Connection Failed
```
Socket connection error
```
**Solution**: Check WebSocket URLs in `.env.local`. Ensure backend supports WebSockets.

### Build Error - Module Not Found
```
Module not found: Can't resolve '@/shared/api'
```
**Solution**: Check `tsconfig.json` has correct path mappings. Run `npm install`.

### 401 Unauthorized
```
Response: 401 Unauthorized
```
**Solution**: Token expired or invalid. Log out and log in again. Check backend `JWT_SECRET`.

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Ant Design Components](https://ant.design/components/overview/)
- [Zod Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

---

## Support

For issues or questions, please contact the development team or open an issue in the repository.

---

## License

Copyright © 2024 Futura Tickets. All rights reserved.
