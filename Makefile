# FuturaTickets Monorepo - Makefile
# Quick commands for common operations

.PHONY: help install clean test lint build dev health-check security-audit submodules

# Default target
help: ## Show this help message
	@echo "FuturaTickets Monorepo - Available Commands"
	@echo "==========================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install --legacy-peer-deps

clean: ## Clean node_modules and build artifacts
	@echo "🧹 Cleaning..."
	rm -rf node_modules
	rm -rf futura-*/node_modules
	rm -rf dist build .next out
	@echo "✓ Clean complete"

test: ## Run all tests
	@echo "🧪 Running tests..."
	npm run test --workspaces --if-present

test-coverage: ## Run tests with coverage
	@echo "📊 Running tests with coverage..."
	npm run test:cov --workspaces --if-present

lint: ## Run linting on all workspaces
	@echo "🔍 Linting..."
	npm run lint --workspaces --if-present

lint-fix: ## Auto-fix linting errors
	@echo "🔧 Auto-fixing linting errors..."
	npm run lint --workspaces --if-present -- --fix

build: ## Build all workspaces
	@echo "🏗️ Building..."
	npm run build --workspaces --if-present

# Development
dev-infra: ## Start infrastructure (MongoDB, Redis)
	@echo "🚀 Starting infrastructure..."
	@./start-infra.sh

dev-backends: ## Start all backend APIs
	@echo "🚀 Starting backend APIs..."
	@./start-all-backends.sh

dev-frontends: ## Start all frontend apps
	@echo "🚀 Starting frontend apps..."
	@./start-all-frontends.sh

dev-all: ## Start all services (infra + backends + frontends)
	@echo "🚀 Starting all services..."
	@./start-all-stack.sh

# Health & Monitoring
health-check: ## Run health check on all services
	@./scripts/health-check-all.sh

health-backends: ## Check backend APIs health
	@./healthcheck-backends.sh

# Security
security-audit: ## Run npm audit
	@echo "🔒 Running security audit..."
	npm audit --audit-level=moderate

security-fix: ## Apply safe security fixes
	@echo "🔒 Applying security fixes..."
	npm audit fix --legacy-peer-deps

security-report: ## Show security report
	@echo "📋 Security Report:"
	@cat SECURITY.md | head -50

# Git operations
submodules: ## Update all git submodules
	@echo "🔄 Updating submodules..."
	git submodule update --init --recursive --remote

submodules-status: ## Show submodules status
	@git submodule status

# Utilities
ports: ## Show which ports are in use
	@echo "🔌 Ports in use:"
	@lsof -iTCP -sTCP:LISTEN -n -P | grep -E ":(3000|3002|3003|3004|3005|3006|27017|6379)" || echo "No services running"

docker-up: ## Start Docker Compose infrastructure
	@echo "🐳 Starting Docker containers..."
	docker-compose -f docker-compose.infra.yml up -d

docker-down: ## Stop Docker Compose infrastructure
	@echo "🐳 Stopping Docker containers..."
	docker-compose -f docker-compose.infra.yml down

docker-logs: ## Show Docker logs
	docker-compose -f docker-compose.infra.yml logs -f

# Workspace-specific commands
admin-api: ## Start admin API only
	@cd futura-tickets-admin-api && PORT=3002 npm run start:dev

marketplace-api: ## Start marketplace API only
	@cd futura-market-place-api && PORT=3004 npm run start:dev

access-api: ## Start access API only
	@cd futura-access-api && PORT=3005 npm run start:dev

admin-web: ## Start admin dashboard only
	@cd futura-tickets-admin && PORT=3003 npm run dev

marketplace-web: ## Start marketplace frontend only
	@cd futura-market-place-v2 && PORT=3000 npm run dev

# CI/CD
ci-test: ## Run CI test suite
	@echo "🤖 Running CI test suite..."
	npm run test --workspaces --if-present
	npm run lint --workspaces --if-present
	./scripts/health-check-all.sh

ci-build: ## Run CI build
	@echo "🤖 Running CI build..."
	npm run build --workspaces --if-present

# Quick Start
quickstart: install dev-infra dev-backends ## Quick start: install + infra + backends
	@echo "✅ Quick start complete!"
	@echo "Now run: make dev-frontends"
