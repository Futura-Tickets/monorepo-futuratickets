#!/bin/bash

# FuturaTickets Rollback Script
# Usage: ./rollback.sh [component] [revision]
# Example: ./rollback.sh api
# Example: ./rollback.sh api 3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPONENT=${1:-api}
REVISION=${2:-}
NAMESPACE="futuratickets"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Rollback Script${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Component: ${COMPONENT}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Validate kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}✗ kubectl not found. Please install kubectl.${NC}"
    exit 1
fi

# Show rollout history
echo -e "${BLUE}Rollout history for ${COMPONENT}:${NC}"
kubectl rollout history deployment/${COMPONENT} -n ${NAMESPACE}
echo ""

# Confirm rollback
if [ -z "$REVISION" ]; then
    echo -e "${YELLOW}Rolling back to previous version...${NC}"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled.${NC}"
        exit 1
    fi

    # Rollback to previous
    kubectl rollout undo deployment/${COMPONENT} -n ${NAMESPACE}
else
    echo -e "${YELLOW}Rolling back to revision ${REVISION}...${NC}"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled.${NC}"
        exit 1
    fi

    # Rollback to specific revision
    kubectl rollout undo deployment/${COMPONENT} --to-revision=${REVISION} -n ${NAMESPACE}
fi

# Wait for rollout
echo -e "${BLUE}Waiting for rollback to complete...${NC}"
kubectl rollout status deployment/${COMPONENT} -n ${NAMESPACE}

# Verify
echo ""
echo -e "${GREEN}✓ Rollback completed successfully${NC}"
echo ""
echo -e "${BLUE}Current status:${NC}"
kubectl get deployment ${COMPONENT} -n ${NAMESPACE}
echo ""
kubectl get pods -l app=${COMPONENT} -n ${NAMESPACE}
