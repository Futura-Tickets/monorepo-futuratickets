# HttpOnly Cookies Migration Guide 🔐

## Overview
This guide documents the implementation of secure httpOnly cookies for JWT authentication in the Futura Tickets platform, replacing the current localStorage token approach.

## 🎯 Objectives
1. **Enhanced Security**: Prevent XSS attacks by using httpOnly cookies
2. **Backward Compatibility**: Support gradual migration from token-based to cookie-based auth
3. **Cross-Domain Support**: Enable authentication across subdomains
4. **Automatic Token Management**: Simplify frontend token handling

## 📋 Implementation Status

### ✅ Completed (Backend - Priority 3)

#### 1. **Cookie Parser Configuration**
- Installed `cookie-parser` and `@types/cookie-parser`
- Configured in `main.ts` for Express middleware

#### 2. **Auth Cookie Service**
- Created `/src/Auth/services/auth-cookie.service.ts`
- Features:
  - Set httpOnly cookies with proper security flags
  - Support for refresh tokens (future implementation)
  - Cookie clearing for logout
  - Domain configuration for production

#### 3. **Secure Account Controller**
- Created `/src/Account/account-secure.controller.ts`
- Endpoints available at `/accounts/secure/*`:
  - `POST /accounts/secure/login` - Login with httpOnly cookies
  - `POST /accounts/secure/login-google` - Google OAuth with cookies
  - `POST /accounts/secure/logout` - Clear authentication cookies
  - `POST /accounts/secure/validate` - Validate cookie token
  - All other endpoints with cookie-based auth

#### 4. **JWT Cookie Strategy**
- Created `/src/Auth/jwt-cookie.strategy.ts`
- Supports BOTH Bearer tokens AND cookies (backward compatible)
- Checks cookie first, falls back to Authorization header

### ⏳ Pending (Frontend - Next Steps)

#### 1. **Admin Panel Updates**
Update service calls to use credentials:
```typescript
// Before:
const response = await fetch(`${API_URL}/accounts/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData),
});
const data = await response.json();
localStorage.setItem('token', data.token);

// After:
const response = await fetch(`${API_URL}/accounts/secure/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // ← This is critical!
  body: JSON.stringify(loginData),
});
const data = await response.json();
// No need to handle token - it's in httpOnly cookie!
```

#### 2. **Marketplace Updates**
Similar updates needed for marketplace frontend.

#### 3. **Remove localStorage Usage**
Gradually remove all `localStorage.getItem('token')` and `localStorage.setItem('token')` calls.

## 🔄 Migration Strategy

### Phase 1: Parallel Support (Current State) ✅
- Both endpoints available: `/accounts/*` (old) and `/accounts/secure/*` (new)
- JWT strategy supports both Bearer tokens and cookies
- No breaking changes for existing clients

### Phase 2: Frontend Migration
1. Update Admin Panel to use secure endpoints
2. Update Marketplace to use secure endpoints
3. Test thoroughly in staging environment

### Phase 3: Deprecation
1. Mark old endpoints as deprecated
2. Monitor usage and notify remaining clients
3. Set sunset date for token-based auth

### Phase 4: Cleanup
1. Remove old account controller
2. Remove token from response bodies
3. Update documentation

## 🔧 Configuration

### Environment Variables
Add to `.env`:
```bash
# Cookie configuration (optional)
COOKIE_DOMAIN=.futuratickets.com  # For production - allows all subdomains
NODE_ENV=production                # Enables secure flag for HTTPS
```

### CORS Configuration
Already configured in `main.ts`:
```typescript
app.enableCors({
  origin: corsOrigins,
  credentials: true,  // ← Essential for cookies
  // ...
});
```

## 🧪 Testing Guide

### 1. Test Login with Cookies
```bash
# Login and receive cookie
curl -X POST http://localhost:3000/accounts/secure/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt \
  -i

# Use cookie for authenticated request
curl http://localhost:3000/events \
  -b cookies.txt
```

### 2. Test Logout
```bash
curl -X POST http://localhost:3000/accounts/secure/logout \
  -b cookies.txt \
  -c cookies.txt
```

### 3. Test Cookie Validation
```bash
curl -X POST http://localhost:3000/accounts/secure/validate \
  -b cookies.txt
```

## 🚨 Important Security Considerations

### Cookie Settings
- **httpOnly**: ✅ Prevents JavaScript access
- **secure**: ✅ HTTPS only in production
- **sameSite**: ✅ CSRF protection (strict in prod, lax in dev)
- **maxAge**: ✅ 7 days for auth token, 30 days for refresh

### Domain Configuration
- Development: No domain restriction (localhost)
- Production: `.futuratickets.com` allows:
  - admin.futuratickets.com
  - marketplace.futuratickets.com
  - api.futuratickets.com

### Security Benefits
1. **XSS Protection**: Tokens can't be stolen via JavaScript
2. **CSRF Protection**: SameSite flag prevents cross-site requests
3. **Automatic Expiry**: Browser handles cookie expiration
4. **Secure Transmission**: HTTPS-only in production

## 📝 Frontend Implementation Checklist

### Admin Panel (`futura-tickets-admin`)
- [ ] Update `shared/services.tsx` to add `credentials: 'include'`
- [ ] Remove `localStorage.setItem('token', ...)`
- [ ] Remove `Authorization` headers with localStorage tokens
- [ ] Update login/logout flows
- [ ] Test all authenticated routes

### Marketplace (`futura-market-place-v2`)
- [ ] Update `app/shared/services/services.tsx`
- [ ] Update auth context to not store token
- [ ] Remove token from localStorage
- [ ] Test checkout and user flows

### Common Changes
```typescript
// Update all fetch calls:
fetch(url, {
  ...options,
  credentials: 'include',  // Add this
  headers: {
    ...headers,
    // Remove: 'Authorization': `Bearer ${token}`
  }
})
```

## 🔍 Monitoring & Rollback

### Health Checks
1. Monitor login success rates
2. Track authentication errors
3. Check cookie setting failures
4. Monitor cross-domain issues

### Rollback Plan
If issues arise:
1. Frontend can quickly switch back to old endpoints
2. Backend maintains both strategies
3. No data migration required

## 📚 API Documentation

### New Secure Endpoints

#### POST `/accounts/secure/login`
```typescript
Request: {
  email: string;
  password: string;
}
Response: Account (without token)
Cookie: futura-auth-token (httpOnly)
```

#### POST `/accounts/secure/logout`
```typescript
Response: { message: "Logout successful" }
Effect: Clears all auth cookies
```

#### POST `/accounts/secure/validate`
```typescript
Cookie: futura-auth-token (required)
Response: DecodedToken | null
```

## 🎉 Benefits After Migration

1. **Better Security**: Immune to XSS token theft
2. **Simpler Frontend**: No manual token management
3. **Automatic Renewal**: Browser handles cookie refresh
4. **Cross-Domain Auth**: Works across all subdomains
5. **Logout Everywhere**: Server can invalidate all sessions

## 📞 Support

For questions or issues during migration:
1. Check this guide first
2. Review the implementation files
3. Test in development environment
4. Contact the development team

---

**Last Updated**: October 2025
**Status**: Backend Complete ✅ | Frontend Pending ⏳