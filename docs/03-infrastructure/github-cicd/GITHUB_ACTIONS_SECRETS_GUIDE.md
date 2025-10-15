# GitHub Actions Secrets Configuration Guide

> **🔐 Complete guide for configuring GitHub Actions secrets and variables for CI/CD pipelines**
>
> **Last Updated:** 2025-10-13
> **Repositories:** futura-tickets-admin-api, futura-market-place-api, futura-access-api

---

## 🎯 Overview

This guide provides step-by-step instructions for configuring GitHub Actions secrets and environment variables needed for the CI/CD workflows in all three FuturaTickets API repositories.

### What are GitHub Actions Secrets?

- **Secrets**: Encrypted environment variables (passwords, API keys, tokens)
- **Variables**: Non-sensitive configuration values (URLs, names)
- **Environments**: Deployment targets (staging, production) with specific secrets

---

## 📋 Prerequisites

### Repository Setup

1. **GitHub Repository Access**
   - Admin or Maintainer role required
   - Access to repository Settings

2. **Service Accounts Created**
   - Azure account with subscription
   - Google Cloud account (if using GCP)
   - Kubernetes cluster (if using K8s)
   - Docker registry account

3. **Credentials Ready**
   - Database connection strings
   - Cloud provider credentials
   - API keys (Stripe, SendGrid, etc.)
   - SSH keys or deploy tokens

---

## 🔑 Required Secrets by Environment

### Organization-Level Secrets (Shared)

**Path:** Organization Settings → Secrets and variables → Actions → New organization secret

These secrets are shared across all repositories:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DOCKER_REGISTRY_URL` | Container registry URL | e.g., `ghcr.io` or `futuratickets.azurecr.io` |
| `DOCKER_REGISTRY_USERNAME` | Registry username | Your Docker/ACR username |
| `DOCKER_REGISTRY_PASSWORD` | Registry password | Personal Access Token or ACR admin password |
| `NPM_TOKEN` | NPM registry token (if using private packages) | npm.com → Access Tokens |
| `SLACK_WEBHOOK_URL` | Slack notifications webhook | Slack → Apps → Incoming Webhooks |
| `CODECOV_TOKEN` | Code coverage reporting | codecov.io → Repository Settings |

**To create:**
1. Go to Organization Settings (https://github.com/organizations/YOUR_ORG/settings/secrets/actions)
2. Click "New organization secret"
3. Name: `DOCKER_REGISTRY_URL`
4. Value: Your registry URL
5. Repository access: Select all 3 API repos
6. Click "Add secret"
7. Repeat for all secrets

---

### Repository-Specific Secrets

**Path:** Repository → Settings → Secrets and variables → Actions → New repository secret

#### Common Secrets (All 3 APIs)

##### Database & Cache

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/futuratickets` | Production MongoDB connection |
| `MONGO_URL_STAGING` | `mongodb+srv://user:pass@cluster.mongodb.net/futuratickets-staging` | Staging MongoDB |
| `REDIS_HOST` | `redis-prod.redis.cache.windows.net` | Redis host |
| `REDIS_PORT` | `6380` | Redis port |
| `REDIS_PASSWORD` | `your_redis_password` | Redis auth |

##### Authentication

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `JWT_SECRET_KEY` | ⚠️ **MUST BE IDENTICAL ACROSS ALL APIS** | JWT signing key |

**Generate JWT secret once:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Set the SAME value in all 3 repositories!**

##### Cloud Provider (Azure)

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_CREDENTIALS` | JSON service principal | Azure login credentials |
| `AZURE_SUBSCRIPTION_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | Azure subscription |
| `AZURE_RESOURCE_GROUP` | `futura-tickets-prod` | Resource group name |
| `AZURE_CONTAINER_REGISTRY` | `futuratickets` | ACR name |
| `AZURE_STORAGE_CONNECTION_STRING` | `DefaultEndpointsProtocol=https;...` | Blob storage |
| `AZURE_WEBAPP_NAME` | `futura-admin-api` (varies per repo) | App Service name |

**Getting Azure credentials:**
```bash
# Create service principal
az ad sp create-for-rbac \
  --name "github-actions-futura" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/futura-tickets-prod \
  --sdk-auth

# Output (use this as AZURE_CREDENTIALS):
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

##### Cloud Provider (Google Cloud - Alternative)

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `futura-tickets` | GCP project |
| `GCP_SERVICE_ACCOUNT_KEY` | JSON key | Service account credentials |
| `GCP_REGION` | `europe-west1` | Deployment region |

**Getting GCP credentials:**
```bash
# Create service account
gcloud iam service-accounts create github-actions-futura

# Grant permissions
gcloud projects add-iam-policy-binding futura-tickets \
  --member="serviceAccount:github-actions-futura@futura-tickets.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-futura@futura-tickets.iam.gserviceaccount.com

# Use key.json content as GCP_SERVICE_ACCOUNT_KEY
cat key.json
```

##### Kubernetes (if using)

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `KUBE_CONFIG` | Base64 encoded kubeconfig | Kubernetes cluster access |
| `KUBE_NAMESPACE` | `futura-tickets-prod` | K8s namespace |

**Getting kubeconfig:**
```bash
# Get kubeconfig
cat ~/.kube/config | base64

# Or from Azure AKS
az aks get-credentials --resource-group futura-tickets-prod --name futura-cluster
cat ~/.kube/config | base64
```

---

#### API-Specific Secrets

##### futura-tickets-admin-api

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe live secret key |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` | Stripe live public key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing |
| `MAIL_HOST` | `smtp.sendgrid.net` | Email SMTP host |
| `MAIL_USER` | `apikey` | Email username |
| `MAIL_PASSWORD` | `SG.xxxxx` | SendGrid API key |
| `RPC_URL` | `https://polygon-mainnet.infura.io/v3/...` | Blockchain RPC |
| `PRIVATE_KEY` | `0x...` | Blockchain private key |
| `AZURE_WEB_PUBSUB_CONNECTION_STRING` | `Endpoint=https://...` | WebSocket service |

##### futura-market-place-api

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `STRIPE_PRIVATE_KEY` | `sk_live_...` | Stripe secret key |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` | Stripe public key |
| `STRIPE_ENDPOINT_SECRET` | `whsec_...` | Webhook secret |
| `MAIL_PASSWORD` | `SG.xxxxx` | Email password |
| `SOCKET_MARKET_PLACE` | `Endpoint=https://...` | WebSocket endpoint |

##### futura-access-api

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SOCKET_ACCESS` | `Endpoint=https://...` | WebSocket endpoint |

---

## 🌍 Environment-Specific Secrets

### Staging Environment

**Path:** Repository → Settings → Environments → staging → Add secret

All secrets from above, but with staging values:

| Secret | Production Value | Staging Value |
|--------|-----------------|---------------|
| `MONGO_URL` | Production cluster | Staging cluster |
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_test_...` |
| `STRIPE_PUBLIC_KEY` | `pk_live_...` | `pk_test_...` |
| `AZURE_WEBAPP_NAME` | `futura-admin-api` | `futura-admin-api-staging` |
| `RPC_URL` | Mainnet | Testnet (Mumbai) |

### Production Environment

**Path:** Repository → Settings → Environments → production → Add secret

**Protection Rules (Recommended):**
1. ✅ Required reviewers: 1-2 team members
2. ✅ Wait timer: 5 minutes
3. ✅ Deployment branches: `main` only

---

## 📝 Step-by-Step Setup

### For Each API Repository

#### Step 1: Create Environments

1. Go to repository Settings
2. Click "Environments"
3. Click "New environment"
4. Name: `staging`
5. Click "Configure environment"
6. No protection rules needed for staging
7. Click "Add environment"

Repeat for `production` with protection rules:
- ✅ Required reviewers: Select team members
- ✅ Deployment branches: `main` only

#### Step 2: Add Organization Secrets

1. Go to Organization Settings
2. Secrets and variables → Actions
3. Click "New organization secret"
4. Add each secret from "Organization-Level Secrets" section
5. Set repository access to all 3 API repos

#### Step 3: Add Repository Secrets

For **futura-tickets-admin-api**:

```bash
# Navigate to repository
https://github.com/YOUR_ORG/futura-tickets-admin-api/settings/secrets/actions

# Add each secret:
1. Click "New repository secret"
2. Name: MONGO_URL
3. Secret: mongodb+srv://...
4. Click "Add secret"

# Repeat for all secrets in the table above
```

For **futura-market-place-api**:
```bash
https://github.com/YOUR_ORG/futura-market-place-api/settings/secrets/actions
# Add all common secrets + marketplace-specific secrets
```

For **futura-access-api**:
```bash
https://github.com/YOUR_ORG/futura-access-api/settings/secrets/actions
# Add all common secrets + access-specific secrets
```

#### Step 4: Add Environment Secrets

For each environment (staging, production):

```bash
# Staging
https://github.com/YOUR_ORG/futura-tickets-admin-api/settings/environments/staging

# Click "Add secret"
# Add environment-specific values (staging MongoDB, test Stripe keys, etc.)

# Production
https://github.com/YOUR_ORG/futura-tickets-admin-api/settings/environments/production

# Click "Add secret"
# Add production values
```

#### Step 5: Add Variables (Non-Sensitive Config)

**Path:** Repository → Settings → Secrets and variables → Actions → Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NODE_VERSION` | `20` | Node.js version |
| `DOCKER_IMAGE_NAME` | `futura-admin-api` | Image name |
| `DEPLOYMENT_REGION` | `europe-west1` | Cloud region |
| `LOG_LEVEL` | `info` | Logging level |

Variables are **not encrypted** and can be viewed by anyone with repo access.

---

## ✅ Verification Checklist

### Before First Deployment

Use this checklist to verify all secrets are configured:

#### Organization Level
- [ ] `DOCKER_REGISTRY_URL` set
- [ ] `DOCKER_REGISTRY_USERNAME` set
- [ ] `DOCKER_REGISTRY_PASSWORD` set
- [ ] Organization secrets accessible by all 3 repos

#### futura-tickets-admin-api
- [ ] All common secrets added
- [ ] Stripe keys (live) added
- [ ] Email credentials added
- [ ] Blockchain RPC & private key added
- [ ] Azure/GCP credentials added
- [ ] WebSocket connection string added
- [ ] `JWT_SECRET_KEY` matches other APIs ⚠️

#### futura-market-place-api
- [ ] All common secrets added
- [ ] Stripe keys (live) added
- [ ] Email credentials added
- [ ] WebSocket connection string added
- [ ] `JWT_SECRET_KEY` matches other APIs ⚠️

#### futura-access-api
- [ ] All common secrets added
- [ ] WebSocket connection string added
- [ ] `JWT_SECRET_KEY` matches other APIs ⚠️

#### Environments
- [ ] `staging` environment created
- [ ] `production` environment created
- [ ] Production has required reviewers
- [ ] Production restricted to `main` branch
- [ ] Staging secrets use test/staging values
- [ ] Production secrets use live values

---

## 🧪 Testing Secrets

### Test in Workflow

Create a test workflow to verify secrets are accessible:

**.github/workflows/test-secrets.yml**
```yaml
name: Test Secrets

on:
  workflow_dispatch:  # Manual trigger only

jobs:
  test-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Check secrets exist
        env:
          MONGO_URL: ${{ secrets.MONGO_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_KEY }}
          STRIPE_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
        run: |
          echo "Testing secrets (lengths only, not values)..."
          echo "MONGO_URL length: ${#MONGO_URL}"
          echo "JWT_SECRET length: ${#JWT_SECRET}"
          echo "STRIPE_KEY length: ${#STRIPE_KEY}"

          # Fail if any secret is empty
          if [ -z "$MONGO_URL" ]; then echo "❌ MONGO_URL not set"; exit 1; fi
          if [ -z "$JWT_SECRET" ]; then echo "❌ JWT_SECRET_KEY not set"; exit 1; fi
          if [ -z "$STRIPE_KEY" ]; then echo "❌ STRIPE_SECRET_KEY not set"; exit 1; fi

          echo "✅ All secrets are set"
```

**Run test:**
1. Go to Actions tab
2. Select "Test Secrets" workflow
3. Click "Run workflow"
4. Check output for "✅ All secrets are set"

### Test MongoDB Connection

```yaml
- name: Test MongoDB Connection
  env:
    MONGO_URL: ${{ secrets.MONGO_URL }}
  run: |
    # Install MongoDB shell
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-mongosh

    # Test connection
    mongosh "$MONGO_URL" --eval "db.adminCommand('ping')"
```

### Test Stripe Keys

```yaml
- name: Test Stripe Keys
  env:
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  run: |
    # Test API call
    curl https://api.stripe.com/v1/payment_intents \
      -u $STRIPE_SECRET_KEY: \
      -d amount=100 \
      -d currency=eur
```

---

## 🔄 Rotating Secrets

### When to Rotate

- **Immediately:** If secret is exposed/leaked
- **Regularly:** Every 90 days (recommended)
- **After team changes:** When members leave
- **Security incident:** After any breach

### How to Rotate

#### Step 1: Generate New Secret

```bash
# For JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For passwords
openssl rand -base64 32
```

#### Step 2: Update in Services First

Update the secret in your deployed services to accept **both old and new** keys temporarily (if possible).

#### Step 3: Update GitHub Secret

1. Go to repository Settings → Secrets
2. Find the secret
3. Click "Update"
4. Enter new value
5. Click "Update secret"

#### Step 4: Trigger Deployment

Trigger a deployment to apply the new secret.

#### Step 5: Verify

Check logs to ensure new secret works.

#### Step 6: Remove Old Secret

After verification, remove support for old secret from services.

---

## 🚨 Security Best Practices

### DO ✅

- ✅ Use separate secrets for staging/production
- ✅ Enable required reviewers for production
- ✅ Rotate secrets every 90 days
- ✅ Use least-privilege service accounts
- ✅ Enable audit logs for secret access
- ✅ Use organization secrets for shared values
- ✅ Test secrets before production use
- ✅ Document what each secret is for
- ✅ Use secret scanning alerts

### DON'T ❌

- ❌ Commit secrets to repository
- ❌ Echo/print secret values in logs
- ❌ Use same secrets for dev/staging/prod
- ❌ Share secrets via Slack/email
- ❌ Use weak/short secrets
- ❌ Grant unnecessary repo access
- ❌ Ignore secret scanning alerts
- ❌ Use personal credentials for CI/CD

---

## 🐛 Troubleshooting

### Issue: Secret not found

**Error:**
```
Error: Secret MONGO_URL is not set
```

**Solutions:**
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is set in correct environment
3. Check repository has access to organization secret
4. Ensure workflow references correct secret:
   ```yaml
   env:
     MONGO_URL: ${{ secrets.MONGO_URL }}  # Correct
     # Not: ${{ secrets.MongoUrl }}
   ```

### Issue: Secret value is empty

**Solutions:**
1. Re-add the secret (copy-paste might have trailing spaces)
2. Check for special characters that need escaping
3. Verify secret wasn't deleted by mistake

### Issue: JWT tokens not working across APIs

**Cause:** `JWT_SECRET_KEY` differs between APIs

**Solution:**
1. Generate ONE secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. Copy the EXACT same value to all 3 repos
3. Redeploy all APIs
4. Test cross-API authentication

### Issue: Deployment fails after secret update

**Solutions:**
1. Check deployment logs for errors
2. Verify new secret format is correct
3. Restart application services
4. Check if services need to be updated to use new secret

---

## 📊 Secret Inventory

Use this table to track which secrets are configured:

| Secret | Admin API | Marketplace API | Access API | Organization | Notes |
|--------|-----------|-----------------|------------|--------------|-------|
| JWT_SECRET_KEY | ⬜ | ⬜ | ⬜ | ⬜ | **Must match!** |
| MONGO_URL | ⬜ | ⬜ | ⬜ | ⬜ | Production DB |
| MONGO_URL_STAGING | ⬜ | ⬜ | ⬜ | ⬜ | Staging DB |
| REDIS_HOST | ⬜ | ⬜ | ⬜ | ⬜ | |
| REDIS_PASSWORD | ⬜ | ⬜ | ⬜ | ⬜ | |
| STRIPE_SECRET_KEY | ⬜ | ⬜ | ⬜ | ⬜ | Live key |
| STRIPE_PUBLIC_KEY | ⬜ | ⬜ | ⬜ | ⬜ | Live key |
| STRIPE_WEBHOOK_SECRET | ⬜ | ⬜ | ⬜ | ⬜ | |
| MAIL_PASSWORD | ⬜ | ⬜ | ⬜ | ⬜ | SendGrid API key |
| AZURE_CREDENTIALS | ⬜ | ⬜ | ⬜ | ⬜ | Service principal |
| DOCKER_REGISTRY_PASSWORD | ⬜ | ⬜ | ⬜ | ✅ | Org-level |
| RPC_URL | ⬜ | ⬜ | ⬜ | ⬜ | Blockchain |
| PRIVATE_KEY | ⬜ | ⬜ | ⬜ | ⬜ | Blockchain |
| SOCKET_ACCESS | ⬜ | ⬜ | ✅ | ⬜ | Access API only |
| SOCKET_MARKET_PLACE | ⬜ | ✅ | ⬜ | ⬜ | Marketplace only |

**Check each box (⬜ → ✅) as you configure secrets.**

---

## 📚 Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Azure Service Principal Documentation](https://docs.microsoft.com/en-us/azure/developer/github/connect-from-azure)
- [Secret Scanning Documentation](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

## ✅ Summary

You now have a complete guide for:

- ✅ Organization-level shared secrets
- ✅ Repository-specific secrets for each API
- ✅ Environment-specific secrets (staging/production)
- ✅ Azure and GCP credentials setup
- ✅ Kubernetes configuration
- ✅ Testing and verification procedures
- ✅ Secret rotation process
- ✅ Security best practices
- ✅ Troubleshooting common issues

**Next Steps:**
1. Follow the step-by-step setup for each repository
2. Use the verification checklist
3. Test secrets with a workflow
4. Document your secret rotation schedule

---

**Last Updated:** 2025-10-13
**Maintained by:** FuturaTickets DevOps Team
