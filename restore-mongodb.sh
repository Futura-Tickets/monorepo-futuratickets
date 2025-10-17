#!/bin/bash

# ========================================
# FuturaTickets - MongoDB Restore Script
# ========================================
# Restores a MongoDB backup
# Usage: ./restore-mongodb.sh <backup_file.tar.gz>
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups/mongodb"
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_USER="futuraadmin"
MONGO_PASS="futurapass123"
MONGO_DB="futuratickets"

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║          ♻️  MONGODB RESTORE SCRIPT ♻️                   ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check argument
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./restore-mongodb.sh <backup_file.tar.gz>"
    echo ""
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lht "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found${NC}"
    echo -e "  Looked in: $BACKUP_DIR/$BACKUP_FILE"
    echo -e "  And: $BACKUP_FILE"
    exit 1
fi

# Use full path if not in backup dir
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_PATH="$BACKUP_FILE"
else
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
fi

echo ""
echo -e "${YELLOW}⚠️  WARNING: This will OVERWRITE the current database!${NC}"
echo -e "${YELLOW}Database: $MONGO_DB${NC}"
echo -e "${YELLOW}Backup:   $BACKUP_PATH${NC}"
echo ""
echo -e "${RED}Do you want to continue? (yes/no)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Restore cancelled by user${NC}"
    exit 0
fi

# Check if mongorestore is available
if ! command -v mongorestore &> /dev/null; then
    echo -e "${RED}❌ Error: mongorestore is not installed${NC}"
    echo -e "${YELLOW}Install with: brew install mongodb-database-tools${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}→ Extracting backup...${NC}"

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Extract backup
tar -xzf "$BACKUP_PATH" -C "$TEMP_DIR"

# Find the backup directory
BACKUP_DATA_DIR=$(find "$TEMP_DIR" -type d -name "$MONGO_DB" | head -n 1)

if [ -z "$BACKUP_DATA_DIR" ]; then
    echo -e "${RED}❌ Error: Could not find backup data${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backup extracted${NC}"

echo ""
echo -e "${CYAN}→ Dropping existing database...${NC}"

mongosh "mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin" \
    --eval "db.dropDatabase()" > /dev/null

echo -e "${GREEN}✓ Database dropped${NC}"

echo ""
echo -e "${CYAN}→ Restoring backup...${NC}"

mongorestore \
    --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin" \
    --nsInclude="${MONGO_DB}.*" \
    "$BACKUP_DATA_DIR"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ RESTORE COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Database Collections:${NC}"
mongosh "mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin" \
    --eval "db.getCollectionNames()"
echo ""
