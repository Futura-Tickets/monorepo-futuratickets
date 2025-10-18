#!/bin/bash

# FuturaTickets Automatic Rollback Script
# Usage: ./rollback-auto.sh [component] [reason]
# Example: ./rollback-auto.sh api "Health checks failing"
# Example: ./rollback-auto.sh all "Performance degradation"

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
COMPONENT=${1:-api}
REASON=${2:-"Manual rollback triggered"}
NAMESPACE="futuratickets"
TIMEOUT=300
VERIFY_HEALTH=true
ROLLBACK_LOG="logs/rollback-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ${NC} $1" | tee -a "$ROLLBACK_LOG"
}

# Slack/Discord notification
send_notification() {
    local message=$1
    local status=$2

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
                    \"footer\": \"FuturaTickets Rollback\",
                    \"ts\": $(date +%s)
                }]
            }" &> /dev/null || true
    fi
}

# Banner
echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                        ║${NC}"
echo -e "${PURPLE}║         FuturaTickets Automatic Rollback               ║${NC}"
echo -e "${PURPLE}║                                                        ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
log_info "Component: ${COMPONENT}"
log_info "Reason: ${REASON}"
log_info "Namespace: ${NAMESPACE}"
log_info "Log file: ${ROLLBACK_LOG}"
echo ""

# Validate kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl."
    exit 1
fi

# Get current state
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 1: Capture Current State${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

log "Capturing current deployment state..."

# Components to rollback
if [ "$COMPONENT" == "all" ]; then
    COMPONENTS=("api" "admin" "marketplace")
else
    COMPONENTS=("$COMPONENT")
fi

# Save current state
for comp in "${COMPONENTS[@]}"; do
    if kubectl get deployment "${comp}" -n "${NAMESPACE}" &> /dev/null; then
        kubectl get deployment "${comp}" -n "${NAMESPACE}" -o yaml > "logs/pre-rollback-${comp}-$(date +%Y%m%d-%H%M%S).yaml"
        log_success "Saved current state for ${comp}"
    else
        log_warning "Deployment ${comp} not found in namespace ${NAMESPACE}"
    fi
done
echo ""

# Show rollout history
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 2: Rollout History${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

for comp in "${COMPONENTS[@]}"; do
    if kubectl get deployment "${comp}" -n "${NAMESPACE}" &> /dev/null; then
        log "Rollout history for ${comp}:"
        kubectl rollout history deployment/"${comp}" -n "${NAMESPACE}" | tee -a "$ROLLBACK_LOG"
        echo ""
    fi
done

# Confirm rollback
echo -e "${RED}⚠ WARNING: You are about to rollback in PRODUCTION${NC}"
echo -e "${YELLOW}Component: ${COMPONENT}${NC}"
echo -e "${YELLOW}Reason: ${REASON}${NC}"
echo ""

if [ -t 0 ]; then  # Only prompt if running interactively
    read -p "Continue with rollback? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_warning "Rollback cancelled by user"
        exit 0
    fi
fi

# Execute rollback
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 3: Execute Rollback${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

send_notification "🔄 Starting rollback of ${COMPONENT}: ${REASON}" "warning"

START_TIME=$(date +%s)

for comp in "${COMPONENTS[@]}"; do
    if ! kubectl get deployment "${comp}" -n "${NAMESPACE}" &> /dev/null; then
        log_warning "Deployment ${comp} not found, skipping..."
        continue
    fi

    log "Rolling back ${comp}..."

    # Execute rollback
    if kubectl rollout undo deployment/"${comp}" -n "${NAMESPACE}" >> "$ROLLBACK_LOG" 2>&1; then
        log_success "Rollback command executed for ${comp}"
    else
        log_error "Rollback command failed for ${comp}"
        send_notification "❌ Rollback failed for ${comp}" "error"
        exit 1
    fi

    # Wait for rollback to complete
    log "Waiting for ${comp} rollback to complete..."
    if kubectl rollout status deployment/"${comp}" -n "${NAMESPACE}" --timeout="${TIMEOUT}s" >> "$ROLLBACK_LOG" 2>&1; then
        log_success "${comp} rollback completed"
    else
        log_error "${comp} rollback timed out"
        send_notification "❌ Rollback timeout for ${comp}" "error"
        exit 1
    fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
log_success "Rollback completed in ${DURATION} seconds"
echo ""

# Verify rollback
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 4: Verification${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

log "Verifying rollback..."

# Check pod status
for comp in "${COMPONENTS[@]}"; do
    if ! kubectl get deployment "${comp}" -n "${NAMESPACE}" &> /dev/null; then
        continue
    fi

    log "Checking ${comp} pod status..."

    # Get pod status
    READY_PODS=$(kubectl get deployment "${comp}" -n "${NAMESPACE}" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    DESIRED_PODS=$(kubectl get deployment "${comp}" -n "${NAMESPACE}" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")

    if [ "${READY_PODS}" -eq "${DESIRED_PODS}" ] && [ "${READY_PODS}" -gt 0 ]; then
        log_success "${comp}: ${READY_PODS}/${DESIRED_PODS} pods ready"
    else
        log_warning "${comp}: ${READY_PODS}/${DESIRED_PODS} pods ready (may still be starting)"
    fi
done
echo ""

# Health checks
if [ "$VERIFY_HEALTH" = true ]; then
    log "Running health checks..."

    if [ -f "scripts/health-check-all.sh" ]; then
        sleep 10  # Give services time to stabilize

        if ./scripts/health-check-all.sh >> "$ROLLBACK_LOG" 2>&1; then
            log_success "Health checks passed"
        else
            log_error "Health checks failed after rollback"
            log_error "Manual intervention required!"
            send_notification "❌ Health checks failed after rollback of ${COMPONENT}" "error"
            exit 1
        fi
    else
        log_warning "Health check script not found, skipping verification"
    fi
fi
echo ""

# Rollback summary
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Rollback Successful! ✓${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

log_success "Rollback completed successfully"
log_info "Duration: ${DURATION} seconds"
log_info "Reason: ${REASON}"
log_info "Log file: ${ROLLBACK_LOG}"
echo ""

# Post-rollback information
echo -e "${CYAN}Post-Rollback Information:${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get deployments -n "$NAMESPACE"

echo ""
echo -e "${BLUE}🎯 Pod Status:${NC}"
kubectl get pods -n "$NAMESPACE" | grep -E "NAME|$(IFS=\|; echo "${COMPONENTS[*]}")" || kubectl get pods -n "$NAMESPACE"

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${PURPLE}📝 View Logs:${NC}"
for comp in "${COMPONENTS[@]}"; do
    echo -e "  ${comp}: kubectl logs -f deployment/${comp} -n ${NAMESPACE}"
done
echo ""

echo -e "${PURPLE}📈 Monitor:${NC}"
echo -e "  Grafana: https://grafana.futuratickets.com"
echo -e "  Sentry: https://sentry.io"
echo ""

# Send success notification
send_notification "✅ Rollback of ${COMPONENT} completed successfully (${DURATION}s). Reason: ${REASON}" "success"

# Save rollback record
cat >> "logs/rollback-history.log" <<EOF
$(date -u +"%Y-%m-%d %H:%M:%S UTC"),${COMPONENT},SUCCESS,${DURATION}s,"${REASON}"
EOF

log_success "Rollback record saved"
echo ""
echo -e "${GREEN}✓ Rollback complete. System restored to previous version.${NC}"
echo -e "${YELLOW}⚠ Investigate the issue that caused the rollback: ${REASON}${NC}"
echo ""

# Create incident report template
INCIDENT_REPORT="logs/incident-$(date +%Y%m%d-%H%M%S).md"
cat > "$INCIDENT_REPORT" <<EOF
# Incident Report

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Component:** ${COMPONENT}
**Action:** Rollback
**Duration:** ${DURATION} seconds
**Reason:** ${REASON}

## Timeline

- **Rollback Started:** $(date -d "@${START_TIME}" -u +"%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || date -r "${START_TIME}" -u +"%Y-%m-%d %H:%M:%S UTC")
- **Rollback Completed:** $(date -d "@${END_TIME}" -u +"%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || date -r "${END_TIME}" -u +"%Y-%m-%d %H:%M:%S UTC")

## Components Affected

$(for comp in "${COMPONENTS[@]}"; do echo "- ${comp}"; done)

## Resolution

Rolled back to previous version.

## Follow-up Actions

- [ ] Root cause analysis
- [ ] Fix underlying issue
- [ ] Add monitoring/alerting for this issue
- [ ] Update runbook
- [ ] Schedule post-mortem meeting

## Logs

- Rollback log: ${ROLLBACK_LOG}
- Pre-rollback state: logs/pre-rollback-*-$(date +%Y%m%d)*.yaml

## Notes

<!-- Add any additional notes here -->

EOF

log_info "Incident report created: ${INCIDENT_REPORT}"
echo -e "${BLUE}📋 Incident report created at: ${INCIDENT_REPORT}${NC}"
echo ""
