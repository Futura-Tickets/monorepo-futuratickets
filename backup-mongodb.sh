#!/bin/bash

# ========================================
# FuturaTickets - MongoDB Backup Script
# ========================================
# Creates a backup of the MongoDB database
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="futuratickets_backup_${TIMESTAMP}"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USER="futuraadmin"
MONGO_PASS="futurapass123"
MONGO_DB="futuratickets"

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║           💾 MONGODB BACKUP SCRIPT 💾                    ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo ""
echo -e "${YELLOW}Backup Configuration:${NC}"
echo -e "  Database:   $MONGO_DB"
echo -e "  Host:       $MONGO_HOST:$MONGO_PORT"
echo -e "  Backup Dir: $BACKUP_DIR"
echo -e "  Backup Name: $BACKUP_NAME"
echo ""

# Check if mongodump is available
if ! command -v mongodump &> /dev/null; then
    echo -e "${RED}❌ Error: mongodump is not installed${NC}"
    echo -e "${YELLOW}Install with: brew install mongodb-database-tools${NC}"
    exit 1
fi

echo -e "${CYAN}→ Starting backup...${NC}"

# Create backup
mongodump \
    --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin" \
    --out="${BACKUP_DIR}/${BACKUP_NAME}"

echo ""
echo -e "${GREEN}✓ Backup completed successfully!${NC}"

# Compress backup
echo -e "${CYAN}→ Compressing backup...${NC}"
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd - > /dev/null

BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
echo -e "${GREEN}✓ Backup compressed: ${BACKUP_SIZE}${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BACKUP COMPLETED${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Backup Location:${NC}"
echo -e "  ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo ""
echo -e "${CYAN}Restore Command:${NC}"
echo -e "  ./restore-mongodb.sh ${BACKUP_NAME}.tar.gz"
echo ""

# List recent backups
echo -e "${CYAN}Recent Backups:${NC}"
ls -lht "$BACKUP_DIR" | head -n 6

# Cleanup old backups (keep last 10)
echo ""
echo -e "${YELLOW}→ Cleaning up old backups (keeping last 10)...${NC}"
cd "$BACKUP_DIR"
ls -t *.tar.gz | tail -n +11 | xargs -r rm
cd - > /dev/null
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo ""
