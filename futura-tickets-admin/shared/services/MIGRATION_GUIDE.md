# Migration Guide - Services Refactoring

This guide helps you migrate your components from the old `services.tsx` to the new modular service structure.

## Quick Start

### Before (Old Import)
```typescript
import { loginAccount, getEvents, createEvent } from '@/shared/services';
```

### After (New Import)
```typescript
// Option 1: Import from index (recommended)
import { loginAccount, getEvents, createEvent } from '@/shared/services';

// Option 2: Import from specific service files
import { loginAccount } from '@/shared/services/auth.service';
import { getEvents, createEvent } from '@/shared/services/events.service';
```

## Step-by-Step Migration

### 1. Identify Current Imports

Find all files importing from the old services file:

```bash
grep -r "from '@/shared/services'" app/
grep -r "from '../shared/services'" components/
```

### 2. Update Import Statements

The new structure is **100% backwards compatible** because the `index.ts` re-exports all functions.

**No changes needed** to your existing imports if you're importing from `@/shared/services`!

### 3. Optional: Use Domain-Specific Imports

For better code organization, you can import from specific service files:

```typescript
// Before
import {
  loginAccount,
  getProfile,
  getEvents,
  createEvent,
  getSales,
  getClients,
  createPaymentMethod,
  getNotifications,
  createInvitation,
} from '@/shared/services';

// After (more organized)
import { loginAccount, getProfile } from '@/shared/services/auth.service';
import { getEvents, createEvent } from '@/shared/services/events.service';
import { getSales } from '@/shared/services/sales.service';
import { getClients } from '@/shared/services/clients.service';
import { createPaymentMethod } from '@/shared/services/payments.service';
import { getNotifications } from '@/shared/services/notifications.service';
import { createInvitation } from '@/shared/services/invitations.service';
```

## Function Mapping

Here's where each function moved to:

### Authentication Functions → `auth.service.ts`
- `createAccount()`
- `createPromoterAccount()`
- `createAccessAccount()`
- `loginAccount()`
- `loginGoogle()`
- `checkExpiration()`
- `getProfile()`
- `updateAccount()`
- `getAdminAccounts()`
- `deleteAdminAccount()`

### Event Functions → `events.service.ts`
- `getEvents()`
- `getEvent()`
- `createEvent()`
- `editEvent()`
- `launchEvent()`
- `deleteEvent()`
- `getEventResale()`
- `enableResale()`
- `exportEventCSVRequest()`

### Sales Functions → `sales.service.ts`
- `getSales()`
- `getSale()`

### Order Functions → `orders.service.ts`
- `getOrders()`
- `getOrder()`
- `resendEmailOrder()`

### Client Functions → `clients.service.ts`
- `getClients()`
- `getClient()`
- `exportClientsCSVRequest()`

### Payment Functions → `payments.service.ts`
- `getPayments()`
- `getPaymentMethods()`
- `createPaymentMethod()`
- `deletePaymentMethod()`
- `getPaymentRequests()`
- `createPaymentRequest()`
- `deletePaymentRequest()`

### Analytics Functions → `analytics.service.ts`
- `getAnalytics()`
- `getCampaigns()`

### Promo Functions → `promo.service.ts`
- `createCoupon()`
- `getCoupons()`
- `deleteCoupon()`
- `getPromoCodes()`
- `createPromoCode()`
- `deletePromoCode()`

### Invitation Functions → `invitations.service.ts`
- `getInvitations()`
- `getEventInvitations()`
- `createInvitation()`
- `deleteInvitation()`

### Access Functions → `access.service.ts`
- `getEventAccessAccounts()`
- `getEventAccess()`

### Notification Functions → `notifications.service.ts`
- `getNotifications()`
- `getNotificationsByOrderId()`
- `getNotificationsByClientId()`
- `getNotificationByOrderId()`
- `markAsRead()`
- `markAllAsRead()`

### Settings Functions → `settings.service.ts`
- `enableDisableApi()`
- `getFuturaApiSettings()`

## Example Component Migrations

### Example 1: Login Component

**Before:**
```typescript
import { loginAccount, loginGoogle } from '@/shared/services';

export default function Login() {
  const handleLogin = async (data: LoginAccount) => {
    const response = await loginAccount(data);
    // ...
  };

  const handleGoogleLogin = async (code: string) => {
    const response = await loginGoogle(code);
    // ...
  };

  return (
    // JSX...
  );
}
```

**After (Option 1 - No changes needed):**
```typescript
import { loginAccount, loginGoogle } from '@/shared/services';

export default function Login() {
  const handleLogin = async (data: LoginAccount) => {
    const response = await loginAccount(data);
    // ...
  };

  const handleGoogleLogin = async (code: string) => {
    const response = await loginGoogle(code);
    // ...
  };

  return (
    // JSX...
  );
}
```

**After (Option 2 - Domain-specific import):**
```typescript
import { loginAccount, loginGoogle } from '@/shared/services/auth.service';

export default function Login() {
  const handleLogin = async (data: LoginAccount) => {
    const response = await loginAccount(data);
    // ...
  };

  const handleGoogleLogin = async (code: string) => {
    const response = await loginGoogle(code);
    // ...
  };

  return (
    // JSX...
  );
}
```

### Example 2: Events Page

**Before:**
```typescript
import { getEvents, deleteEvent } from '@/shared/services';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
    // ...
  };

  return (
    // JSX...
  );
}
```

**After (Option 1 - No changes needed):**
```typescript
import { getEvents, deleteEvent } from '@/shared/services';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
    // ...
  };

  return (
    // JSX...
  );
}
```

**After (Option 2 - Domain-specific import):**
```typescript
import { getEvents, deleteEvent } from '@/shared/services/events.service';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
    // ...
  };

  return (
    // JSX...
  );
}
```

## Testing the Migration

### 1. Test Individual Components

After migrating, test each component to ensure it still works:

```bash
npm run dev
```

Then manually test:
- Login/Logout
- Event CRUD operations
- Sales viewing
- Payment methods
- Notifications
- etc.

### 2. Check for Import Errors

Look for TypeScript errors:

```bash
npm run build
```

### 3. Check for Runtime Errors

Open browser console and test all features.

## Common Issues

### Issue 1: "Module not found"

**Problem:**
```
Error: Cannot find module '@/shared/services/auth.service'
```

**Solution:**
Make sure your TypeScript path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 2: "Function is not exported"

**Problem:**
```
Error: 'loginAccount' is not exported from '@/shared/services/auth.service'
```

**Solution:**
Check that the function is exported in the service file and re-exported in `index.ts`.

### Issue 3: TypeScript errors with interfaces

**Problem:**
```
Error: Type 'CreateEvent' is not defined
```

**Solution:**
Make sure to import interfaces from `@/shared/interfaces`:

```typescript
import { CreateEvent, Event } from '@/shared/interfaces';
import { createEvent, getEvents } from '@/shared/services';
```

## Rollback Plan

If you encounter issues, you can easily rollback:

1. **Keep using the old `services.tsx` file** - It's still there!
2. **Revert your import changes** - Change back to:
   ```typescript
   import { ... } from '@/shared/services.tsx';
   ```

## Verification Checklist

- [ ] All TypeScript compilation errors resolved
- [ ] All components render without errors
- [ ] Login/Authentication works
- [ ] Event CRUD operations work
- [ ] Sales viewing works
- [ ] Orders viewing works
- [ ] Clients viewing works
- [ ] Payments work
- [ ] Notifications work
- [ ] Invitations work
- [ ] Access control works
- [ ] Settings work
- [ ] No console errors
- [ ] All pages load correctly

## Benefits After Migration

✅ **Smaller bundle sizes** - Tree-shaking removes unused code
✅ **Faster IDE** - Smaller files load faster in VSCode
✅ **Better IntelliSense** - Easier to find functions
✅ **Easier testing** - Test individual service domains
✅ **Better collaboration** - Fewer merge conflicts
✅ **Clearer dependencies** - See exactly what each component uses

## Support

If you encounter any issues during migration:

1. Check this guide first
2. Look at the `README.md` in `/shared/services/`
3. Review the function mapping above
4. Check the original `services.tsx` for reference

---

**Last Updated:** October 14, 2025
**Status:** Ready for migration
