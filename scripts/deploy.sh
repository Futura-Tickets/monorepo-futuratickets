#!/bin/bash

# FuturaTickets Deployment Script
# Usage: ./deploy.sh [environment] [component]
# Example: ./deploy.sh production all
# Example: ./deploy.sh staging api

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment
ENVIRONMENT=${1:-staging}
COMPONENT=${2:-all}
NAMESPACE="futuratickets"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Component: ${COMPONENT}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Validate kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}✗ kubectl not found. Please install kubectl.${NC}"
    exit 1
fi

# Validate current context
CURRENT_CONTEXT=$(kubectl config current-context)
echo -e "${BLUE}Current context: ${CURRENT_CONTEXT}${NC}"
read -p "Continue with this context? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 1
fi

# Deploy function
deploy_component() {
    local component=$1
    echo -e "${BLUE}Deploying ${component}...${NC}"

    case $component in
        "namespace")
            kubectl apply -f k8s/namespace.yml
            ;;
        "mongodb")
            kubectl apply -f k8s/mongodb/pvc.yml
            kubectl apply -f k8s/mongodb/secret.yml
            kubectl apply -f k8s/mongodb/deployment.yml
            kubectl apply -f k8s/mongodb/service.yml
            kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s || true
            ;;
        "redis")
            kubectl apply -f k8s/redis/pvc.yml
            kubectl apply -f k8s/redis/secret.yml
            kubectl apply -f k8s/redis/deployment.yml
            kubectl apply -f k8s/redis/service.yml
            kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s || true
            ;;
        "api")
            kubectl apply -f k8s/api/secret.yml
            kubectl apply -f k8s/api/deployment.yml
            kubectl apply -f k8s/api/service.yml
            kubectl apply -f k8s/api/hpa.yml
            kubectl wait --for=condition=ready pod -l app=api -n $NAMESPACE --timeout=300s || true
            ;;
        "admin")
            kubectl apply -f k8s/admin/secret.yml
            kubectl apply -f k8s/admin/deployment.yml
            kubectl apply -f k8s/admin/service.yml
            kubectl wait --for=condition=ready pod -l app=admin -n $NAMESPACE --timeout=300s || true
            ;;
        "marketplace")
            kubectl apply -f k8s/marketplace/deployment.yml
            kubectl apply -f k8s/marketplace/service.yml
            kubectl wait --for=condition=ready pod -l app=marketplace -n $NAMESPACE --timeout=300s || true
            ;;
        "prometheus")
            kubectl apply -f k8s/prometheus/rbac.yml
            kubectl apply -f k8s/prometheus/configmap.yml
            kubectl apply -f k8s/prometheus/pvc.yml
            kubectl apply -f k8s/prometheus/deployment.yml
            kubectl apply -f k8s/prometheus/service.yml
            kubectl wait --for=condition=ready pod -l app=prometheus -n $NAMESPACE --timeout=300s || true
            ;;
        "grafana")
            kubectl apply -f k8s/grafana/secret.yml
            kubectl apply -f k8s/grafana/configmap.yml
            kubectl apply -f k8s/grafana/pvc.yml
            kubectl apply -f k8s/grafana/deployment.yml
            kubectl apply -f k8s/grafana/service.yml
            kubectl wait --for=condition=ready pod -l app=grafana -n $NAMESPACE --timeout=300s || true
            ;;
        "alertmanager")
            kubectl apply -f k8s/alertmanager/configmap.yml
            kubectl apply -f k8s/alertmanager/pvc.yml
            kubectl apply -f k8s/alertmanager/deployment.yml
            kubectl apply -f k8s/alertmanager/service.yml
            kubectl wait --for=condition=ready pod -l app=alertmanager -n $NAMESPACE --timeout=300s || true
            ;;
        "ingress")
            kubectl apply -f k8s/ingress/certificate.yml
            kubectl apply -f k8s/ingress/ingress.yml
            ;;
        *)
            echo -e "${RED}✗ Unknown component: ${component}${NC}"
            exit 1
            ;;
    esac

    echo -e "${GREEN}✓ ${component} deployed successfully${NC}"
}

# Deploy based on component selection
if [ "$COMPONENT" == "all" ]; then
    echo -e "${BLUE}Deploying all components...${NC}"

    # Deploy in correct order
    deploy_component "namespace"
    deploy_component "mongodb"
    deploy_component "redis"
    deploy_component "api"
    deploy_component "admin"
    deploy_component "marketplace"
    deploy_component "prometheus"
    deploy_component "grafana"
    deploy_component "alertmanager"
    deploy_component "ingress"

elif [ "$COMPONENT" == "monitoring" ]; then
    echo -e "${BLUE}Deploying monitoring stack...${NC}"
    deploy_component "prometheus"
    deploy_component "grafana"
    deploy_component "alertmanager"

elif [ "$COMPONENT" == "apps" ]; then
    echo -e "${BLUE}Deploying application components...${NC}"
    deploy_component "api"
    deploy_component "admin"
    deploy_component "marketplace"

elif [ "$COMPONENT" == "infra" ]; then
    echo -e "${BLUE}Deploying infrastructure components...${NC}"
    deploy_component "namespace"
    deploy_component "mongodb"
    deploy_component "redis"

else
    deploy_component "$COMPONENT"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}To check status:${NC}"
echo -e "  kubectl get pods -n $NAMESPACE"
echo -e "  kubectl get svc -n $NAMESPACE"
echo -e "  kubectl get ingress -n $NAMESPACE"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo -e "  kubectl logs -f deployment/api -n $NAMESPACE"
echo -e "  kubectl logs -f deployment/admin -n $NAMESPACE"
echo -e "  kubectl logs -f deployment/marketplace -n $NAMESPACE"
