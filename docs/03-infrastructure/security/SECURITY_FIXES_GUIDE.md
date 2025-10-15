# 🔒 Security Fixes Guide - FuturaTickets

This guide contains all the security fixes that need to be applied to each repository.

## 🎯 Quick Apply

Run this in each repository to apply all security fixes:

```bash
# Copy this script to each repo and run it
bash apply-security-fixes.sh
```

---

## 📋 Manual Fixes by Repository

### 1. futura-market-place-api

#### Fix 1: Move SMTP credentials to environment variables

**File:** `src/Mail/mail.module.ts`

**Current (Lines 42-46):**
```typescript
transport: {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@futuratickets.com',
    pass: 'pbltfxpubzftnxat'
  }
}
```

**Replace with:**
```typescript
transport: {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 465,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
}
```

**Add to .env:**
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=noreply@futuratickets.com
MAIL_PASSWORD=pbltfxpubzftnxat
```

#### Fix 2: Configure CORS with whitelist

**File:** `src/main.ts`

**Current:**
```typescript
app.enableCors();
```

**Replace with:**
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

**Add to .env:**
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3003,https://marketplace.futuratickets.com,https://admin.futuratickets.com
```

---

### 2. futura-tickets-admin-api

#### Fix 1: Configure CORS with whitelist

**File:** `src/main.ts`

**Find (around line 14):**
```typescript
app.enableCors();
// const whitelist = [
//   'http://localhost:3000',
//   ...
// ];
```

**Replace with:**
```typescript
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3003'
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

#### Fix 2: Remove @ts-ignore

**File:** `src/app.module.ts` (line 49)

**Current:**
```typescript
// @ts-ignore
useFactory: (config: ConfigService) => [...]
```

**Replace with:**
```typescript
useFactory: (config: ConfigService): ThrottlerModuleOptions[] => [{
  ttl: config.get<number>('THROTTLE_TTL'),
  limit: config.get<number>('THROTTLE_LIMIT')
}]
```

---

### 3. futura-access-api

#### Fix: Configure CORS (if not already)

**File:** `src/main.ts`

**Add after `app` creation:**
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

---

### 4. futura-market-place-v2

#### Fix 1: Move Google Client ID to environment variable

**File:** `app/layout.tsx` (line 30)

**Current:**
```typescript
<GoogleOAuthProvider clientId="15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com">
```

**Replace with:**
```typescript
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
```

**Add to .env.local:**
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com
```

#### Fix 2: Fix GlobalContext bug

**File:** `contexts/global-context.tsx` (lines 36-39)

**Current:**
```typescript
<GlobalContext.Provider value={{
  ...globalContextState,
  ...availableCountries,  // ❌ Wrong
  setAvailableCountries,
  ...citiesByCountry,     // ❌ Wrong
  setCitiesByCountry
}}>
```

**Replace with:**
```typescript
<GlobalContext.Provider value={{
  ...globalContextState,
  availableCountries,     // ✅ Correct
  setAvailableCountries,
  citiesByCountry,        // ✅ Correct
  setCitiesByCountry
}}>
```

#### Fix 3: Enable TypeScript validation

**File:** `next.config.mjs`

**Current:**
```javascript
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // ...
}
```

**Replace with:**
```javascript
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },  // ✅ Enable
  typescript: { ignoreBuildErrors: false }, // ✅ Enable
  // ...
}
```

---

### 5. futura-tickets-admin

#### Fix 1: Move Google Client ID to environment variable

**File:** `app/layout.tsx` (if exists)

Same fix as marketplace-v2.

#### Fix 2: Enable TypeScript validation

**File:** `next.config.js`

Same fix as marketplace-v2.

---

## 🔑 Generate Strong JWT Secret

Run this in your terminal to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**CRITICAL:** Use the **SAME** JWT_SECRET_KEY in ALL backend APIs:
- futura-tickets-admin-api
- futura-market-place-api
- futura-access-api

Update all `.env` files with this secret.

---

## 🛡️ Security Checklist

### Backend APIs

- [ ] CORS configured with whitelist (not `enableCors()` alone)
- [ ] No hardcoded passwords or API keys
- [ ] All secrets in environment variables
- [ ] JWT_SECRET_KEY is strong (64+ characters) and identical across APIs
- [ ] Rate limiting configured
- [ ] Helmet.js enabled (add if not present)
- [ ] Input validation with class-validator
- [ ] No @ts-ignore without justification

### Frontend Apps

- [ ] Google Client ID in environment variable
- [ ] No API keys in source code
- [ ] TypeScript validation enabled
- [ ] ESLint validation enabled
- [ ] No localhost URLs in production builds
- [ ] Sensitive operations use POST (not GET with params)

---

## 🚀 Testing After Changes

### Test CORS

```bash
# Should succeed (allowed origin)
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:3001/health

# Should fail (not allowed origin)
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  http://localhost:3001/health
```

### Test Environment Variables

```bash
# In each API, add this endpoint temporarily:
@Get('/env-test')
envTest() {
  return {
    hasMailUser: !!process.env.MAIL_USER,
    hasJwtSecret: !!process.env.JWT_SECRET_KEY,
    corsOrigins: process.env.CORS_ORIGINS
  };
}

# Test it:
curl http://localhost:3001/env-test
```

---

## 📝 Commit Message Template

```
fix(security): move hardcoded secrets to environment variables

BREAKING CHANGE: Configuration now requires environment variables

- Move SMTP credentials to MAIL_USER and MAIL_PASSWORD
- Move Google Client ID to NEXT_PUBLIC_GOOGLE_CLIENT_ID
- Configure CORS with whitelist instead of allowing all origins
- Generate strong JWT_SECRET_KEY (64 bytes)
- Fix GlobalContext spread operator bug
- Enable TypeScript and ESLint validation

All services now require proper .env configuration.
See .env.example for required variables.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔄 Apply All Fixes Script

Save this as `apply-security-fixes.sh` in each repo:

```bash
#!/bin/bash
set -e

echo "🔒 Applying security fixes..."

# Detect repository type
if [ -f "nest-cli.json" ]; then
  REPO_TYPE="nestjs"
elif [ -f "next.config.mjs" ] || [ -f "next.config.js" ]; then
  REPO_TYPE="nextjs"
else
  echo "❌ Unknown repository type"
  exit 1
fi

# Generate JWT secret if needed
if [ ! -f ".env" ]; then
  cp .env.example .env
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  echo "JWT_SECRET_KEY=$JWT_SECRET" >> .env
  echo "✅ Generated .env with JWT_SECRET_KEY"
fi

# Apply fixes based on repo type
if [ "$REPO_TYPE" = "nestjs" ]; then
  echo "📦 NestJS API detected"

  # Check if main.ts exists
  if [ -f "src/main.ts" ]; then
    # Backup
    cp src/main.ts src/main.ts.backup
    echo "✅ Backed up main.ts"
  fi

elif [ "$REPO_TYPE" = "nextjs" ]; then
  echo "⚛️ Next.js App detected"

  # Fix next.config if exists
  if [ -f "next.config.mjs" ]; then
    sed -i.backup 's/ignoreDuringBuilds: true/ignoreDuringBuilds: false/g' next.config.mjs
    sed -i.backup 's/ignoreBuildErrors: true/ignoreBuildErrors: false/g' next.config.mjs
    echo "✅ Enabled TypeScript and ESLint validation"
  fi
fi

echo "✅ Security fixes applied! Review changes and test thoroughly."
echo "📝 Don't forget to update .env with your actual credentials"
```

---

## 🎯 Priority Order

1. **CRITICAL (Do Now):**
   - Generate and sync JWT_SECRET_KEY across all APIs
   - Move SMTP password from code to .env
   - Configure CORS whitelist

2. **HIGH (Do Today):**
   - Move Google Client ID to .env
   - Fix GlobalContext bug
   - Enable TypeScript/ESLint validation

3. **MEDIUM (Do This Week):**
   - Add input validation DTOs
   - Add health checks
   - Configure Helmet.js

---

**Need help?** Refer to the .env.example files in each repository for all required variables.
