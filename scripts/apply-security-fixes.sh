#!/bin/bash
# ========================================
# FuturaTickets - Security Fixes Script
# ========================================
# This script applies all security fixes to a repository

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 FuturaTickets Security Fixes${NC}"
echo "=================================="
echo ""

# Detect repository type
if [ -f "nest-cli.json" ]; then
  REPO_TYPE="nestjs"
  echo -e "${GREEN}📦 NestJS API detected${NC}"
elif [ -f "next.config.mjs" ] || [ -f "next.config.js" ]; then
  REPO_TYPE="nextjs"
  echo -e "${GREEN}⚛️  Next.js App detected${NC}"
else
  echo -e "${RED}❌ Unknown repository type${NC}"
  echo "This script must be run from a NestJS or Next.js repository root"
  exit 1
fi

echo ""

# Generate JWT secret if needed
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}📝 No .env file found${NC}"
  if [ -f ".env.example" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env

    # Generate strong JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    # Add or replace JWT_SECRET_KEY in .env
    if grep -q "JWT_SECRET_KEY=" .env; then
      sed -i.backup "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET/" .env
    else
      echo "JWT_SECRET_KEY=$JWT_SECRET" >> .env
    fi

    echo -e "${GREEN}✅ Generated .env with strong JWT_SECRET_KEY${NC}"
  else
    echo -e "${YELLOW}⚠️  No .env.example found. Please create .env manually.${NC}"
  fi
else
  echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""

# Apply fixes based on repo type
if [ "$REPO_TYPE" = "nestjs" ]; then
  echo "Applying NestJS security fixes..."
  echo ""

  # Fix 1: Configure CORS in main.ts
  if [ -f "src/main.ts" ]; then
    echo "📝 Checking main.ts..."

    # Backup
    if [ ! -f "src/main.ts.backup" ]; then
      cp src/main.ts src/main.ts.backup
      echo "  ✅ Backed up main.ts"
    fi

    # Check if CORS is configured correctly
    if grep -q "app.enableCors();" src/main.ts; then
      echo -e "  ${YELLOW}⚠️  Found app.enableCors() without configuration${NC}"
      echo "  📖 Manual fix required - see SECURITY_FIXES_GUIDE.md"
    else
      echo "  ✅ CORS configuration looks good"
    fi
  fi

  # Fix 2: Check for hardcoded credentials
  echo ""
  echo "🔍 Checking for hardcoded credentials..."

  FOUND_ISSUES=0

  if grep -r "password.*:" src/ 2>/dev/null | grep -v ".spec.ts" | grep -v "interface" | grep -v "//" | head -5; then
    echo -e "  ${YELLOW}⚠️  Found potential hardcoded passwords${NC}"
    FOUND_ISSUES=1
  fi

  if grep -r "@gmail.com.*:" src/ 2>/dev/null | grep -v ".spec.ts" | grep -v "//" | head -5; then
    echo -e "  ${YELLOW}⚠️  Found potential hardcoded email credentials${NC}"
    FOUND_ISSUES=1
  fi

  if [ $FOUND_ISSUES -eq 0 ]; then
    echo "  ✅ No obvious hardcoded credentials found"
  else
    echo -e "  ${YELLOW}📖 Review these and move to environment variables${NC}"
  fi

elif [ "$REPO_TYPE" = "nextjs" ]; then
  echo "Applying Next.js security fixes..."
  echo ""

  # Fix 1: Enable TypeScript validation
  echo "📝 Checking next.config..."

  if [ -f "next.config.mjs" ]; then
    CONFIG_FILE="next.config.mjs"
  elif [ -f "next.config.js" ]; then
    CONFIG_FILE="next.config.js"
  else
    echo -e "${YELLOW}⚠️  No next.config found${NC}"
    CONFIG_FILE=""
  fi

  if [ -n "$CONFIG_FILE" ]; then
    # Backup
    if [ ! -f "$CONFIG_FILE.backup" ]; then
      cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
      echo "  ✅ Backed up $CONFIG_FILE"
    fi

    # Check for ignoreDuringBuilds
    if grep -q "ignoreDuringBuilds: true" "$CONFIG_FILE"; then
      echo -e "  ${YELLOW}⚠️  ESLint validation is disabled${NC}"
      read -p "  Enable ESLint validation? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i '' 's/ignoreDuringBuilds: true/ignoreDuringBuilds: false/g' "$CONFIG_FILE"
        echo -e "  ${GREEN}✅ Enabled ESLint validation${NC}"
      fi
    else
      echo "  ✅ ESLint validation is enabled"
    fi

    # Check for ignoreBuildErrors
    if grep -q "ignoreBuildErrors: true" "$CONFIG_FILE"; then
      echo -e "  ${YELLOW}⚠️  TypeScript validation is disabled${NC}"
      read -p "  Enable TypeScript validation? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i '' 's/ignoreBuildErrors: true/ignoreBuildErrors: false/g' "$CONFIG_FILE"
        echo -e "  ${GREEN}✅ Enabled TypeScript validation${NC}"
      fi
    else
      echo "  ✅ TypeScript validation is enabled"
    fi
  fi

  # Fix 2: Check for hardcoded API keys
  echo ""
  echo "🔍 Checking for hardcoded secrets..."

  FOUND_ISSUES=0

  if grep -r "clientId=\"[^{]" app/ 2>/dev/null | head -5; then
    echo -e "  ${YELLOW}⚠️  Found hardcoded client IDs${NC}"
    FOUND_ISSUES=1
  fi

  if grep -r "pk_live_\|sk_live_\|pk_test_\|sk_test_" app/ 2>/dev/null | head -5; then
    echo -e "  ${YELLOW}⚠️  Found hardcoded Stripe keys${NC}"
    FOUND_ISSUES=1
  fi

  if [ $FOUND_ISSUES -eq 0 ]; then
    echo "  ✅ No obvious hardcoded secrets found"
  else
    echo -e "  ${YELLOW}📖 Move these to environment variables${NC}"
  fi

  # Fix 3: Check GlobalContext
  echo ""
  echo "🔍 Checking GlobalContext..."

  if [ -f "contexts/global-context.tsx" ]; then
    if grep -q "\.\.\\.availableCountries" contexts/global-context.tsx; then
      echo -e "  ${RED}❌ Found GlobalContext spread bug${NC}"
      echo "  📖 Fix required - see SECURITY_FIXES_GUIDE.md"
    else
      echo "  ✅ GlobalContext looks good"
    fi
  fi
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ Security check complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review backup files (*.backup)"
echo "2. Update .env with your actual credentials"
echo "3. Test the application thoroughly"
echo "4. Commit changes with: git add . && git commit -m 'fix(security): apply security fixes'"
echo ""
echo "📖 For detailed manual fixes, see: SECURITY_FIXES_GUIDE.md"
