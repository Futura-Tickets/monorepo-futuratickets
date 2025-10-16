#!/bin/bash

# FuturaTickets Image Update Script
# Usage: ./update-image.sh [component] [image-tag]
# Example: ./update-image.sh api main-abc123
# Example: ./update-image.sh admin v1.2.3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPONENT=${1}
IMAGE_TAG=${2}
NAMESPACE="${KUBE_NAMESPACE:-futuratickets}"
REGISTRY="${REGISTRY:-ghcr.io}"
GITHUB_USERNAME="${GITHUB_USERNAME:-$(git config user.name | tr '[:upper:]' '[:lower:]' | tr ' ' '-')}"
REPO="${REGISTRY_NAMESPACE:-${GITHUB_USERNAME}}/futuratickets"

if [ -z "$COMPONENT" ] || [ -z "$IMAGE_TAG" ]; then
    echo -e "${RED}Usage: ./update-image.sh [component] [image-tag]${NC}"
    echo -e "${YELLOW}Example: ./update-image.sh api main-abc123${NC}"
    exit 1
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Image Update${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Component: ${COMPONENT}${NC}"
echo -e "${YELLOW}Image Tag: ${IMAGE_TAG}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Build image URL
IMAGE="${REGISTRY}/${REPO}-${COMPONENT}:${IMAGE_TAG}"
echo -e "${BLUE}New image: ${IMAGE}${NC}"
echo ""

# Confirm update
read -p "Update deployment with this image? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Update cancelled.${NC}"
    exit 1
fi

# Update image
echo -e "${BLUE}Updating image...${NC}"
kubectl set image deployment/${COMPONENT} ${COMPONENT}=${IMAGE} -n ${NAMESPACE}

# Wait for rollout
echo -e "${BLUE}Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/${COMPONENT} -n ${NAMESPACE}

# Verify
echo ""
echo -e "${GREEN}✓ Image updated successfully${NC}"
echo ""
echo -e "${BLUE}Current status:${NC}"
kubectl get deployment ${COMPONENT} -n ${NAMESPACE}
echo ""
kubectl get pods -l app=${COMPONENT} -n ${NAMESPACE}
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo -e "  kubectl logs -f deployment/${COMPONENT} -n ${NAMESPACE}"
