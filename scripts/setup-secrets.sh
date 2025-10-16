#!/bin/bash

# FuturaTickets Secrets Setup Script
# Usage: ./setup-secrets.sh [environment]
# Example: ./setup-secrets.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-staging}
NAMESPACE="futuratickets"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Secrets Setup${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

echo -e "${RED}IMPORTANT: This script will prompt you for sensitive credentials.${NC}"
echo -e "${RED}Make sure you have all required credentials ready.${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled.${NC}"
    exit 1
fi

# MongoDB credentials
echo -e "${BLUE}MongoDB Credentials:${NC}"
read -p "MongoDB username [admin]: " MONGO_USER
MONGO_USER=${MONGO_USER:-admin}
read -sp "MongoDB password: " MONGO_PASSWORD
echo ""

kubectl create secret generic mongodb-secret \
  --namespace=${NAMESPACE} \
  --from-literal=username=${MONGO_USER} \
  --from-literal=password=${MONGO_PASSWORD} \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ MongoDB secret created${NC}"
echo ""

# Redis credentials
echo -e "${BLUE}Redis Credentials:${NC}"
read -sp "Redis password: " REDIS_PASSWORD
echo ""

kubectl create secret generic redis-secret \
  --namespace=${NAMESPACE} \
  --from-literal=password=${REDIS_PASSWORD} \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ Redis secret created${NC}"
echo ""

# API secrets
echo -e "${BLUE}API Secrets:${NC}"
read -sp "JWT Secret: " JWT_SECRET
echo ""
read -sp "Stripe Secret Key: " STRIPE_SECRET_KEY
echo ""
read -sp "Stripe Public Key: " STRIPE_PUBLIC_KEY
echo ""
read -sp "Stripe Webhook Secret: " STRIPE_WEBHOOK_SECRET
echo ""
read -p "Azure Storage Connection String: " AZURE_STORAGE_CONNECTION
echo ""
read -p "Sentry DSN (optional): " SENTRY_DSN
echo ""

MONGO_URL="mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/futura-tickets?authSource=admin"

kubectl create secret generic api-secret \
  --namespace=${NAMESPACE} \
  --from-literal=mongo-url="${MONGO_URL}" \
  --from-literal=jwt-secret="${JWT_SECRET}" \
  --from-literal=stripe-secret-key="${STRIPE_SECRET_KEY}" \
  --from-literal=stripe-public-key="${STRIPE_PUBLIC_KEY}" \
  --from-literal=stripe-webhook-secret="${STRIPE_WEBHOOK_SECRET}" \
  --from-literal=azure-storage-connection="${AZURE_STORAGE_CONNECTION}" \
  --from-literal=sentry-dsn="${SENTRY_DSN}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ API secret created${NC}"
echo ""

# Admin secrets
echo -e "${BLUE}Admin Frontend Secrets:${NC}"
read -p "Google Client ID: " GOOGLE_CLIENT_ID
echo ""

kubectl create secret generic admin-secret \
  --namespace=${NAMESPACE} \
  --from-literal=google-client-id="${GOOGLE_CLIENT_ID}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ Admin secret created${NC}"
echo ""

# Grafana secrets
echo -e "${BLUE}Grafana Credentials:${NC}"
read -p "Grafana admin username [admin]: " GRAFANA_USER
GRAFANA_USER=${GRAFANA_USER:-admin}
read -sp "Grafana admin password: " GRAFANA_PASSWORD
echo ""

kubectl create secret generic grafana-secret \
  --namespace=${NAMESPACE} \
  --from-literal=admin-user=${GRAFANA_USER} \
  --from-literal=admin-password=${GRAFANA_PASSWORD} \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ Grafana secret created${NC}"
echo ""

# GitHub Container Registry credentials
echo -e "${BLUE}GitHub Container Registry:${NC}"
read -p "GitHub username: " GITHUB_USER
read -sp "GitHub token (PAT): " GITHUB_TOKEN
echo ""
read -p "GitHub email: " GITHUB_EMAIL

kubectl create secret docker-registry ghcr-secret \
  --namespace=${NAMESPACE} \
  --docker-server=ghcr.io \
  --docker-username=${GITHUB_USER} \
  --docker-password=${GITHUB_TOKEN} \
  --docker-email=${GITHUB_EMAIL} \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ GitHub Container Registry secret created${NC}"
echo ""

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}All secrets created successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}To verify:${NC}"
echo -e "  kubectl get secrets -n ${NAMESPACE}"
