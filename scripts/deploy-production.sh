#!/bin/bash

# FuturaTickets Production Deployment Script
# Usage: ./deploy-production.sh [component]
# Example: ./deploy-production.sh all
# Example: ./deploy-production.sh api

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPONENT=${1:-all}
NAMESPACE="futuratickets"
ENVIRONMENT="production"
TIMEOUT=600
ROLLBACK_ON_FAILURE=true
RUN_SMOKE_TESTS=true
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=10

# Deployment metadata
DEPLOYMENT_ID="deploy-$(date +%Y%m%d-%H%M%S)"
DEPLOYMENT_LOG="logs/deployment-${DEPLOYMENT_ID}.log"
mkdir -p logs

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

# Error handling
handle_error() {
    local component=$1
    local exit_code=$2

    log_error "Deployment failed for ${component} (exit code: ${exit_code})"

    if [ "$ROLLBACK_ON_FAILURE" = true ]; then
        log_warning "Initiating automatic rollback for ${component}..."
        ./scripts/rollback.sh "${component}" <<< "y"

        if [ $? -eq 0 ]; then
            log_success "Rollback completed successfully"
        else
            log_error "Rollback failed! Manual intervention required!"
        fi
    fi

    exit "$exit_code"
}

# Slack/Discord notification (if webhook configured)
send_notification() {
    local message=$1
    local status=$2  # success, warning, error

    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        local color
        case "$status" in
            success) color="good" ;;
            warning) color="warning" ;;
            error) color="danger" ;;
            *) color="#808080" ;;
        esac

        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"text\": \"$message\",
                    \"footer\": \"FuturaTickets Deployment\",
                    \"ts\": $(date +%s)
                }]
            }" &> /dev/null || true
    fi
}

# Banner
echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                        ║${NC}"
echo -e "${PURPLE}║         FuturaTickets Production Deployment            ║${NC}"
echo -e "${PURPLE}║                                                        ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Deployment ID: ${DEPLOYMENT_ID}"
log_info "Environment: ${ENVIRONMENT}"
log_info "Component: ${COMPONENT}"
log_info "Namespace: ${NAMESPACE}"
log_info "Log file: ${DEPLOYMENT_LOG}"
echo ""

# Pre-deployment checks
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 1: Pre-Deployment Validation${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

log "Running pre-deployment validation..."
if ! ./scripts/validate-deployment.sh production >> "$DEPLOYMENT_LOG" 2>&1; then
    log_error "Pre-deployment validation failed"
    log_error "Review ${DEPLOYMENT_LOG} for details"
    send_notification "❌ Deployment validation failed for ${COMPONENT}" "error"
    exit 1
fi
log_success "Pre-deployment validation passed"
echo ""

# Confirm deployment
if [ -t 0 ]; then  # Only prompt if running interactively
    echo -e "${YELLOW}⚠ You are about to deploy to PRODUCTION${NC}"
    echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}Component: ${COMPONENT}${NC}"
    echo -e "${YELLOW}Namespace: ${NAMESPACE}${NC}"
    echo ""
    read -p "Continue with deployment? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_warning "Deployment cancelled by user"
        exit 0
    fi
fi

# Create backup/snapshot
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 2: Backup Current State${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

log "Creating deployment snapshot..."
if [ "$COMPONENT" == "all" ] || [ "$COMPONENT" == "mongodb" ]; then
    log "Backing up MongoDB..."
    ./scripts/backup-mongodb.sh production >> "$DEPLOYMENT_LOG" 2>&1 || log_warning "MongoDB backup failed (non-critical)"
fi

# Save current deployment state
kubectl get deployments -n "$NAMESPACE" -o yaml > "logs/pre-deploy-state-${DEPLOYMENT_ID}.yaml" 2>/dev/null || true
log_success "Deployment snapshot created"
echo ""

# Start deployment
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 3: Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

send_notification "🚀 Starting deployment of ${COMPONENT} to production" "info"

log "Starting deployment of ${COMPONENT}..."
START_TIME=$(date +%s)

if ! ./scripts/deploy.sh production "$COMPONENT" >> "$DEPLOYMENT_LOG" 2>&1; then
    handle_error "$COMPONENT" $?
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
log_success "Deployment completed in ${DURATION} seconds"
echo ""

# Post-deployment verification
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 4: Post-Deployment Verification${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Wait for rollout to complete
log "Waiting for deployment rollout to complete..."

if [ "$COMPONENT" == "all" ]; then
    COMPONENTS=("api" "admin" "marketplace")
else
    COMPONENTS=("$COMPONENT")
fi

for comp in "${COMPONENTS[@]}"; do
    log "Checking rollout status for ${comp}..."

    if kubectl rollout status deployment/"${comp}" -n "$NAMESPACE" --timeout="${TIMEOUT}s" >> "$DEPLOYMENT_LOG" 2>&1; then
        log_success "${comp} rollout completed successfully"
    else
        log_error "${comp} rollout failed"
        handle_error "${comp}" 1
    fi
done
echo ""

# Health checks
log "Running health checks..."
HEALTH_SUCCESS=false

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    log_info "Health check attempt $i/$HEALTH_CHECK_RETRIES..."

    if ./scripts/health-check-all.sh >> "$DEPLOYMENT_LOG" 2>&1; then
        HEALTH_SUCCESS=true
        break
    fi

    if [ $i -lt $HEALTH_CHECK_RETRIES ]; then
        log_warning "Health check failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
        sleep "$HEALTH_CHECK_INTERVAL"
    fi
done

if [ "$HEALTH_SUCCESS" = false ]; then
    log_error "Health checks failed after $HEALTH_CHECK_RETRIES attempts"
    handle_error "$COMPONENT" 1
fi
log_success "Health checks passed"
echo ""

# Smoke tests
if [ "$RUN_SMOKE_TESTS" = true ]; then
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  PHASE 5: Smoke Tests${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""

    log "Running smoke tests..."

    if [ -f "tests/smoke-test.sh" ]; then
        if ./tests/smoke-test.sh >> "$DEPLOYMENT_LOG" 2>&1; then
            log_success "Smoke tests passed"
        else
            log_error "Smoke tests failed"
            handle_error "$COMPONENT" 1
        fi
    else
        log_warning "Smoke test script not found, skipping..."
    fi
    echo ""
fi

# Deployment summary
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment Successful! ✓${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

log_success "Deployment completed successfully"
log_info "Total duration: ${DURATION} seconds"
log_info "Deployment ID: ${DEPLOYMENT_ID}"
log_info "Log file: ${DEPLOYMENT_LOG}"
echo ""

# Post-deployment information
echo -e "${CYAN}Post-Deployment Information:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get deployments -n "$NAMESPACE" -o wide

echo ""
echo -e "${BLUE}🎯 Pod Status:${NC}"
kubectl get pods -n "$NAMESPACE" -o wide

echo ""
echo -e "${BLUE}🌐 Service Endpoints:${NC}"
kubectl get svc -n "$NAMESPACE"

echo ""
echo -e "${BLUE}🔗 Ingress:${NC}"
kubectl get ingress -n "$NAMESPACE"

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Monitoring links
echo -e "${PURPLE}📈 Monitoring & Logs:${NC}"
echo -e "  Grafana: https://grafana.futuratickets.com"
echo -e "  Prometheus: https://prometheus.futuratickets.com"
echo -e "  Sentry: https://sentry.io/organizations/futuratickets"
echo ""

echo -e "${PURPLE}📝 View Logs:${NC}"
for comp in "${COMPONENTS[@]}"; do
    echo -e "  ${comp}: kubectl logs -f deployment/${comp} -n ${NAMESPACE}"
done
echo ""

echo -e "${PURPLE}↩️ Rollback (if needed):${NC}"
echo -e "  ./scripts/rollback.sh ${COMPONENT}"
echo ""

# Send success notification
send_notification "✅ Deployment of ${COMPONENT} completed successfully (${DURATION}s)" "success"

# Save deployment record
cat >> "logs/deployment-history.log" <<EOF
$(date -u +"%Y-%m-%d %H:%M:%S UTC"),${DEPLOYMENT_ID},${COMPONENT},SUCCESS,${DURATION}s
EOF

log_success "Deployment record saved"
echo ""
echo -e "${GREEN}✓ All done! Your application is now live in production.${NC}"
echo ""
