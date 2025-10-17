#!/bin/bash

# BACKUP ENV FILES
# Crea backup encriptado de archivos .env
# Uso: ./backup-env-files.sh [password]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKUP_DIR=".env-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/env-backup-${TIMESTAMP}.tar.gz"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  ENV FILES BACKUP${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Add to .gitignore if not present
if ! grep -q "^\.env-backups/$" .gitignore 2>/dev/null; then
    echo ".env-backups/" >> .gitignore
    echo -e "${GREEN}✓ Added .env-backups/ to .gitignore${NC}"
fi

echo -e "${YELLOW}Finding .env files...${NC}"

# Find all .env files
ENV_FILES=$(find . -name ".env" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*")

if [ -z "$ENV_FILES" ]; then
    echo -e "${RED}No .env files found${NC}"
    exit 1
fi

COUNT=$(echo "$ENV_FILES" | wc -l | tr -d ' ')
echo -e "${GREEN}Found $COUNT .env files:${NC}"
echo "$ENV_FILES" | sed 's/^/  /'
echo ""

# Create tar.gz backup
echo -e "${YELLOW}Creating backup...${NC}"
echo "$ENV_FILES" | tar -czf "$BACKUP_FILE" -T -

if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE ($SIZE)${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Optional encryption
if [ -n "$1" ]; then
    echo -e "${YELLOW}Encrypting backup with password...${NC}"
    if command -v openssl &> /dev/null; then
        openssl enc -aes-256-cbc -salt -pbkdf2 -in "$BACKUP_FILE" -out "${BACKUP_FILE}.enc" -k "$1"
        rm "$BACKUP_FILE"
        echo -e "${GREEN}✓ Encrypted backup: ${BACKUP_FILE}.enc${NC}"
        BACKUP_FILE="${BACKUP_FILE}.enc"
    else
        echo -e "${YELLOW}⚠️  openssl not found, skipping encryption${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Backup location:${NC} $BACKUP_FILE"
echo ""
echo -e "${YELLOW}To restore:${NC}"
if [[ "$BACKUP_FILE" == *.enc ]]; then
    echo "  1. Decrypt: openssl enc -aes-256-cbc -d -pbkdf2 -in $BACKUP_FILE -out backup.tar.gz -k PASSWORD"
    echo "  2. Extract: tar -xzf backup.tar.gz"
else
    echo "  tar -xzf $BACKUP_FILE"
fi
echo ""
echo -e "${RED}⚠️  IMPORTANT:${NC} Store this backup securely!"
echo -e "   Never commit to git or share publicly."
