# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

---

## Known Security Vulnerabilities

**Last Updated:** 2025-10-17

### Summary

- **Total Vulnerabilities:** 73
- **Critical:** 2
- **High:** 45
- **Moderate:** 12
- **Low:** 14

---

## Critical Vulnerabilities (🚨 IMMEDIATE ACTION REQUIRED)

### 1. Elliptic (Cryptographic Library)
- **Package:** `elliptic@<=6.6.0`
- **CVEs:**
  - GHSA-f7q4-pwc6-w24p (EDDSA missing signature length check)
  - GHSA-977x-g7h5-7qgw (ECDSA missing check for leading bit)
  - GHSA-49q7-c7j4-3p7m (BER-encoded signatures)
- **Impact:** Cryptographic signature validation bypass
- **Affected:** blockchain operations, wallet signing
- **Fix:** Update to `elliptic@6.6.1+` or migrate to modern alternatives
- **Status:** 🔴 Pending review

### 2. Next.js (Multiple CVEs)
- **Package:** `next@15.0.0-canary.0 - 15.4.6`
- **CVEs:**
  - GHSA-7m27-7ghc-44w9 (DoS with Server Actions)
  - GHSA-3h52-269p-cp9r (Information exposure in dev server)
  - GHSA-r2fc-ccr8-96c4 (Cache poisoning - missing Vary header)
  - GHSA-g5qg-72qw-gw5v (Cache Key Confusion for Image Optimization)
  - GHSA-xv57-4mr9-wg8v (Content Injection for Image Optimization)
  - GHSA-4342-x723-ch2f (Improper Middleware Redirect - SSRF)
  - GHSA-qpjv-v59x-3qc4 (Race Condition to Cache Poisoning)
  - GHSA-f82v-jwr5-mffw (Authorization Bypass in Middleware)
- **Impact:** DoS, SSRF, Cache Poisoning, Auth Bypass
- **Affected:** `futura-market-place-v2`, `futura-tickets-admin`, `futura-tickets-event`
- **Fix:** `npm install next@15.5.6`
- **Status:** 🟡 Testing required

---

## High Severity Vulnerabilities (⚠️ HIGH PRIORITY)

### 1. @nestjs/common (Remote Code Execution)
- **Package:** `@nestjs/common@<10.4.16`
- **CVE:** GHSA-cj7v-w2c7-cp7c
- **Impact:** RCE via Content-Type header
- **Affected:** All NestJS APIs
- **Fix:** `npm install @nestjs/common@11.1.6` (breaking change)
- **Status:** 🟡 Requires testing

### 2. path-to-regexp (ReDoS)
- **Package:** `path-to-regexp@<=0.1.11 || 0.2.0 - 1.8.0 || 2.0.0 - 3.2.0`
- **CVE:** GHSA-9wv6-86v2-598j, GHSA-rhx6-c78j-4q9w
- **Impact:** Regular Expression Denial of Service
- **Affected:** Express routes in all APIs
- **Fix:** Update via `@nestjs/core@11.1.6`
- **Status:** 🟡 Requires testing

### 3. multer (Denial of Service)
- **Package:** `multer@1.4.4-lts.1 - 2.0.1`
- **CVE:**
  - GHSA-4pg4-qvpc-4q3h (DoS from maliciously crafted requests)
  - GHSA-g5hg-p3ph-g8qg (DoS via unhandled exception)
  - GHSA-fjgf-rc76-4x9p (DoS from malformed request)
- **Impact:** Service disruption on file upload endpoints
- **Affected:** `futura-access-api`, `futura-tickets-admin-api`
- **Fix:** `npm install multer@latest`
- **Status:** 🟡 Requires testing

### 4. body-parser (Denial of Service)
- **Package:** `body-parser@<1.20.3`
- **CVE:** GHSA-qwcr-r2fm-qrc7
- **Impact:** DoS when URL encoding enabled
- **Affected:** All Express-based APIs
- **Fix:** Update via `@nestjs/platform-express@11.1.6`
- **Status:** 🟡 Requires testing

### 5. cookie (Security Bypass)
- **Package:** `cookie@<0.7.0`
- **CVE:** GHSA-pxg6-pf52-xh8x
- **Impact:** Cookie validation bypass with out-of-bounds characters
- **Affected:** Session management, authentication
- **Fix:** Update parent packages (hardhat, @sentry/node, engine.io)
- **Status:** 🔴 Complex dependency tree

### 6. axios (SSRF, CSRF, DoS)
- **Package:** `axios@<=0.30.1`
- **CVE:**
  - GHSA-wf5p-g6vw-rhxx (CSRF vulnerability)
  - GHSA-jr5f-v2jv-69x6 (SSRF via absolute URL)
  - GHSA-4hjh-wcwx-xvwj (DoS via lack of data size check)
- **Impact:** SSRF attacks, CSRF, service disruption
- **Affected:** HTTP clients in all services
- **Fix:** No direct fix (used by hardhat-deploy)
- **Status:** 🔴 Awaiting upstream update

---

## Moderate Severity Vulnerabilities

### 1. nodemailer (Domain Confusion)
- **Package:** `nodemailer@<7.0.7`
- **CVE:** GHSA-mm7p-fcc7-pg87
- **Impact:** Email sent to unintended domain
- **Fix:** Update via `@nestjs-modules/mailer@2.0.1` (breaking)

### 2. validator.js (URL Validation Bypass)
- **Package:** `validator@*`
- **CVE:** GHSA-9965-vmph-33xx
- **Impact:** URL validation bypass in isURL()
- **Fix:** No fix available yet
- **Workaround:** Custom validation logic

### 3. webpack (XSS via DOM Clobbering)
- **Package:** `webpack@5.0.0-alpha.0 - 5.93.0`
- **CVE:** GHSA-4vvj-4cpr-p986
- **Impact:** XSS via AutoPublicPathRuntimeModule
- **Fix:** Update via `@nestjs/cli@11.0.10` (breaking)

---

## Remediation Plan

### Phase 1: Safe Updates (Week 1)
✅ **COMPLETED**
```bash
npm audit fix --legacy-peer-deps
```
- Reduced vulnerabilities: 74 → 73
- No breaking changes

### Phase 2: Non-Breaking Updates (Week 2-3)
🟡 **IN PROGRESS**
```bash
npm update multer
npm update nodemailer
npm audit fix
```

### Phase 3: Breaking Changes - Backend (Week 4-5)
🔴 **PLANNED**
```bash
# Update NestJS ecosystem
npm install @nestjs/common@latest @nestjs/core@latest --legacy-peer-deps
npm install @nestjs/platform-express@latest --legacy-peer-deps

# Run full test suite
npm test
npm run test:e2e
```

**Testing Requirements:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E smoke tests pass
- [ ] Manual testing in staging environment
- [ ] Performance testing (no regression)

### Phase 4: Breaking Changes - Frontend (Week 6-7)
🔴 **PLANNED**
```bash
# Update Next.js
npm install next@15.5.6 --workspace=futura-market-place-v2
npm install next@15.5.6 --workspace=futura-tickets-admin
npm install next@15.5.6 --workspace=futura-tickets-event

# Test builds
npm run build --workspaces
```

**Testing Requirements:**
- [ ] Development server works
- [ ] Production builds succeed
- [ ] All pages render correctly
- [ ] No client-side errors
- [ ] Performance metrics maintained

### Phase 5: Dependency Resolution (Week 8+)
🔴 **BLOCKED**
- **axios:** Waiting for hardhat-deploy update
- **cookie:** Requires updating hardhat, @sentry/node, engine.io
- **validator.js:** No upstream fix available

---

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` files (gitignored)
   - Use secret management tools (Vault, AWS Secrets Manager)
   - Rotate credentials regularly

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm outdated
   npm update
   ```

3. **Review security advisories**
   - GitHub Dependabot alerts
   - npm security advisories
   - CVE databases

4. **Use security linters**
   ```bash
   npm install --save-dev eslint-plugin-security
   ```

### For DevOps

1. **Enable GitHub Security Features**
   - Dependabot alerts
   - Dependabot security updates
   - Code scanning (CodeQL)
   - Secret scanning

2. **Implement CI/CD Security Checks**
   ```yaml
   - name: Security Audit
     run: npm audit --audit-level=high
   ```

3. **Monitor production**
   - Error tracking (Sentry)
   - Log aggregation
   - Intrusion detection

---

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email: security@futuratickets.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Response Time:**
- Acknowledgment: Within 48 hours
- Initial assessment: Within 1 week
- Fix timeline: Depends on severity

---

## Security Contact

- **Email:** security@futuratickets.com
- **PGP Key:** Available upon request

---

## Changelog

| Date | Action | Impact |
|------|--------|--------|
| 2025-10-17 | Initial security audit | 73 vulnerabilities documented |
| 2025-10-17 | Applied safe fixes (`npm audit fix`) | 74 → 73 vulnerabilities |

---

**Note:** This document is updated regularly. Last audit: 2025-10-17
