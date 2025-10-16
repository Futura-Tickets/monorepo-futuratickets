#!/bin/bash

# FuturaTickets MongoDB Backup Script
# Usage: ./backup-mongodb.sh [output-dir]
# Example: ./backup-mongodb.sh ./backups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

OUTPUT_DIR=${1:-./backups}
NAMESPACE="futuratickets"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="mongodb-backup-${TIMESTAMP}"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets MongoDB Backup${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Output: ${OUTPUT_DIR}/${BACKUP_NAME}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Create output directory
mkdir -p ${OUTPUT_DIR}

# Get MongoDB credentials
echo -e "${BLUE}Retrieving MongoDB credentials...${NC}"
MONGO_USER=$(kubectl get secret mongodb-secret -n ${NAMESPACE} -o jsonpath='{.data.username}' | base64 -d)
MONGO_PASSWORD=$(kubectl get secret mongodb-secret -n ${NAMESPACE} -o jsonpath='{.data.password}' | base64 -d)

# Create backup pod
echo -e "${BLUE}Creating backup pod...${NC}"
kubectl run ${BACKUP_NAME} \
  --image=mongo:7.0 \
  --restart=Never \
  --namespace=${NAMESPACE} \
  --command -- /bin/sh -c \
  "mongodump --host=mongodb --username=${MONGO_USER} --password=${MONGO_PASSWORD} --authenticationDatabase=admin --out=/backup"

# Wait for backup to complete
echo -e "${BLUE}Waiting for backup to complete...${NC}"
kubectl wait --for=condition=Ready pod/${BACKUP_NAME} -n ${NAMESPACE} --timeout=60s || true
sleep 5

# Check if backup completed
POD_STATUS=$(kubectl get pod ${BACKUP_NAME} -n ${NAMESPACE} -o jsonpath='{.status.phase}')
if [ "$POD_STATUS" != "Succeeded" ]; then
    echo -e "${YELLOW}Backup pod status: ${POD_STATUS}${NC}"
    echo -e "${YELLOW}Waiting for completion...${NC}"
    kubectl wait --for=condition=Complete job/${BACKUP_NAME} -n ${NAMESPACE} --timeout=300s || true
fi

# Copy backup from pod
echo -e "${BLUE}Copying backup files...${NC}"
kubectl cp ${NAMESPACE}/${BACKUP_NAME}:/backup ${OUTPUT_DIR}/${BACKUP_NAME}

# Clean up backup pod
echo -e "${BLUE}Cleaning up...${NC}"
kubectl delete pod ${BACKUP_NAME} -n ${NAMESPACE}

# Verify backup
if [ -d "${OUTPUT_DIR}/${BACKUP_NAME}" ]; then
    BACKUP_SIZE=$(du -sh ${OUTPUT_DIR}/${BACKUP_NAME} | cut -f1)
    echo ""
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo -e "${BLUE}Location: ${OUTPUT_DIR}/${BACKUP_NAME}${NC}"
    echo -e "${BLUE}Size: ${BACKUP_SIZE}${NC}"
    echo ""
    echo -e "${BLUE}To restore this backup:${NC}"
    echo -e "  ./restore-mongodb.sh ${OUTPUT_DIR}/${BACKUP_NAME}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi
