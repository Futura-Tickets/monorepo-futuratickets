# FuturaTickets - Comprehensive Security Audit Report

**Date:** 2025-10-18
**Auditor:** Automated Security Analysis + Code Review
**Scope:** All APIs, Frontends, and Infrastructure
**Status:** 🔴 **HIGH RISK - NOT PRODUCTION READY**

---

## Executive Summary

**Overall Security Posture:** HIGH RISK

**Production Readiness:** ❌ **DO NOT DEPLOY** until CRITICAL and HIGH severity issues are resolved

**Critical Findings:** 5 issues requiring immediate attention
**High Severity:** 5 issues
**Medium Severity:** 5 issues
**Low Severity:** 1 issue

**Estimated Remediation Time:** 8-11 days (2-developer team)

---

## Critical Vulnerabilities (Immediate Action Required)

### 🔴 CRITICAL-1: JWT Tokens Stored in localStorage

**Severity:** CRITICAL
**Impact:** XSS attacks can steal authentication tokens
**Affected Components:** All frontend applications

**Current Implementation:**
```typescript
// futura-tickets-admin/shared/services/auth.service.ts:43
Authorization: `Bearer ${localStorage.getItem('token')}`

// futura-market-place-v2/app/shared/services/services.tsx:43
Authorization: `Bearer ${localStorage.getItem('auth_token')}`
```

**Vulnerability:**
- XSS attacks can access localStorage directly
- No HttpOnly flag protection
- Tokens persist across sessions without proper expiration
- No CSRF token protection

**Recommended Fix:**
```typescript
// Backend: Set httpOnly cookie
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Frontend: Remove localStorage calls
// Cookies are sent automatically, no manual storage needed
```

**Effort:** 2-3 days
**Priority:** P0 - Must fix before production

---

### 🔴 CRITICAL-2: Password Sent in Plaintext Email

**Severity:** CRITICAL
**Impact:** Password exposure, email interception
**Affected Files:** `futura-tickets-admin-api/src/Mail/mail.service.ts:1420`

**Current Implementation:**
```typescript
public async sendAccountConfirmation(account: Account, password: string) {
  const template = `
    <html>
      <body>
        <h1>Account Confirmation</h1>
        <ul>
          <li>User: ${account.email}</li>
          <li>Password: ${password}</li>  <!-- CRITICAL! -->
        </ul>
      </body>
    </html>`;
}
```

**Vulnerability:**
- Password visible in plaintext
- Email is unencrypted transport (SMTP)
- Can be accidentally forwarded
- Violates security best practices

**Recommended Fix:**
```typescript
public async sendAccountConfirmation(account: Account) {
  const resetToken = await this.authService.registerToken({
    account: account._id,
    type: 'password-reset',
    exp: Date.now() + 24 * 60 * 60 * 1000
  });

  const resetLink = `${this.marketPlaceUrl}/set-password?token=${resetToken}`;

  const template = `
    <html>
      <body>
        <h1>Welcome to FuturaTickets</h1>
        <p>Your account has been created successfully.</p>
        <p>Click the link below to set your password:</p>
        <a href="${resetLink}">Set Your Password</a>
        <p>This link expires in 24 hours.</p>
      </body>
    </html>`;
}
```

**Effort:** 1 day
**Priority:** P0 - Must fix before production

---

### 🔴 CRITICAL-3: Account Guard Without Token Verification

**Severity:** CRITICAL
**Impact:** Authentication bypass possible
**Affected Files:** `futura-tickets-admin-api/src/Auth/guards/account.guard.ts:14`

**Current Implementation:**
```typescript
public async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const token = request.headers.authorization.slice(7);
  const decodedToken = await this.authService.decodeToken(token);

  if (decodedToken.email == request.body.email) return true;
  return false;
}
```

**Issues:**
1. **No try-catch** - Will crash if token is invalid or header missing
2. **Loose equality (==)** instead of (===)
3. **No token verification** - Uses unsigned `decode()` instead of `verify()`
4. **No signature check** - Attacker can forge tokens
5. **No authorization** - Only checks email matching

**Recommended Fix:**
```typescript
@Injectable()
export class AccountGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Extract token from header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid authorization header');
      }

      const token = authHeader.slice(7);

      // CRITICAL: Use verify() NOT decode()
      const verifiedToken = await this.authService.verifyToken(token);

      // Attach user to request
      request.user = verifiedToken;

      // Check email match with strict equality
      if (verifiedToken.email !== request.body.email) {
        throw new UnauthorizedException('Email mismatch');
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

**Required Auth Service Update:**
```typescript
// Add to auth.service.ts
public async verifyToken(token: string): Promise<any> {
  try {
    return this.jwtService.verify(token); // This checks signature!
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
```

**Effort:** 1 day
**Priority:** P0 - Must fix before production

---

### 🔴 CRITICAL-4: Secrets Committed to Git Repository

**Severity:** CRITICAL
**Impact:** Private keys, database credentials exposed
**Affected Files:** Multiple `.env` files

**Evidence:**
```bash
# Files containing secrets in repository
./futura-tickets-admin-api/.env
./futura-access-api/.env
./futura-market-place-api/.env
./futura-tickets-contracts-v2/.env
```

**Vulnerability:**
- Anyone with repository access can see secrets
- Secrets visible in git history
- Cannot rotate secrets without breaking deployments
- Violates least privilege principle

**Recommended Fix:**

**Step 1: Remove from repository**
```bash
# Add to .gitignore
echo "*.env" >> .gitignore
echo "*.env.local" >> .gitignore
echo "*.env.*.local" >> .gitignore
echo ".env.development" >> .gitignore
echo ".env.production" >> .gitignore

git add .gitignore
git commit -m "chore: add .env files to .gitignore"
```

**Step 2: Remove from git history**
```bash
# WARNING: This rewrites history
git filter-branch --tree-filter 'rm -f */.env' --prune-empty HEAD
git push origin --force
```

**Step 3: Rotate all secrets**
- Generate new JWT_SECRET_KEY
- Generate new database passwords
- Generate new API keys
- Update production environment variables

**Effort:** 2 days (includes secret rotation)
**Priority:** P0 - Must fix immediately

---

### 🔴 CRITICAL-5: No Error Handling in Guards

**Severity:** CRITICAL
**Impact:** Server crashes on malformed requests
**Affected Files:** All `*.guard.ts` files

**Issue:** No try-catch blocks mean invalid tokens crash the server

**Recommended Fix:** See CRITICAL-3 for proper error handling

**Effort:** Included in CRITICAL-3
**Priority:** P0

---

## High Severity Issues

### 🟠 HIGH-1: Token Passed in URL Query Parameters

**Severity:** HIGH
**Impact:** Tokens logged in server logs and browser history
**Affected Files:** `futura-tickets-admin-api/src/Mail/mail.service.ts` (multiple locations)

**Current Implementation:**
```typescript
<a href="${this.marketPlaceUrl}/account?token=${registerToken}">Check Tickets</a>
```

**Issues:**
- Token visible in server access logs
- Token visible in browser history
- Token can be shared accidentally
- Violates OAuth best practices

**Recommended Fix:**
```typescript
// Option 1: Use POST with token in body
<a href="${this.marketPlaceUrl}/verify-account">Verify Account</a>
// Then prompt user to paste token from email

// Option 2: Use Authorization header consistently
// Send token in separate, secure channel
```

**Effort:** 1 day
**Priority:** P1

---

### 🟠 HIGH-2: Google OAuth Client ID Hardcoded

**Severity:** HIGH
**Impact:** OAuth credentials exposed in source code
**Affected Files:** `futura-market-place-v2/app/layout.tsx:30`

**Current Implementation:**
```typescript
<GoogleOAuthProvider clientId="15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com">
```

**Recommended Fix:**
```typescript
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
```

**Effort:** 30 minutes
**Priority:** P1

---

### 🟠 HIGH-3: Hardcoded Localhost URL

**Severity:** HIGH
**Impact:** Production emails contain localhost links
**Affected Files:** `futura-tickets-admin-api/src/Mail/mail.service.ts:1505`

**Current Implementation:**
```typescript
<a href="http://localhost:3002/">Verify account</a>
```

**Recommended Fix:**
```typescript
<a href="${this.marketPlaceUrl}/verify-account">Verify account</a>
```

**Effort:** 15 minutes
**Priority:** P1

---

### 🟠 HIGH-4: No HTTPS Enforcement

**Severity:** HIGH
**Impact:** Man-in-the-middle attacks possible
**Affected Components:** All APIs

**Missing:**
- HSTS (HTTP Strict Transport Security) headers
- Automatic HTTP → HTTPS redirect
- Certificate pinning

**Recommended Fix:**
```typescript
// Add to main.ts
import helmet from 'helmet';

app.use(helmet.hsts({
  maxAge: 31536000, // 1 year in seconds
  includeSubDomains: true,
  preload: true
}));
```

**Effort:** 1 day
**Priority:** P1

---

### 🟠 HIGH-5: Missing Security Headers

**Severity:** HIGH
**Impact:** XSS, clickjacking vulnerabilities
**Affected Components:** Backend APIs

**Missing Headers:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy

**Recommended Fix:**
```typescript
import { NestFactory } from '@nestjs/core';
import helmet from '@nestjs/helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  await app.listen(3000);
}
```

**Effort:** 1 day
**Priority:** P1

---

## Medium Severity Issues

### 🟡 MEDIUM-1: Weak Password Requirements

**Severity:** MEDIUM
**Current:** Minimum 6 characters
**Recommended:** Minimum 12 characters with complexity

**Fix:**
```typescript
import { IsStrongPassword } from 'class-validator';

export class CreateAccountDto {
  @IsStrongPassword({
    minLength: 12,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  }, {
    message: 'Password must be at least 12 characters with uppercase, lowercase, number, and symbol'
  })
  password: string;
}
```

**Effort:** 2 hours
**Priority:** P2

---

### 🟡 MEDIUM-2: No Brute-Force Protection on Login

**Severity:** MEDIUM
**Impact:** Account takeover via brute force

**Recommended Fix:**
```typescript
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('accounts')
export class AccountsController {
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60) // 5 attempts per 60 seconds per IP
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}
```

**Effort:** 1 day
**Priority:** P2

---

### 🟡 MEDIUM-3: In-Memory Rate Limiting (Frontend)

**Severity:** MEDIUM
**Impact:** Doesn't work with load balancers

**Current:** Memory-based in Next.js middleware
**Recommended:** Redis-based rate limiting

**Effort:** 2 days
**Priority:** P2

---

### 🟡 MEDIUM-4: Sensitive Data in Console Logs

**Severity:** MEDIUM
**Files:** Multiple frontend files

**Current:**
```typescript
.catch((err) => console.log(err))
```

**Fix:**
```typescript
.catch((err) => {
  logger.error('Operation failed', {
    error: err.message,
    // Don't log full error object (may contain tokens)
  });
})
```

**Effort:** 1 day
**Priority:** P2

---

### 🟡 MEDIUM-5: No Helmet.js Integration

**Severity:** MEDIUM
**Impact:** Missing automatic security headers

**Fix:**
```bash
npm install @nestjs/helmet helmet
```

```typescript
import helmet from '@nestjs/helmet';

@Module({
  imports: [helmet()]
})
export class AppModule {}
```

**Effort:** 1 day
**Priority:** P2

---

## Low Severity Issues

### 🟢 LOW-1: Session Storage for Checkout

**Severity:** LOW
**Impact:** Data lost when opening new tab

**Current:**
```typescript
sessionStorage.setItem('futura-payment-id', paymentId);
```

**Recommended:** Server-side session storage

**Effort:** 2 days
**Priority:** P3

---

## Positive Security Findings ✅

### What's Working Well

1. **CORS Configuration** ✅
   - Environment-based whitelist
   - Proper credentials handling
   - Good origin validation

2. **Input Validation** ✅
   - class-validator DTOs implemented
   - ValidationPipe enabled globally
   - Good coverage of inputs

3. **Rate Limiting (Backend)** ✅
   - @nestjs/throttler configured
   - Environment-based limits
   - Proper TTL settings

4. **Password Hashing** ✅
   - bcryptjs used correctly
   - Passwords never stored in plaintext (except email issue)
   - Salt rounds appropriate

5. **Environment Variables** ✅
   - Good .env.example template
   - Clear categorization
   - Documentation included

---

## Remediation Roadmap

### Phase 1: Critical Fixes (Week 1) - MUST FIX BEFORE PRODUCTION

**Days 1-2:**
- [ ] Migrate JWT tokens from localStorage to httpOnly cookies
- [ ] Fix AccountGuard to use verify() instead of decode()
- [ ] Add proper error handling to all guards

**Days 3-4:**
- [ ] Remove .env files from git repository
- [ ] Rotate all secrets (JWT keys, database passwords, API keys)
- [ ] Update production environment variables

**Day 5:**
- [ ] Remove password from email, implement password reset flow
- [ ] Fix hardcoded localhost URL
- [ ] Move Google Client ID to environment variable

---

### Phase 2: High Severity Fixes (Week 2)

**Days 6-7:**
- [ ] Add Helmet.js to all backend APIs
- [ ] Implement HSTS headers
- [ ] Add missing security headers
- [ ] Fix token-in-URL issue (use POST body)

**Days 8-9:**
- [ ] Implement login rate limiting per account
- [ ] Add account lockout after failed attempts
- [ ] Test brute-force protection

---

### Phase 3: Medium Severity Fixes (Week 3)

**Days 10-11:**
- [ ] Strengthen password requirements (12+ chars)
- [ ] Implement structured logging (remove console.log)
- [ ] Add Redis for distributed rate limiting
- [ ] Audit and remove sensitive data from logs

---

## Testing Checklist

### Manual Security Testing

- [ ] Test localStorage to cookie migration
- [ ] Verify tokens expire correctly
- [ ] Test CSRF protection
- [ ] Test CORS policies
- [ ] Test rate limiting (multiple IPs)
- [ ] Test password reset flow
- [ ] Test account lockout
- [ ] Verify security headers present
- [ ] Test token verification in guards

### Automated Security Testing

```bash
# Dependency audit
npm audit
npm audit fix --force

# Find secrets in code
npx detect-secrets scan

# Check for common vulnerabilities
npx snyk test
```

---

## Compliance Status

### OWASP Top 10 (2021)

| Category | Status | Severity |
|----------|--------|----------|
| A01: Broken Access Control | ⚠️ Issues Found | HIGH |
| A02: Cryptographic Failures | 🔴 Critical Issues | CRITICAL |
| A03: Injection | ✅ Protected | LOW |
| A04: Insecure Design | ⚠️ Issues Found | MEDIUM |
| A05: Security Misconfiguration | 🔴 Critical Issues | CRITICAL |
| A06: Vulnerable Components | ⚠️ Needs Audit | UNKNOWN |
| A07: Authentication Failures | 🔴 Critical Issues | CRITICAL |
| A08: Software/Data Integrity | ✅ Good | LOW |
| A09: Logging/Monitoring | ⚠️ Issues Found | HIGH |
| A10: SSRF | ✅ Protected | LOW |

### GDPR Compliance

- ⚠️ Personal data may be in logs
- ✅ Password storage secure (bcryptjs)
- ❌ Data retention policy not documented
- ❌ Right to be forgotten not implemented

---

## Cost-Benefit Analysis

### Cost of NOT Fixing

**Potential Impacts:**
- Account takeovers via XSS (CRITICAL-1)
- Password exposure (CRITICAL-2)
- Authentication bypass (CRITICAL-3)
- Credential theft from git (CRITICAL-4)
- Reputational damage
- Legal liability (GDPR violations)
- Loss of customer trust

**Estimated Business Impact:** €50,000 - €500,000 per incident

### Cost of Fixing

**Development Time:** 8-11 days (2 developers)
**Development Cost:** ~€8,000 - €11,000 (at €100/hour)

**ROI:** Infinite (prevents catastrophic losses)

---

## Detailed File Locations

### Critical Files Requiring Changes

| Priority | File | Line | Issue |
|----------|------|------|-------|
| P0 | `futura-tickets-admin/shared/services/auth.service.ts` | 43 | localStorage token |
| P0 | `futura-market-place-v2/app/shared/services/services.tsx` | 43 | localStorage token |
| P0 | `futura-tickets-admin-api/src/Mail/mail.service.ts` | 1420 | Password in email |
| P0 | `futura-tickets-admin-api/src/Auth/guards/account.guard.ts` | 14 | No token verification |
| P0 | `*/.env` | - | Secrets in git |
| P1 | `futura-market-place-v2/app/layout.tsx` | 30 | Hardcoded client ID |
| P1 | `futura-tickets-admin-api/src/Mail/mail.service.ts` | 1505 | Hardcoded localhost |
| P1 | `futura-tickets-admin-api/src/main.ts` | - | Missing HSTS |
| P1 | All `main.ts` | - | Missing Helmet |
| P2 | DTOs | - | Weak password |

---

## Conclusion

**Overall Assessment:** The FuturaTickets platform has a **HIGH RISK** security posture with **5 CRITICAL** vulnerabilities that must be addressed before production deployment.

**Key Strengths:**
- Good CORS configuration
- Input validation implemented
- Backend rate limiting configured
- Secure password hashing

**Critical Weaknesses:**
- JWT tokens in localStorage (XSS vulnerability)
- Password in plaintext emails
- Authentication guard without signature verification
- Secrets committed to git repository
- Missing security headers

**Recommendation:** **DO NOT DEPLOY TO PRODUCTION** until all CRITICAL (P0) and HIGH (P1) severity issues are resolved.

**Estimated Timeline:** 2-3 weeks for complete remediation

**Next Steps:**
1. Begin Phase 1 critical fixes immediately
2. Rotate all secrets after removal from git
3. Implement comprehensive security testing
4. Re-audit after fixes implemented
5. Penetration testing before production launch

---

**Report Generated:** 2025-10-18
**Next Audit Due:** After remediation (2025-11-08)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
