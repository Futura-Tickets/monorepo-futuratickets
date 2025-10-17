#!/bin/bash

# FuturaTickets Quick Start Script
# Usage: ./quick-start.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          ███████╗██╗   ██╗████████╗██╗   ██╗██████╗      ║
║          ██╔════╝██║   ██║╚══██╔══╝██║   ██║██╔══██╗     ║
║          █████╗  ██║   ██║   ██║   ██║   ██║██████╔╝     ║
║          ██╔══╝  ██║   ██║   ██║   ██║   ██║██╔══██╗     ║
║          ██║     ╚██████╔╝   ██║   ╚██████╔╝██║  ██║     ║
║          ╚═╝      ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝     ║
║                                                           ║
║                 TICKETS QUICK START                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}This script will help you set up your local development environment.${NC}"
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to report success
report_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to report error
report_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to report info
report_info() {
    echo -e "${BLUE}→${NC} $1"
}

# Function to report warning
report_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
echo ""

MISSING_DEPS=0

if command_exists node; then
    NODE_VERSION=$(node --version)
    report_success "Node.js is installed: ${NODE_VERSION}"
else
    report_error "Node.js is not installed. Please install Node.js 20+ first."
    MISSING_DEPS=$((MISSING_DEPS + 1))
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    report_success "npm is installed: v${NPM_VERSION}"
else
    report_error "npm is not installed. Please install npm first."
    MISSING_DEPS=$((MISSING_DEPS + 1))
fi

if command_exists git; then
    GIT_VERSION=$(git --version)
    report_success "git is installed: ${GIT_VERSION}"
else
    report_error "git is not installed. Please install git first."
    MISSING_DEPS=$((MISSING_DEPS + 1))
fi

if [ $MISSING_DEPS -gt 0 ]; then
    echo ""
    report_error "Please install missing dependencies and run this script again."
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
echo ""

if npm run bootstrap; then
    report_success "Workspace bootstrap completed"
else
    report_warning "npm workspaces bootstrap failed, falling back to per-project install"

    PROJECTS=(
        "futura-tickets-admin-api:Backend API"
        "futura-tickets-admin:Admin Frontend"
        "futura-market-place-v2:Marketplace Frontend"
    )

    for project_info in "${PROJECTS[@]}"; do
        IFS=':' read -r project_dir project_name <<< "$project_info"

        if [ -d "$project_dir" ]; then
            echo -e "${BLUE}Installing dependencies for ${project_name}...${NC}"

            cd "$project_dir"

            if [ -f "package.json" ]; then
                if [ -d "node_modules" ]; then
                    report_info "Dependencies already installed in ${project_dir}/, skipping..."
                else
                    npm install
                    if [ $? -eq 0 ]; then
                        report_success "Dependencies installed for ${project_name}"
                    else
                        report_error "Failed to install dependencies for ${project_name}"
                    fi
                fi
            else
                report_warning "No package.json found in ${project_dir}/"
            fi

            cd - > /dev/null
            echo ""
        else
            report_warning "Directory ${project_dir}/ not found"
            echo ""
        fi
    done
fi

# Setup environment files
echo -e "${BLUE}Step 3: Setting up environment files...${NC}"
echo ""

ENV_FILES=(
    "futura-tickets-admin-api/.env:futura-tickets-admin-api/.env.example"
    "futura-tickets-admin/.env.local:futura-tickets-admin/.env.local.example"
    "futura-market-place-v2/.env.local:futura-market-place-v2/.env.local.example"
)

for env_info in "${ENV_FILES[@]}"; do
    IFS=':' read -r env_file example_file <<< "$env_info"

    if [ -f "$env_file" ]; then
        report_info "Environment file ${env_file} already exists, skipping..."
    elif [ -f "$example_file" ]; then
        cp "$example_file" "$env_file"
        report_success "Created ${env_file} from ${example_file}"
        report_warning "Please edit ${env_file} with your credentials!"
    else
        report_warning "Example file ${example_file} not found"
    fi
done

echo ""
echo -e "${BLUE}Step 4: Summary${NC}"
echo ""

# Show next steps
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚠ IMPORTANT: Configure your environment variables before starting!${NC}"
echo ""

echo -e "${BLUE}Environment files to configure:${NC}"
echo -e "  1. futura-tickets-admin-api/.env"
echo -e "     - MongoDB connection (MONGODB_URI)"
echo -e "     - Redis connection (REDIS_HOST, REDIS_PORT)"
echo -e "     - JWT secret (JWT_SECRET)"
echo -e "     - Stripe keys (STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY)"
echo -e "     - Sentry DSN (SENTRY_DSN)"
echo ""
echo -e "  2. futura-tickets-admin/.env.local"
echo -e "     - API URL (NEXT_PUBLIC_API_URL)"
echo -e "     - Sentry configuration"
echo -e "     - Google Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID)"
echo ""
echo -e "  3. futura-market-place-v2/.env.local"
echo -e "     - API URL (NEXT_PUBLIC_API_URL)"
echo -e "     - Sentry configuration"
echo -e "     - Stripe public key (NEXT_PUBLIC_STRIPE_PUBLIC_KEY)"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  ${MAGENTA}1. Start MongoDB (local or use Atlas):${NC}"
echo -e "     Docker: docker run -d -p 27017:27017 --name mongodb mongo:7.0"
echo -e "     Or configure MongoDB Atlas connection string"
echo ""
echo -e "  ${MAGENTA}2. Start Redis (optional, for Bull queues):${NC}"
echo -e "     Docker: docker run -d -p 6379:6379 --name redis redis:7"
echo ""
echo -e "  ${MAGENTA}3. Start Backend API:${NC}"
echo -e "     cd futura-tickets-admin-api"
echo -e "     PORT=4101 npm run start:dev"
echo ""
echo -e "  ${MAGENTA}4. Start Admin Frontend (in a new terminal):${NC}"
echo -e "     cd futura-tickets-admin"
echo -e "     npm run dev"
echo ""
echo -e "  ${MAGENTA}5. Start Marketplace Frontend (in a new terminal):${NC}"
echo -e "     cd futura-market-place-v2"
echo -e "     npm run dev"
echo ""
echo -e "  ${MAGENTA}6. Access the applications:${NC}"
echo -e "     Backend API:        http://localhost:4101"
echo -e "     Admin Frontend:     http://localhost:3003"
echo -e "     Marketplace:        http://localhost:3000"
echo ""

echo -e "${BLUE}Useful scripts:${NC}"
echo -e "  npm run bootstrap  - Instala dependencias de todas las apps via workspaces"
echo -e "  ./start-all.sh      - Start all services"
echo -e "  ./stop-all.sh       - Stop all services"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo -e "  README.md               - Project overview"
echo -e "  SETUP_GUIDE.md          - Detailed setup guide"
echo -e "  DEPLOYMENT_COMPLETE.md  - Deployment guide"
echo -e "  ARCHITECTURE_OVERVIEW.md - Architecture documentation"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
