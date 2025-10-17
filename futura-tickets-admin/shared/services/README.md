# Services Directory

This directory contains the refactored service layer for Futura Tickets Admin, organized by domain.

## Overview

The original `services.tsx` file (28,142 lines) has been split into smaller, domain-specific service files for better maintainability and organization.

## Service Files

### 1. **auth.service.ts** (10 functions)
Authentication and account management.

- `createAccount()` - Register new account
- `createPromoterAccount()` - Create promoter account
- `createAccessAccount()` - Create access control account
- `loginAccount()` - Email/password login
- `loginGoogle()` - Google OAuth login
- `checkExpiration()` - Verify token validity
- `getProfile()` - Get current user profile
- `updateAccount()` - Update account information
- `getAdminAccounts()` - Get all admin accounts
- `deleteAdminAccount()` - Delete admin account

### 2. **events.service.ts** (9 functions)
Event CRUD operations and management.

- `getEvents()` - Get all events
- `getEvent()` - Get single event
- `createEvent()` - Create new event
- `editEvent()` - Update event
- `launchEvent()` - Launch event (make live)
- `deleteEvent()` - Delete event
- `getEventResale()` - Get resale settings
- `enableResale()` - Enable/disable resale
- `exportEventCSVRequest()` - Export event data to CSV

### 3. **sales.service.ts** (2 functions)
Sales and ticket management.

- `getSales()` - Get all sales
- `getSale()` - Get single sale

### 4. **orders.service.ts** (3 functions)
Order management.

- `getOrders()` - Get all orders
- `getOrder()` - Get single order
- `resendEmailOrder()` - Resend order confirmation email

### 5. **clients.service.ts** (3 functions)
Client/customer management.

- `getClients()` - Get all clients
- `getClient()` - Get single client
- `exportClientsCSVRequest()` - Export clients to CSV

### 6. **payments.service.ts** (7 functions)
Payment methods and withdrawal requests.

- `getPayments()` - Get all payments
- `getPaymentMethods()` - Get payment methods
- `createPaymentMethod()` - Add payment method
- `deletePaymentMethod()` - Remove payment method
- `getPaymentRequests()` - Get withdrawal requests
- `createPaymentRequest()` - Create withdrawal request
- `deletePaymentRequest()` - Cancel withdrawal request

### 7. **analytics.service.ts** (2 functions)
Analytics and campaign data.

- `getAnalytics()` - Get analytics data
- `getCampaigns()` - Get campaign data

### 8. **promo.service.ts** (6 functions)
Promo codes and coupons.

- `createCoupon()` - Create coupon
- `getCoupons()` - Get all coupons
- `deleteCoupon()` - Delete coupon
- `getPromoCodes()` - Get all promo codes
- `createPromoCode()` - Create promo code
- `deletePromoCode()` - Delete promo code

### 9. **invitations.service.ts** (4 functions)
Event invitations system.

- `getInvitations()` - Get all invitations
- `getEventInvitations()` - Get event invitations
- `createInvitation()` - Create invitation
- `deleteInvitation()` - Delete invitation

### 10. **access.service.ts** (2 functions)
Access control for events.

- `getEventAccessAccounts()` - Get access accounts
- `getEventAccess()` - Get access information

### 11. **notifications.service.ts** (6 functions)
Notification management.

- `getNotifications()` - Get all notifications
- `getNotificationsByOrderId()` - Get notifications by order
- `getNotificationsByClientId()` - Get notifications by client
- `getNotificationByOrderId()` - Get notification by order (alternative)
- `markAsRead()` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read

### 12. **settings.service.ts** (2 functions)
Application settings.

- `enableDisableApi()` - Toggle API access
- `getFuturaApiSettings()` - Get API settings

## Usage

Import services from the index file:

```typescript
import {
  loginAccount,
  getEvents,
  createEvent,
  getSales,
  getClients,
  getPaymentMethods,
  createInvitation,
} from '@/shared/services';
```

Or import from specific service files:

```typescript
import { loginAccount, getProfile } from '@/shared/services/auth.service';
import { getEvents, createEvent } from '@/shared/services/events.service';
```

## Migration Notes

- ✅ All functions from the original `services.tsx` have been migrated
- ✅ TypeScript interfaces are imported from `../interfaces`
- ✅ All functions use the same API patterns (fetch, headers, error handling)
- ✅ Bearer token authentication is preserved
- ⚠️ The original `services.tsx` file is kept for backwards compatibility
- ⚠️ Components should be gradually migrated to use the new service structure

## Total Functions

**56 functions** distributed across **12 service files**

## Next Steps

1. ✅ **Verify** - Test that all imports work correctly
2. **Migrate Components** - Update components to import from new service files
3. **Remove Original** - Delete `services.tsx` once all components are migrated
4. **Add Tests** - Write unit tests for each service file
5. **Add Error Handling** - Improve error handling with proper error types

## Benefits

- 📁 **Better Organization** - Services grouped by domain
- 🔍 **Easier to Find** - Clear separation of concerns
- 🧪 **Easier to Test** - Smaller, focused service files
- 📚 **Better Documentation** - Clear function responsibilities
- 🚀 **Better Performance** - Tree-shaking friendly exports
- 👥 **Better Collaboration** - Reduced merge conflicts

## File Sizes

| File | Size | Functions |
|------|------|-----------|
| auth.service.ts | 5.1 KB | 10 |
| events.service.ts | 4.8 KB | 9 |
| payments.service.ts | 3.6 KB | 7 |
| notifications.service.ts | 3.8 KB | 6 |
| promo.service.ts | 3.3 KB | 6 |
| invitations.service.ts | 2.2 KB | 4 |
| clients.service.ts | 1.6 KB | 3 |
| orders.service.ts | 1.5 KB | 3 |
| access.service.ts | 1.1 KB | 2 |
| analytics.service.ts | 966 B | 2 |
| settings.service.ts | 1.1 KB | 2 |
| sales.service.ts | 1.0 KB | 2 |
| **index.ts** | 2.0 KB | - |

**Total:** ~34 KB (vs 28,142 lines in original file)

---

**Refactored by:** Claude Code
**Date:** October 14, 2025
**Status:** ✅ Complete
