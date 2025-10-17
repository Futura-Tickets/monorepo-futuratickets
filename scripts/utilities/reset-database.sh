#!/bin/bash
# RESET DATABASE - Reset de base de datos de desarrollo
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'

echo -e "${RED}⚠️  WARNING: This will DELETE all data in development database${NC}"
echo -e "${YELLOW}Only use for local development!${NC}\n"
read -p "Type 'RESET' to confirm: " CONFIRM

[ "$CONFIRM" != "RESET" ] && { echo "Aborted"; exit 1; }

echo -e "${YELLOW}Connecting to MongoDB...${NC}"
# Require mongosh or mongo command
if command -v mongosh &>/dev/null; then
    MONGO_CMD="mongosh"
elif command -v mongo &>/dev/null; then
    MONGO_CMD="mongo"
else
    echo -e "${RED}MongoDB shell not found${NC}"
    exit 1
fi

# Drop database
$MONGO_CMD --eval 'db.dropDatabase()' futuratickets
echo -e "${GREEN}✓ Database reset complete${NC}"
echo -e "${YELLOW}Tip: Re-seed database with test data${NC}"
