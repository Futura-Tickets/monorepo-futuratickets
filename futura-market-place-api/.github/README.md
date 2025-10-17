# GitHub Actions CI/CD Documentation - Marketplace API

This directory contains GitHub Actions workflows for **Futura Tickets Marketplace API** - Continuous Integration, Deployment, and Security Scanning.

## Table of Contents

- [Workflows Overview](#workflows-overview)
- [Required Secrets](#required-secrets)
- [Required Variables](#required-variables)
- [Workflow Details](#workflow-details)
- [How to Use](#how-to-use)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)

---

## Workflows Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI Pipeline** | `ci.yml` | Push, PR | Lint, test, build, type-check |
| **Deploy Staging** | `deploy-staging.yml` | PR to main/develop | Deploy to staging environment |
| **Deploy Production** | `deploy-production.yml` | Push to main | Deploy to production |
| **Security Scan** | `security-scan.yml` | Daily, Push, PR | Security vulnerability scanning |

---

## Required Secrets

Configure these secrets in **Settings → Secrets and variables → Actions → Repository secrets**:

### MongoDB
```
STAGING_MARKETPLACE_MONGO_URL       # MongoDB connection string for staging
PROD_MARKETPLACE_MONGO_URL          # MongoDB connection string for production
```

### JWT Authentication
```
STAGING_MARKETPLACE_JWT_SECRET      # JWT secret for staging environment
PROD_MARKETPLACE_JWT_SECRET         # JWT secret for production
```

### Marketplace API Keys
```
STAGING_MARKETPLACE_API_KEY         # API key for staging
PROD_MARKETPLACE_API_KEY            # API key for production
```

### Cloud Provider (Choose ONE)

#### Azure
```
AZURE_CREDENTIALS             # Service principal credentials JSON
```

Format:
```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx"
}
```

#### AWS
```
AWS_ACCESS_KEY_ID             # AWS access key
AWS_SECRET_ACCESS_KEY         # AWS secret key
```

#### Kubernetes
```
KUBE_CONFIG                   # Kubeconfig file for staging
KUBE_CONFIG_PROD              # Kubeconfig file for production
```

### Docker Registry
```
GITHUB_TOKEN                  # Auto-provided by GitHub Actions
```

### Code Quality (Optional)
```
CODECOV_TOKEN                 # For code coverage reports
SONAR_TOKEN                   # For SonarCloud scanning
```

### Security Scanning (Optional)
```
SNYK_TOKEN                    # Snyk vulnerability scanning
GITGUARDIAN_API_KEY           # Secret scanning
GITLEAKS_LICENSE              # Gitleaks scanning
```

### Notifications (Optional)
```
SLACK_WEBHOOK                 # Slack notifications
SLACK_WEBHOOK_SECURITY        # Security-specific Slack channel
EMAIL_USERNAME                # SMTP username
EMAIL_PASSWORD                # SMTP password
```

### Testing
```
STAGING_TEST_MARKETPLACE_EMAIL      # Test admin user for smoke tests
STAGING_TEST_MARKETPLACE_PASSWORD   # Test admin password
```

---

## Required Variables

Configure these in **Settings → Secrets and variables → Actions → Variables**:

### Cloud Provider
```
CLOUD_PROVIDER                # Options: azure | aws | kubernetes | digitalocean
```

### Azure (if using Azure)
```
AZURE_RESOURCE_GROUP          # Resource group name
```

### AWS (if using AWS)
```
AWS_REGION                    # e.g., us-east-1
```

### Rate Limiting
```
THROTTLE_TTL                  # Time to live in ms (e.g., 60000)
THROTTLE_LIMIT                # Max requests per TTL (e.g., 100)
```

---

## Workflow Details

### 1. CI Pipeline (`ci.yml`)

**Trigger:** Every push and pull request

**Jobs:**
1. **Lint** - ESLint + Prettier format check
2. **Test** - Unit tests + E2E tests on Node 18 & 20
3. **Build** - Production build validation
4. **TypeCheck** - TypeScript compilation check
5. **Audit** - npm audit for vulnerabilities
6. **Docker** - Docker image build test (PR/main only)
7. **Quality** - SonarCloud scan (if configured)
8. **Summary** - Aggregate results

**Success Criteria:**
- All lint errors fixed
- 70% test coverage minimum
- Build produces valid dist/
- No TypeScript errors
- No critical/high vulnerabilities

**Artifacts:**
- Code coverage reports (7 days)
- Build artifacts (7 days)
- Lint results (on failure)

---

### 2. Deploy Staging (`deploy-staging.yml`)

**Trigger:** Pull requests to main/develop

**Process:**
1. **Build** Docker image with PR tag
2. **Push** to GitHub Container Registry
3. **Deploy** to staging environment
4. **Health Check** (10 attempts)
5. **Smoke Tests** (critical endpoints)
6. **Comment** on PR with deployment details

**Environment:** `staging`
- URL: `https://marketplace-api-staging.futuratickets.com`
- Docker tag: `pr-{number}-{sha}`

**Deployment Options:**
- Azure Container Instances
- AWS ECS
- Kubernetes
- DigitalOcean App Platform

**Features:**
- Isolated staging environment per PR
- Automatic cleanup of old deployments
- Health checks before marking success

---

### 3. Deploy Production (`deploy-production.yml`)

**Trigger:** Push to `main` branch OR manual workflow dispatch

**Process:**
1. **Pre-checks** - Lint, tests, breaking changes
2. **Build** - Docker image with version tags
3. **Deploy** - Blue-green deployment
4. **Health Check** - Extensive checks (20 attempts)
5. **Traffic Switch** - Manual approval required
6. **Monitor** - Post-deployment monitoring (10 min)
7. **Release** - Create GitHub release
8. **Cleanup** - Remove old blue environment
9. **Notify** - Slack/email notifications

**Environment:** `production`
- URL: `https://marketplace-api.futuratickets.com`
- Docker tags:
  - `v{version}` (e.g., v1.2.3)
  - `{major}.{minor}` (e.g., 1.2)
  - `{major}` (e.g., 1)
  - `{sha}`
  - `latest`

**Safety Features:**
- Manual approval before traffic switch
- Blue-green deployment (zero downtime)
- Automatic rollback on health check failure
- Post-deployment monitoring
- SBOM generation

**Manual Workflow Inputs:**
- `skip_tests` (boolean) - Skip pre-deployment tests

---

### 4. Security Scan (`security-scan.yml`)

**Trigger:**
- Daily at 2 AM UTC (cron)
- Push to main
- Pull requests
- Manual dispatch

**Scans Performed:**

1. **Dependency Scan**
   - npm audit
   - Snyk (if configured)
   - OWASP Dependency Check

2. **Code Scan (SAST)**
   - GitHub CodeQL
   - ESLint security rules
   - Semgrep

3. **Secret Scan**
   - GitGuardian
   - Gitleaks
   - TruffleHog

4. **Docker Image Scan**
   - Trivy
   - Grype
   - Docker Scout

5. **License Compliance**
   - Forbidden licenses: GPL, AGPL, LGPL

6. **Security Headers**
   - X-Content-Type-Options
   - X-Frame-Options
   - Strict-Transport-Security

**Actions on Failure:**
- Create GitHub issue
- Send Slack alert
- Upload detailed reports

---

## How to Use

### First-Time Setup

1. **Configure Secrets**
   ```bash
   # Go to repository Settings
   # Navigate to Secrets and variables → Actions
   # Click "New repository secret"
   # Add all required secrets from the list above
   ```

2. **Configure Variables**
   ```bash
   # In the same section, switch to "Variables" tab
   # Click "New repository variable"
   # Set CLOUD_PROVIDER and other variables
   ```

3. **Test CI Pipeline**
   ```bash
   git checkout -b test/ci-pipeline
   git commit --allow-empty -m "test: trigger CI"
   git push origin test/ci-pipeline
   ```

4. **Create Test PR**
   ```bash
   # Create PR on GitHub
   # This will trigger staging deployment
   ```

### Daily Development

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   # Make changes
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

2. **Open Pull Request**
   - CI pipeline runs automatically
   - Staging deployment triggered
   - Review deployment comment on PR

3. **Merge to Main**
   - Production deployment triggered
   - Manual approval required for traffic switch

### Manual Production Deploy

```bash
# Go to Actions tab
# Select "Deploy to Production - Marketplace API"
# Click "Run workflow"
# Choose options (skip_tests: false recommended)
# Click "Run workflow"
```

---

## Deployment Process

### Staging Deployment Flow

```
PR Created/Updated
    ↓
CI Pipeline (required checks)
    ↓
Build Docker Image
    ↓
Push to ghcr.io
    ↓
Deploy to Staging (Azure/AWS/K8s)
    ↓
Health Check (10 attempts, 10s interval)
    ↓
Smoke Tests
    ↓
Comment on PR ✅
```

### Production Deployment Flow

```
Push to main
    ↓
Pre-Deployment Checks
  - Lint
  - Tests
  - Security Audit
    ↓
Build & Tag Docker Image
  - v{version}
  - latest
  - {sha}
    ↓
Deploy to Green Environment
    ↓
Health Check (20 attempts, 15s interval)
    ↓
Smoke Tests
    ↓
🚦 MANUAL APPROVAL REQUIRED 🚦
    ↓
Switch Traffic (Blue → Green)
    ↓
Monitor (10 minutes)
    ↓
Create GitHub Release
    ↓
Cleanup Blue Environment
    ↓
Send Notifications ✅
```

---

## Troubleshooting

### CI Pipeline Failing

**Lint Errors**
```bash
# Run locally to fix
npm run lint
npm run lint -- --fix

# Format code
npm run format
```

**Test Failures**
```bash
# Run tests locally
npm test

# With coverage
npm test -- --coverage

# Specific test file
npm test -- path/to/test.spec.ts
```

**Build Errors**
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

**TypeScript Errors**
```bash
# Check types
npx tsc --noEmit
```

### Deployment Failing

**Health Check Timeout**
- Check application logs in cloud provider
- Verify environment variables are set correctly
- Check MongoDB connection
- Ensure container has enough memory/CPU

**Docker Build Failed**
```bash
# Test Docker build locally
docker build -t marketplace-api:test .
docker run -p 3000:3000 marketplace-api:test
```

**Authentication Errors**
- Verify AZURE_CREDENTIALS / AWS credentials
- Check GITHUB_TOKEN has packages:write permission
- Verify KUBE_CONFIG is valid

### Security Scan Failing

**High/Critical Vulnerabilities**
```bash
# Check locally
npm audit

# Fix automatically (if possible)
npm audit fix

# Force fix (may break)
npm audit fix --force

# Update specific package
npm update package-name
```

**Secret Detected**
- Rotate the exposed secret immediately
- Update GitHub secrets
- Review commit history
- Consider using GitHub secret scanning

---

## Best Practices

### Commit Messages
Follow conventional commits:
```
feat: add new feature
fix: bug fix
docs: documentation changes
test: add tests
refactor: code refactoring
chore: maintenance tasks
```

### Versioning
Follow semantic versioning (semver):
```
MAJOR.MINOR.PATCH
  1    .2   .3

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

### Branching Strategy
```
main          → Production (protected)
develop       → Staging (protected)
feature/*     → New features
bugfix/*      → Bug fixes
hotfix/*      → Emergency fixes
```

### PR Requirements
- ✅ All CI checks pass
- ✅ Code review approved
- ✅ Tests added/updated
- ✅ Documentation updated
- ✅ No merge conflicts

---

## Monitoring & Alerts

### Workflow Status
- **GitHub Actions Tab** - View all workflow runs
- **PR Checks** - See required checks on PR
- **Slack Notifications** - Receive alerts (if configured)

### Application Monitoring
After deployment:
- Check application logs
- Monitor error rates
- Verify metrics dashboards
- Test critical user flows

---

## Support

For issues with workflows:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Contact DevOps team
4. Create issue in repository

---

## Changelog

### 2025-10-13
- Initial workflow setup
- CI pipeline with lint, test, build
- Staging and production deployment
- Security scanning
- Documentation created

---

**Maintained by:** DevOps Team
**Last Updated:** 2025-10-13
