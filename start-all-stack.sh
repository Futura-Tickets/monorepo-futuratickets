#!/bin/bash

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   FUTURA TICKETS - Full Stack Startup        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}This script will start ALL services:${NC}"
echo -e "  • 3 Backend APIs (ports 3002, 3004, 3005)"
echo -e "  • 3 Frontend Apps (ports 3000, 3001, 3007)"
echo -e "  • Hardhat Node (port 8545)"
echo -e ""
echo -e "${YELLOW}⚠️  This requires 7 separate terminal windows${NC}"
echo -e "${YELLOW}⚠️  Recommended: Use tmux for better management${NC}\n"

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo -e "\n${GREEN}Starting services...${NC}\n"

# OPTION 1: Simple background mode (all in one terminal, messy logs)
# ./start-all-backends.sh &
# ./start-blockchain.sh &
# ./start-all-frontends.sh &

# OPTION 2: tmux mode (recommended)
echo -e "${CYAN}Creating tmux session 'futura-stack'...${NC}"

tmux new-session -d -s futura-stack -n "backends" "./start-all-backends.sh"
tmux new-window -t futura-stack: -n "blockchain" "./start-blockchain.sh"
tmux new-window -t futura-stack: -n "frontends" "./start-all-frontends.sh"
tmux new-window -t futura-stack: -n "monitor" "watch -n 5 ./check-all-services.sh"

echo -e "${GREEN}✓ tmux session 'futura-stack' created${NC}"
echo -e "\nTo attach: ${YELLOW}tmux attach -t futura-stack${NC}"
echo -e "To detach: ${YELLOW}Ctrl+B then D${NC}"
echo -e "To kill session: ${YELLOW}tmux kill-session -t futura-stack${NC}"
echo -e "\nNavigate windows: ${YELLOW}Ctrl+B then 0/1/2/3${NC}"
