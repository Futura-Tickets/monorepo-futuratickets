#!/bin/bash

# FuturaTickets Health Check Script
# Usage: ./health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE="futuratickets"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Health Check${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check pods
echo -e "${BLUE}Pod Status:${NC}"
kubectl get pods -n ${NAMESPACE} -o wide
echo ""

# Check unhealthy pods
UNHEALTHY=$(kubectl get pods -n ${NAMESPACE} --field-selector=status.phase!=Running,status.phase!=Succeeded --no-headers | wc -l)
if [ "$UNHEALTHY" -gt 0 ]; then
    echo -e "${RED}✗ ${UNHEALTHY} unhealthy pod(s) detected${NC}"
    kubectl get pods -n ${NAMESPACE} --field-selector=status.phase!=Running,status.phase!=Succeeded
else
    echo -e "${GREEN}✓ All pods healthy${NC}"
fi
echo ""

# Check services
echo -e "${BLUE}Service Status:${NC}"
kubectl get svc -n ${NAMESPACE}
echo ""

# Check ingress
echo -e "${BLUE}Ingress Status:${NC}"
kubectl get ingress -n ${NAMESPACE}
echo ""

# Check HPA
echo -e "${BLUE}HPA Status:${NC}"
kubectl get hpa -n ${NAMESPACE}
echo ""

# Check PVC
echo -e "${BLUE}PVC Status:${NC}"
kubectl get pvc -n ${NAMESPACE}
echo ""

# Check recent events
echo -e "${BLUE}Recent Events (last 10):${NC}"
kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' | tail -10
echo ""

# Resource usage
echo -e "${BLUE}Resource Usage:${NC}"
kubectl top pods -n ${NAMESPACE} 2>/dev/null || echo -e "${YELLOW}Metrics server not available${NC}"
echo ""

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Health check completed${NC}"
echo -e "${BLUE}======================================${NC}"
