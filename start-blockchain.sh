#!/bin/bash

MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  BLOCKCHAIN - Starting Hardhat Node${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${MAGENTA}[HARDHAT]${NC} Starting local Ethereum node on port 8545..."
echo -e "${GREEN}Network:${NC} Hardhat Local"
echo -e "${GREEN}Chain ID:${NC} 31337"
echo -e "${GREEN}Accounts:${NC} 20 pre-funded accounts will be generated"
echo -e "\n${GREEN}Press Ctrl+C to stop${NC}\n"

cd futura-tickets-contracts-v2
npx hardhat node
