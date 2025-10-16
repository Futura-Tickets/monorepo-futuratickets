# GitHub Setup Guide - FuturaTickets

Esta guía proporciona los pasos necesarios para configurar branch protection rules, CI/CD pipelines y configuraciones de GitHub para el monorepo de FuturaTickets.

## Índice

1. [Branch Protection Rules](#branch-protection-rules)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Environment Setup](#environment-setup)
4. [Secrets Configuration](#secrets-configuration)
5. [Team & Access Management](#team--access-management)
6. [PR Templates](#pr-templates)

---

## Branch Protection Rules

### Configurar desde GitHub UI

Ve a: **Settings → Branches → Add branch protection rule**

### Rule para `main` (Producción)

```yaml
Branch name pattern: main

Protections:
  ✅ Require a pull request before merging
    ✅ Require approvals: 2
    ✅ Dismiss stale pull request approvals when new commits are pushed
    ✅ Require review from Code Owners
    ✅ Require approval of the most recent reviewable push

  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    Status checks:
      - lint
      - test-unit
      - test-integration
      - test-e2e
      - security-scan
      - build-production

  ✅ Require conversation resolution before merging
  ✅ Require signed commits
  ✅ Require linear history
  ✅ Include administrators
  ✅ Restrict who can push to matching branches
  ✅ Do not allow bypassing the above settings
  ❌ Allow force pushes
  ❌ Allow deletions
```

### Rule para `staging` (Pre-producción)

```yaml
Branch name pattern: staging

Protections:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ✅ Dismiss stale pull request approvals when new commits are pushed
    ✅ Require approval of the most recent reviewable push

  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    Status checks:
      - lint
      - test-unit
      - test-integration
      - build-staging

  ✅ Require conversation resolution before merging
  ✅ Require linear history
  ✅ Include administrators
  ❌ Allow force pushes
  ❌ Allow deletions
```

### Rule para `dev` (Desarrollo)

```yaml
Branch name pattern: dev

Protections:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ⚠️ Allow self-approval for team members

  ✅ Require status checks to pass before merging
    Status checks:
      - lint
      - test-unit

  ✅ Require conversation resolution before merging
  ❌ Require linear history (permite merges)
  ❌ Allow force pushes
  ❌ Allow deletions
```

### Configuración via GitHub CLI

```bash
# Install GitHub CLI si no lo tienes
brew install gh

# Login
gh auth login

# Configurar main branch protection
gh api repos/Futura-Tickets/monorepo-futuratickets/branches/main/protection \
  --method PUT \
  --input - <<EOF
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "lint",
      "test-unit",
      "test-integration",
      "test-e2e",
      "security-scan",
      "build-production"
    ]
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_signatures": true,
  "required_conversation_resolution": true,
  "restrictions": null
}
EOF
```

---

## GitHub Actions Workflows

### Estructura de Workflows

```
.github/
└── workflows/
    ├── ci-main.yml           # CI/CD for main branch
    ├── ci-staging.yml        # CI/CD for staging branch
    ├── ci-dev.yml            # CI/CD for dev branch
    ├── ci-feature.yml        # CI for feature branches
    ├── security-scan.yml     # Security scanning
    └── deploy-preview.yml    # Preview deployments
```

### 1. Main Branch Workflow

**File**: `.github/workflows/ci-main.yml`

```yaml
name: Production CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd futura-tickets-admin-api && npm ci
          cd ../futura-tickets-admin && npm ci
          cd ../futura-market-place-v2 && npm ci

      - name: Run ESLint
        run: |
          cd futura-tickets-admin-api && npm run lint
          cd ../futura-tickets-admin && npm run lint
          cd ../futura-market-place-v2 && npm run lint

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd futura-tickets-admin-api && npm ci
          cd ../futura-tickets-admin && npm ci
          cd ../futura-market-place-v2 && npm ci

      - name: Run unit tests
        run: |
          cd futura-tickets-admin-api && npm run test:unit
          cd ../futura-tickets-admin && npm run test:unit
          cd ../futura-market-place-v2 && npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: |
            futura-tickets-admin-api/coverage/coverage-final.json
            futura-tickets-admin/coverage/coverage-final.json
            futura-market-place-v2/coverage/coverage-final.json

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: cd futura-tickets-admin-api && npm ci

      - name: Run integration tests
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/futuratickets-test?authSource=admin
        run: cd futura-tickets-admin-api && npm run test:integration

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Playwright
        run: |
          cd futura-tickets-admin && npm ci
          npx playwright install --with-deps

      - name: Run E2E tests
        run: cd futura-tickets-admin && npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: futura-tickets-admin/playwright-report/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Run npm audit
        run: |
          cd futura-tickets-admin-api && npm audit --audit-level=moderate
          cd ../futura-tickets-admin && npm audit --audit-level=moderate
          cd ../futura-market-place-v2 && npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test
          args: --severity-threshold=high

  build-production:
    name: Build Production
    runs-on: ubuntu-latest
    needs: [lint, test-unit, test-integration, test-e2e, security-scan]
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd futura-tickets-admin-api && npm ci
          cd ../futura-tickets-admin && npm ci
          cd ../futura-market-place-v2 && npm ci

      - name: Build projects
        run: |
          cd futura-tickets-admin-api && npm run build
          cd ../futura-tickets-admin && npm run build
          cd ../futura-market-place-v2 && npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: production-builds
          path: |
            futura-tickets-admin-api/dist
            futura-tickets-admin/.next
            futura-market-place-v2/.next

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-production
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://futuratickets.com
    steps:
      - uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: production-builds

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to Kubernetes
        run: |
          ./scripts/deploy.sh production

      - name: Run health checks
        run: |
          ./scripts/health-check.sh production

      - name: Create release tag
        run: |
          VERSION=$(date +%Y.%m.%d)-${{ github.run_number }}
          git tag -a v$VERSION -m "Release v$VERSION"
          git push origin v$VERSION

  notify:
    name: Notify Team
    runs-on: ubuntu-latest
    needs: deploy-production
    if: always()
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Staging Branch Workflow

**File**: `.github/workflows/ci-staging.yml`

```yaml
name: Staging CI/CD

on:
  push:
    branches: [staging]
  pull_request:
    branches: [staging]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install and lint
        run: |
          cd futura-tickets-admin-api && npm ci && npm run lint
          cd ../futura-tickets-admin && npm ci && npm run lint
          cd ../futura-market-place-v2 && npm ci && npm run lint

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install and test
        run: |
          cd futura-tickets-admin-api && npm ci && npm run test:unit
          cd ../futura-tickets-admin && npm ci && npm run test:unit
          cd ../futura-market-place-v2 && npm ci && npm run test:unit

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install and test
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/futuratickets-test?authSource=admin
        run: cd futura-tickets-admin-api && npm ci && npm run test:integration

  build-staging:
    name: Build Staging
    runs-on: ubuntu-latest
    needs: [lint, test-unit, test-integration]
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Build
        run: |
          cd futura-tickets-admin-api && npm ci && npm run build
          cd ../futura-tickets-admin && npm ci && npm run build
          cd ../futura-market-place-v2 && npm ci && npm run build

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build-staging
    if: github.event_name == 'push' && github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging.futuratickets.com
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to Kubernetes
        run: ./scripts/deploy.sh staging

      - name: Smoke tests
        run: ./scripts/health-check.sh staging
```

### 3. Dev Branch Workflow

**File**: `.github/workflows/ci-dev.yml`

```yaml
name: Development CI/CD

on:
  push:
    branches: [dev]
  pull_request:
    branches: [dev]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Lint
        run: |
          cd futura-tickets-admin-api && npm ci && npm run lint
          cd ../futura-tickets-admin && npm ci && npm run lint
          cd ../futura-market-place-v2 && npm ci && npm run lint

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Test
        run: |
          cd futura-tickets-admin-api && npm ci && npm run test:unit
          cd ../futura-tickets-admin && npm ci && npm run test:unit
          cd ../futura-market-place-v2 && npm ci && npm run test:unit

  build-dev:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Build
        run: |
          cd futura-tickets-admin-api && npm ci && npm run build
          cd ../futura-tickets-admin && npm ci && npm run build
          cd ../futura-market-place-v2 && npm ci && npm run build

  deploy-dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: build-dev
    if: github.event_name == 'push' && github.ref == 'refs/heads/dev'
    environment:
      name: development
      url: https://dev.futuratickets.com
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy
        run: ./scripts/deploy.sh development
```

### 4. Feature Branch Workflow

**File**: `.github/workflows/ci-feature.yml`

```yaml
name: Feature Branch CI

on:
  pull_request:
    branches: [dev]
    types: [opened, synchronize, reopened]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Lint
        run: |
          cd futura-tickets-admin-api && npm ci && npm run lint || true
          cd ../futura-tickets-admin && npm ci && npm run lint || true
          cd ../futura-market-place-v2 && npm ci && npm run lint || true

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Test
        run: |
          cd futura-tickets-admin-api && npm ci && npm run test:unit || true
          cd ../futura-tickets-admin && npm ci && npm run test:unit || true
          cd ../futura-market-place-v2 && npm ci && npm run test:unit || true

  build-check:
    name: Build Check
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Build
        run: |
          cd futura-tickets-admin-api && npm ci && npm run build
          cd ../futura-tickets-admin && npm ci && npm run build
          cd ../futura-market-place-v2 && npm ci && npm run build
```

---

## Environment Setup

### Crear Environments en GitHub

**Settings → Environments → New environment**

#### 1. Production Environment

```yaml
Name: production

Protection rules:
  ✅ Required reviewers: 2
  ✅ Wait timer: 5 minutes
  ✅ Deployment branches: main only

Environment secrets:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - DATABASE_URL_PRODUCTION
  - JWT_SECRET_PRODUCTION
  - STRIPE_SECRET_KEY_PRODUCTION
  - ADMIN_PASSWORD_PRODUCTION

Environment variables:
  - NODE_ENV: production
  - API_URL: https://api.futuratickets.com
  - FRONTEND_URL: https://futuratickets.com
```

#### 2. Staging Environment

```yaml
Name: staging

Protection rules:
  ✅ Required reviewers: 1
  ⚠️ Wait timer: 0 minutes

Environment secrets:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - DATABASE_URL_STAGING
  - JWT_SECRET_STAGING
  - STRIPE_SECRET_KEY_STAGING
  - ADMIN_PASSWORD_STAGING

Environment variables:
  - NODE_ENV: staging
  - API_URL: https://api-staging.futuratickets.com
  - FRONTEND_URL: https://staging.futuratickets.com
```

#### 3. Development Environment

```yaml
Name: development

Protection rules:
  ❌ No restrictions

Environment secrets:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - DATABASE_URL_DEV
  - JWT_SECRET_DEV
  - STRIPE_SECRET_KEY_DEV
  - ADMIN_PASSWORD_DEV

Environment variables:
  - NODE_ENV: development
  - API_URL: https://api-dev.futuratickets.com
  - FRONTEND_URL: https://dev.futuratickets.com
```

---

## Secrets Configuration

### Repository Secrets

**Settings → Secrets and variables → Actions → New repository secret**

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Database
DATABASE_URL_PRODUCTION
DATABASE_URL_STAGING
DATABASE_URL_DEV

# JWT
JWT_SECRET_PRODUCTION
JWT_SECRET_STAGING
JWT_SECRET_DEV

# Payment Gateways
STRIPE_SECRET_KEY_PRODUCTION
STRIPE_SECRET_KEY_STAGING
STRIPE_SECRET_KEY_DEV

# Notifications
SLACK_WEBHOOK
DISCORD_WEBHOOK

# Security Scanning
SNYK_TOKEN
SONARCLOUD_TOKEN

# Docker Registry
DOCKER_USERNAME
DOCKER_PASSWORD

# Kubernetes
KUBECONFIG_PRODUCTION
KUBECONFIG_STAGING
KUBECONFIG_DEV
```

---

## Team & Access Management

### Teams Structure

```
Futura-Tickets Organization
├── @admins (Admin access)
│   ├── Full repository access
│   ├── Can bypass protection rules
│   └── Manage settings
│
├── @developers (Write access)
│   ├── Push to feature branches
│   ├── Create PRs
│   └── Review code
│
├── @qa-team (Read + specific permissions)
│   ├── View code
│   ├── Create issues
│   └── Comment on PRs
│
└── @devops (Maintain access)
    ├── Manage deployments
    ├── Configure CI/CD
    └── Manage secrets
```

### CODEOWNERS File

**File**: `.github/CODEOWNERS`

```
# Default owners for everything
* @Futura-Tickets/admins

# Backend API
/futura-tickets-admin-api/ @Futura-Tickets/backend-team @Futura-Tickets/admins

# Admin Frontend
/futura-tickets-admin/ @Futura-Tickets/frontend-team @Futura-Tickets/admins

# Marketplace
/futura-market-place-v2/ @Futura-Tickets/frontend-team @Futura-Tickets/admins

# Smart Contracts
/futura-tickets-contracts-v2/ @Futura-Tickets/blockchain-team @Futura-Tickets/admins
/futura-tickets-smartcontracts/ @Futura-Tickets/blockchain-team @Futura-Tickets/admins

# Infrastructure
/k8s/ @Futura-Tickets/devops @Futura-Tickets/admins
/scripts/ @Futura-Tickets/devops @Futura-Tickets/admins
/.github/ @Futura-Tickets/devops @Futura-Tickets/admins
/docker-compose.yml @Futura-Tickets/devops @Futura-Tickets/admins

# Documentation
/docs/ @Futura-Tickets/admins
*.md @Futura-Tickets/admins
```

---

## PR Templates

### Pull Request Template

**File**: `.github/pull_request_template.md`

```markdown
## Description

<!-- Describe your changes in detail -->

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement

## Related Issue

<!-- Link to the issue being fixed/addressed -->
Fixes #(issue number)

## Changes Made

<!-- List the specific changes made -->
-
-
-

## Testing

### How Has This Been Tested?

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

### Test Configuration

- Node version:
- Browser (if applicable):
- OS:

## Checklist

### Code Quality
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

### Deployment
- [ ] No breaking changes
- [ ] Database migrations included (if needed)
- [ ] Environment variables documented (if added/changed)
- [ ] Deployment notes added (if needed)

### Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/Authorization checked
- [ ] Dependencies audited

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Merge Target

- [ ] This PR targets the correct base branch (dev/staging/main)
- [ ] I have updated the CHANGELOG.md (for main/staging merges)

---

**For Reviewers:**
- [ ] Code quality approved
- [ ] Tests approved
- [ ] Documentation approved
- [ ] Security reviewed
```

---

## Quick Setup Commands

```bash
# 1. Create branch protection rules
gh api repos/Futura-Tickets/monorepo-futuratickets/branches/main/protection \
  --method PUT --input .github/config/branch-protection-main.json

gh api repos/Futura-Tickets/monorepo-futuratickets/branches/staging/protection \
  --method PUT --input .github/config/branch-protection-staging.json

gh api repos/Futura-Tickets/monorepo-futuratickets/branches/dev/protection \
  --method PUT --input .github/config/branch-protection-dev.json

# 2. Create environments
gh api repos/Futura-Tickets/monorepo-futuratickets/environments/production --method PUT
gh api repos/Futura-Tickets/monorepo-futuratickets/environments/staging --method PUT
gh api repos/Futura-Tickets/monorepo-futuratickets/environments/development --method PUT

# 3. Add secrets
gh secret set AWS_ACCESS_KEY_ID -b"<value>"
gh secret set AWS_SECRET_ACCESS_KEY -b"<value>"
# ... más secrets

# 4. Verify setup
gh repo view Futura-Tickets/monorepo-futuratickets
gh api repos/Futura-Tickets/monorepo-futuratickets/branches/main/protection
```

---

## References

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

**Última actualización**: 2025-10-16
**Versión**: 1.0.0
