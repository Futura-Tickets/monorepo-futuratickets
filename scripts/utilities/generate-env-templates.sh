#!/bin/bash
# GENERATE .env.example FROM .env FILES
YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
echo -e "${YELLOW}====== GENERATING .env.example FILES ======${NC}\n"

find . -name ".env" -not -path "*/node_modules/*" | while read envfile; do
    examplefile="${envfile}.example"
    echo -e "${YELLOW}Processing $envfile${NC}"
    # Remove actual values, keep only keys
    sed 's/=.*/=/' "$envfile" > "$examplefile"
    echo -e "${GREEN}✓ Created $examplefile${NC}\n"
done
echo -e "${GREEN}====== COMPLETE ======${NC}"
