#!/bin/bash

# Futura Tickets - Start All Services
# This script starts Admin API, Admin Panel, and Marketplace

set -e

echo "🚀 Starting Futura Tickets..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p logs

# Start Admin API
echo -e "${BLUE}[1/3] Starting Admin API (port 4101)...${NC}"
cd futura-tickets-admin-api
PORT=4101 npm run start:dev > ../logs/admin-api.log 2>&1 &
API_PID=$!
echo "✅ Admin API started (PID: $API_PID)"
echo ""

# Wait 5 seconds for API to be ready
sleep 5

# Start Admin Panel
echo -e "${BLUE}[2/3] Starting Admin Panel (port 3003)...${NC}"
cd ../futura-tickets-admin
npm run dev > ../logs/admin-panel.log 2>&1 &
PANEL_PID=$!
echo "✅ Admin Panel started (PID: $PANEL_PID)"
echo ""

# Start Marketplace
echo -e "${BLUE}[3/3] Starting Marketplace (port 3000)...${NC}"
cd ../futura-market-place-v2
npm run dev > ../logs/marketplace.log 2>&1 &
MARKETPLACE_PID=$!
echo "✅ Marketplace started (PID: $MARKETPLACE_PID)"
echo ""

echo -e "${GREEN}🎉 All services started!${NC}"
echo ""
echo "📍 URLs:"
echo "   Admin API:       http://localhost:4101"
echo "   Admin API Docs:  http://localhost:4101/api/docs"
echo "   Admin Panel:     http://localhost:3003"
echo "   Marketplace:     http://localhost:3000"
echo ""
echo "📝 Logs in ./logs/ directory"
echo "⚠️  To stop all services, run: ./stop-all.sh"
echo ""

# Save PIDs to file for stop script
cd ..
echo "$API_PID" > logs/pids.txt
echo "$PANEL_PID" >> logs/pids.txt
echo "$MARKETPLACE_PID" >> logs/pids.txt
