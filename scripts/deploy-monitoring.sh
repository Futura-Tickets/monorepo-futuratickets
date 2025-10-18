#!/bin/bash

# FuturaTickets Monitoring Stack Deployment
# Deploys Grafana dashboards, Prometheus alerts, and AlertManager config

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
NAMESPACE="futuratickets"
DRY_RUN=${DRY_RUN:-false}

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ${NC} $1"
}

# Banner
echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                        ║${NC}"
echo -e "${PURPLE}║      FuturaTickets Monitoring Stack Deployment        ║${NC}"
echo -e "${PURPLE}║                                                        ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl."
    exit 1
fi

# Check namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    log_error "Namespace '$NAMESPACE' does not exist"
    log_info "Create it with: kubectl create namespace $NAMESPACE"
    exit 1
fi

# Function to apply or dry-run kubectl
apply_config() {
    local file=$1
    local description=$2

    if [ "$DRY_RUN" = true ]; then
        log_info "DRY RUN: Would apply $description"
        kubectl apply -f "$file" --dry-run=client
    else
        log "Applying $description..."
        kubectl apply -f "$file"
        log_success "$description applied successfully"
    fi
}

# Phase 1: Deploy Grafana Dashboard
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 1: Deploy Grafana Dashboard${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "k8s/grafana/dashboard-configmap.yaml" ]; then
    apply_config "k8s/grafana/dashboard-configmap.yaml" "Grafana dashboard ConfigMap"

    # Reload Grafana if running
    if kubectl get deployment grafana -n "$NAMESPACE" &> /dev/null; then
        if [ "$DRY_RUN" = false ]; then
            log "Reloading Grafana to pick up new dashboard..."
            kubectl rollout restart deployment/grafana -n "$NAMESPACE"
            log_success "Grafana restarted"
        else
            log_info "DRY RUN: Would restart Grafana deployment"
        fi
    else
        log_warning "Grafana deployment not found, skipping reload"
    fi
else
    log_error "Dashboard ConfigMap not found at k8s/grafana/dashboard-configmap.yaml"
    exit 1
fi
echo ""

# Phase 2: Deploy Prometheus Alert Rules
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 2: Deploy Prometheus Alert Rules${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "k8s/prometheus/alert-rules.yaml" ]; then
    apply_config "k8s/prometheus/alert-rules.yaml" "Prometheus alert rules"

    # Reload Prometheus config if running
    if kubectl get deployment prometheus -n "$NAMESPACE" &> /dev/null; then
        if [ "$DRY_RUN" = false ]; then
            log "Reloading Prometheus configuration..."
            # Trigger config reload via API
            PROMETHEUS_POD=$(kubectl get pods -n "$NAMESPACE" -l app=prometheus -o jsonpath='{.items[0].metadata.name}')
            if [ -n "$PROMETHEUS_POD" ]; then
                kubectl exec -n "$NAMESPACE" "$PROMETHEUS_POD" -- \
                    curl -X POST http://localhost:9090/-/reload
                log_success "Prometheus config reloaded"
            else
                log_warning "Prometheus pod not found, restart deployment instead"
                kubectl rollout restart deployment/prometheus -n "$NAMESPACE"
            fi
        else
            log_info "DRY RUN: Would reload Prometheus config"
        fi
    else
        log_warning "Prometheus deployment not found, skipping reload"
    fi
else
    log_error "Alert rules not found at k8s/prometheus/alert-rules.yaml"
    exit 1
fi
echo ""

# Phase 3: Deploy AlertManager Configuration
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 3: Deploy AlertManager Configuration${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "k8s/alertmanager/alertmanager-config.yaml" ]; then
    apply_config "k8s/alertmanager/alertmanager-config.yaml" "AlertManager configuration"

    # Reload AlertManager if running
    if kubectl get deployment alertmanager -n "$NAMESPACE" &> /dev/null; then
        if [ "$DRY_RUN" = false ]; then
            log "Reloading AlertManager..."
            kubectl rollout restart deployment/alertmanager -n "$NAMESPACE"
            log_success "AlertManager restarted"
        else
            log_info "DRY RUN: Would restart AlertManager deployment"
        fi
    else
        log_warning "AlertManager deployment not found, skipping reload"
    fi
else
    log_error "AlertManager config not found at k8s/alertmanager/alertmanager-config.yaml"
    exit 1
fi
echo ""

# Phase 4: Verification
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PHASE 4: Verification${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
    log "Verifying deployed resources..."

    # Check ConfigMaps
    log_info "Checking ConfigMaps..."
    kubectl get configmap grafana-dashboards -n "$NAMESPACE" &> /dev/null && \
        log_success "Grafana dashboard ConfigMap exists" || \
        log_error "Grafana dashboard ConfigMap not found"

    kubectl get configmap prometheus-alert-rules -n "$NAMESPACE" &> /dev/null && \
        log_success "Prometheus alert rules ConfigMap exists" || \
        log_error "Prometheus alert rules ConfigMap not found"

    kubectl get configmap alertmanager-config -n "$NAMESPACE" &> /dev/null && \
        log_success "AlertManager config ConfigMap exists" || \
        log_error "AlertManager config ConfigMap not found"

    # Check deployments
    log_info "Checking deployment status..."
    kubectl get deployments -n "$NAMESPACE" -l component=monitoring 2>/dev/null || \
        log_warning "No monitoring deployments found (this is normal if not yet deployed)"

    echo ""
    log_info "Monitoring configuration deployed successfully!"
    echo ""

    # Display access information
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Access Information${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo ""

    echo -e "${BLUE}📊 Grafana Dashboard:${NC}"
    echo "  Production: https://grafana.futuratickets.com"
    echo "  Local: kubectl port-forward svc/grafana 3000:3000 -n $NAMESPACE"
    echo ""

    echo -e "${BLUE}🔔 Prometheus:${NC}"
    echo "  Production: https://prometheus.futuratickets.com"
    echo "  Local: kubectl port-forward svc/prometheus 9090:9090 -n $NAMESPACE"
    echo ""

    echo -e "${BLUE}📢 AlertManager:${NC}"
    echo "  Production: https://alertmanager.futuratickets.com"
    echo "  Local: kubectl port-forward svc/alertmanager 9093:9093 -n $NAMESPACE"
    echo ""

    echo -e "${YELLOW}⚠ Important:${NC}"
    echo "  1. Set SLACK_WEBHOOK_URL environment variable for Slack notifications"
    echo "  2. Configure Slack channels: #alerts-critical, #alerts-warnings, #business-alerts, #payments-alerts"
    echo "  3. Test alerts with: kubectl run test-pod --image=busybox -- sh -c 'exit 1'"
    echo "  4. View dashboard: Navigate to Dashboards > FuturaTickets - Production Overview"
    echo ""
else
    log_info "DRY RUN completed - no changes were made"
    echo ""
    log_info "To apply changes, run: $0"
    log_info "Current command: DRY_RUN=true $0"
fi

echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Deployment Complete! ✓${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

log_success "Monitoring stack deployment finished"
echo ""
