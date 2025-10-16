#!/bin/bash

# FuturaTickets Deployment Validation Script
# Usage: ./validate-deployment.sh [environment]
# Example: ./validate-deployment.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-staging}
NAMESPACE="futuratickets"
ERRORS=0
WARNINGS=0

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Deployment Validation${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to report success
report_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to report error
report_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

# Function to report warning
report_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Check kubectl
echo -e "${BLUE}1. Checking kubectl...${NC}"
if command -v kubectl &> /dev/null; then
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client 2>/dev/null | head -n1)
    report_success "kubectl installed: ${KUBECTL_VERSION}"
else
    report_error "kubectl not installed"
fi
echo ""

# Check kubectl connectivity
echo -e "${BLUE}2. Checking Kubernetes connectivity...${NC}"
if kubectl cluster-info &> /dev/null; then
    CURRENT_CONTEXT=$(kubectl config current-context)
    report_success "Connected to cluster: ${CURRENT_CONTEXT}"
else
    report_error "Cannot connect to Kubernetes cluster"
fi
echo ""

# Check namespace
echo -e "${BLUE}3. Checking namespace...${NC}"
if kubectl get namespace ${NAMESPACE} &> /dev/null; then
    report_success "Namespace '${NAMESPACE}' exists"
else
    report_error "Namespace '${NAMESPACE}' does not exist"
    echo -e "  ${YELLOW}Create it with: kubectl create namespace ${NAMESPACE}${NC}"
fi
echo ""

# Check secrets
echo -e "${BLUE}4. Checking secrets...${NC}"
REQUIRED_SECRETS=(
    "mongodb-secret"
    "redis-secret"
    "api-secret"
    "admin-secret"
    "grafana-secret"
    "ghcr-secret"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if kubectl get secret ${secret} -n ${NAMESPACE} &> /dev/null; then
        report_success "Secret '${secret}' exists"
    else
        report_error "Secret '${secret}' does not exist"
        echo -e "  ${YELLOW}Create secrets with: ./scripts/setup-secrets.sh ${ENVIRONMENT}${NC}"
    fi
done
echo ""

# Validate secret contents
echo -e "${BLUE}5. Validating secret contents...${NC}"

# MongoDB secret
if kubectl get secret mongodb-secret -n ${NAMESPACE} &> /dev/null; then
    MONGO_USER=$(kubectl get secret mongodb-secret -n ${NAMESPACE} -o jsonpath='{.data.username}' 2>/dev/null | base64 -d 2>/dev/null || echo "")
    MONGO_PASS=$(kubectl get secret mongodb-secret -n ${NAMESPACE} -o jsonpath='{.data.password}' 2>/dev/null | base64 -d 2>/dev/null || echo "")

    if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASS" ]; then
        report_success "MongoDB credentials are set"
    else
        report_error "MongoDB credentials are empty"
    fi
else
    report_error "Cannot validate MongoDB secret (does not exist)"
fi

# API secret
if kubectl get secret api-secret -n ${NAMESPACE} &> /dev/null; then
    JWT_SECRET=$(kubectl get secret api-secret -n ${NAMESPACE} -o jsonpath='{.data.jwt-secret}' 2>/dev/null | base64 -d 2>/dev/null || echo "")
    SENTRY_DSN=$(kubectl get secret api-secret -n ${NAMESPACE} -o jsonpath='{.data.sentry-dsn}' 2>/dev/null | base64 -d 2>/dev/null || echo "")

    if [ -n "$JWT_SECRET" ]; then
        if [ ${#JWT_SECRET} -ge 32 ]; then
            report_success "JWT secret is set and strong"
        else
            report_warning "JWT secret is set but may be too short (< 32 chars)"
        fi
    else
        report_error "JWT secret is empty"
    fi

    if [ -n "$SENTRY_DSN" ] && [[ "$SENTRY_DSN" == https://*@*.ingest.sentry.io/* ]]; then
        report_success "Sentry DSN is set and valid format"
    else
        report_warning "Sentry DSN is not set or invalid format"
    fi
else
    report_error "Cannot validate API secret (does not exist)"
fi

# GHCR secret
if kubectl get secret ghcr-secret -n ${NAMESPACE} &> /dev/null; then
    report_success "GitHub Container Registry secret exists"
else
    report_error "GitHub Container Registry secret does not exist"
fi

echo ""

# Check Kubernetes manifests
echo -e "${BLUE}6. Validating Kubernetes manifests...${NC}"
MANIFEST_DIRS=(
    "k8s/mongodb"
    "k8s/redis"
    "k8s/api"
    "k8s/admin"
    "k8s/marketplace"
    "k8s/prometheus"
    "k8s/grafana"
    "k8s/alertmanager"
    "k8s/ingress"
)

for dir in "${MANIFEST_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        YAML_FILES=$(find "$dir" -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
        if [ "$YAML_FILES" -gt 0 ]; then
            report_success "Manifests in ${dir}/ (${YAML_FILES} files)"

            # Validate YAML syntax (only if kubectl is available)
            if command -v kubectl &> /dev/null; then
                for file in "$dir"/*.yml "$dir"/*.yaml; do
                    if [ -f "$file" ]; then
                        if kubectl apply --dry-run=client -f "$file" &> /dev/null; then
                            # Valid YAML
                            :
                        else
                            report_warning "Could not validate YAML syntax in ${file}"
                        fi
                    fi
                done
            fi
        else
            report_warning "No YAML files in ${dir}/"
        fi
    else
        report_error "Directory ${dir}/ does not exist"
    fi
done
echo ""

# Check Docker
echo -e "${BLUE}7. Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        report_success "Docker installed and running: ${DOCKER_VERSION}"
    else
        report_warning "Docker installed but not running"
    fi
else
    report_warning "Docker not installed (required for local testing)"
fi
echo ""

# Check Node.js and npm
echo -e "${BLUE}8. Checking Node.js and npm...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    report_success "Node.js installed: ${NODE_VERSION}"

    if [[ "$NODE_VERSION" < "v20" ]]; then
        report_warning "Node.js version is < v20 (recommended: v20+)"
    fi
else
    report_error "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    report_success "npm installed: v${NPM_VERSION}"
else
    report_error "npm not installed"
fi
echo ""

# Check project structure
echo -e "${BLUE}9. Checking project structure...${NC}"
REQUIRED_DIRS=(
    "futura-tickets-admin-api"
    "futura-tickets-admin"
    "futura-market-place-v2"
    "k8s"
    "scripts"
    "tests"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        report_success "Directory ${dir}/ exists"
    else
        report_error "Directory ${dir}/ does not exist"
    fi
done
echo ""

# Check package.json files
echo -e "${BLUE}10. Checking package.json files...${NC}"
PACKAGE_JSON_PATHS=(
    "futura-tickets-admin-api/package.json"
    "futura-tickets-admin/package.json"
    "futura-market-place-v2/package.json"
)

for path in "${PACKAGE_JSON_PATHS[@]}"; do
    if [ -f "$path" ]; then
        report_success "File ${path} exists"

        # Check if dependencies are installed
        DIR=$(dirname "$path")
        if [ -d "$DIR/node_modules" ]; then
            report_success "Dependencies installed in ${DIR}/"
        else
            report_warning "Dependencies not installed in ${DIR}/ (run 'npm install')"
        fi
    else
        report_error "File ${path} does not exist"
    fi
done
echo ""

# Check environment files
echo -e "${BLUE}11. Checking environment files...${NC}"
ENV_FILES=(
    "futura-tickets-admin-api/.env.example"
    "futura-tickets-admin/.env.local.example"
    "futura-market-place-v2/.env.local.example"
)

for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        report_success "File ${file} exists"
    else
        report_warning "File ${file} does not exist"
    fi
done
echo ""

# Check Sentry configuration
echo -e "${BLUE}12. Checking Sentry configuration...${NC}"
SENTRY_FILES=(
    "futura-tickets-admin-api/src/Sentry/sentry.config.ts"
    "futura-tickets-admin/sentry.client.config.ts"
    "futura-tickets-admin/sentry.server.config.ts"
    "futura-market-place-v2/sentry.client.config.ts"
    "futura-market-place-v2/sentry.server.config.ts"
)

for file in "${SENTRY_FILES[@]}"; do
    if [ -f "$file" ]; then
        report_success "Sentry config ${file} exists"
    else
        report_error "Sentry config ${file} does not exist"
    fi
done
echo ""

# Check CI/CD
echo -e "${BLUE}13. Checking CI/CD configuration...${NC}"
if [ -f ".github/workflows/ci-cd.yml" ]; then
    report_success "GitHub Actions workflow exists"
else
    report_warning "GitHub Actions workflow does not exist"
fi
echo ""

# Check scripts
echo -e "${BLUE}14. Checking deployment scripts...${NC}"
SCRIPTS=(
    "scripts/deploy.sh"
    "scripts/rollback.sh"
    "scripts/update-image.sh"
    "scripts/health-check.sh"
    "scripts/backup-mongodb.sh"
    "scripts/setup-secrets.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            report_success "Script ${script} exists and is executable"
        else
            report_warning "Script ${script} exists but is not executable (chmod +x ${script})"
        fi
    else
        report_error "Script ${script} does not exist"
    fi
done
echo ""

# Check test files
echo -e "${BLUE}15. Checking test files...${NC}"
TEST_FILES=(
    "tests/smoke-test.sh"
    "tests/load-test.yml"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        report_success "Test file ${file} exists"
    else
        report_warning "Test file ${file} does not exist"
    fi
done
echo ""

# Check documentation
echo -e "${BLUE}16. Checking documentation...${NC}"
DOC_FILES=(
    "README.md"
    "SETUP_GUIDE.md"
    "DEPLOYMENT_COMPLETE.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        report_success "Documentation ${file} exists"
    else
        report_warning "Documentation ${file} does not exist"
    fi
done
echo ""

# Check Git
echo -e "${BLUE}17. Checking Git configuration...${NC}"
if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        report_success "Git repository initialized"

        GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
        if [ -n "$GIT_REMOTE" ]; then
            report_success "Git remote configured: ${GIT_REMOTE}"
        else
            report_warning "Git remote not configured"
        fi

        GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
        if [ -n "$GIT_BRANCH" ]; then
            report_success "Current branch: ${GIT_BRANCH}"
        fi
    else
        report_warning "Not a Git repository"
    fi
else
    report_warning "Git not installed"
fi
echo ""

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}======================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}You are ready to deploy.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review SETUP_GUIDE.md for configuration details"
    echo -e "  2. Run: ./scripts/setup-secrets.sh ${ENVIRONMENT}"
    echo -e "  3. Run: ./scripts/deploy.sh ${ENVIRONMENT} all"
    EXIT_CODE=0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    echo -e "${YELLOW}You can proceed with deployment, but review warnings.${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ ${ERRORS} error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    fi
    echo -e "${RED}Fix errors before deploying.${NC}"
    EXIT_CODE=1
fi

echo -e "${BLUE}======================================${NC}"
echo ""

exit $EXIT_CODE
