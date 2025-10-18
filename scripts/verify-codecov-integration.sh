#!/bin/bash

##############################################################################
# Codecov Integration Verification Script
#
# Purpose: Verify that Codecov integration is properly configured
# Usage: ./scripts/verify-codecov-integration.sh
# Exit codes: 0 = success, 1 = failure
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_check() {
    echo -e "${YELLOW}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((CHECKS_PASSED++))
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

##############################################################################
# Verification Checks
##############################################################################

check_git_repository() {
    print_header "1. Git Repository Configuration"

    print_check "Verifying git repository..."
    if [ -d .git ]; then
        print_success "Git repository found"
    else
        print_error "Not a git repository"
        return 1
    fi

    print_check "Checking remote URL..."
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -n "$REMOTE_URL" ]; then
        print_success "Remote URL: $REMOTE_URL"

        # Extract owner and repo from URL
        if [[ "$REMOTE_URL" =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
            OWNER="${BASH_REMATCH[1]}"
            REPO="${BASH_REMATCH[2]}"
            print_info "Repository: $OWNER/$REPO"
        else
            print_warning "Could not extract owner/repo from remote URL"
        fi
    else
        print_error "No remote URL configured"
        return 1
    fi
}

check_workflow_files() {
    print_header "2. GitHub Actions Workflow Files"

    print_check "Checking for test-coverage.yml workflow..."
    if [ -f ".github/workflows/test-coverage.yml" ]; then
        print_success "test-coverage.yml found"

        # Check if workflow contains codecov upload
        if grep -q "codecov/codecov-action@v4" ".github/workflows/test-coverage.yml"; then
            print_success "Codecov action configured in workflow"
        else
            print_error "Codecov action not found in workflow"
        fi

        # Check for CODECOV_TOKEN usage
        if grep -q "CODECOV_TOKEN" ".github/workflows/test-coverage.yml"; then
            print_success "CODECOV_TOKEN secret referenced in workflow"
        else
            print_warning "CODECOV_TOKEN not found - may cause upload issues"
        fi

        # Check for flags
        if grep -q "flags:" ".github/workflows/test-coverage.yml"; then
            print_success "Coverage flags configured"
            FLAGS=$(grep "flags:" ".github/workflows/test-coverage.yml" | awk '{print $2}')
            print_info "Flags found: $(echo $FLAGS | tr '\n' ', ')"
        else
            print_warning "No coverage flags configured"
        fi
    else
        print_error "test-coverage.yml not found"
        print_info "Expected location: .github/workflows/test-coverage.yml"
        return 1
    fi
}

check_codecov_config() {
    print_header "3. Codecov Configuration File"

    print_check "Checking for codecov.yml..."
    if [ -f "codecov.yml" ]; then
        print_success "codecov.yml found"

        # Check for coverage targets
        if grep -q "target:" "codecov.yml"; then
            print_success "Coverage targets configured"
            TARGETS=$(grep "target:" "codecov.yml" | head -1)
            print_info "$TARGETS"
        else
            print_warning "No coverage targets configured"
        fi

        # Check for flags configuration
        if grep -q "flags:" "codecov.yml"; then
            print_success "Flags configuration found"
        else
            print_warning "No flags configuration in codecov.yml"
        fi

        # Validate YAML syntax (if yq is available)
        if command -v yq &> /dev/null; then
            if yq eval '.' codecov.yml > /dev/null 2>&1; then
                print_success "codecov.yml YAML syntax is valid"
            else
                print_error "codecov.yml has invalid YAML syntax"
            fi
        else
            print_info "yq not installed - skipping YAML validation"
        fi
    else
        print_warning "codecov.yml not found (optional but recommended)"
        print_info "Create codecov.yml to configure coverage settings"
    fi
}

check_api_tests() {
    print_header "4. API Test Files and Coverage"

    APIS=("futura-tickets-admin-api" "futura-market-place-api" "futura-access-api")

    for API in "${APIS[@]}"; do
        print_check "Checking $API..."

        if [ -d "$API" ]; then
            print_success "$API directory found"

            # Check package.json
            if [ -f "$API/package.json" ]; then
                print_success "package.json found"

                # Check for test scripts
                if grep -q '"test"' "$API/package.json"; then
                    print_success "test script configured"
                else
                    print_error "No test script in package.json"
                fi

                if grep -q '"test:cov"' "$API/package.json"; then
                    print_success "test:cov script configured"
                else
                    print_error "No test:cov script in package.json"
                fi
            else
                print_error "package.json not found"
            fi

            # Check for test files
            TEST_FILES=$(find "$API" -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | wc -l)
            if [ "$TEST_FILES" -gt 0 ]; then
                print_success "Found $TEST_FILES test files"
            else
                print_warning "No test files found (*.spec.ts or *.test.ts)"
            fi
        else
            print_error "$API directory not found"
        fi

        echo ""
    done
}

run_test_coverage() {
    print_header "5. Test Coverage Generation"

    print_check "Running tests with coverage for all APIs..."
    print_info "This may take a few minutes..."
    echo ""

    APIS=("futura-tickets-admin-api" "futura-market-place-api" "futura-access-api")

    for API in "${APIS[@]}"; do
        if [ -d "$API" ]; then
            print_check "Running coverage for $API..."

            cd "$API"

            # Check if node_modules exists
            if [ ! -d "node_modules" ]; then
                print_warning "node_modules not found, running npm install..."
                npm install --silent > /dev/null 2>&1
            fi

            # Run tests with coverage
            if npm run test:cov --silent > /dev/null 2>&1; then
                print_success "Tests passed for $API"

                # Check if coverage files were generated
                if [ -f "coverage/lcov.info" ]; then
                    print_success "coverage/lcov.info generated"

                    # Get coverage percentage
                    if command -v lcov &> /dev/null; then
                        COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep "lines" | awk '{print $2}')
                        print_info "Line coverage: $COVERAGE"
                    fi
                else
                    print_error "coverage/lcov.info not generated"
                fi

                if [ -d "coverage/lcov-report" ]; then
                    print_success "HTML coverage report generated"
                    print_info "View report: open $API/coverage/lcov-report/index.html"
                else
                    print_warning "HTML coverage report not generated"
                fi
            else
                print_error "Tests failed for $API"
                print_info "Run 'npm test' in $API to see detailed errors"
            fi

            cd ..
            echo ""
        fi
    done
}

check_readme_badges() {
    print_header "6. README.md Badge Configuration"

    print_check "Checking README.md badges..."
    if [ -f "README.md" ]; then
        print_success "README.md found"

        # Check for placeholder text
        if grep -q "OWNER/REPO" "README.md"; then
            print_error "README.md still contains OWNER/REPO placeholders"
            print_info "Update badges with your actual repository: $OWNER/$REPO"
        else
            print_success "No OWNER/REPO placeholders found"
        fi

        # Check for codecov badge
        if grep -q "codecov.io" "README.md"; then
            print_success "Codecov badge found in README.md"
        else
            print_warning "No Codecov badge in README.md"
        fi

        # Check for GitHub Actions badge
        if grep -q "github.com.*actions/workflows" "README.md"; then
            print_success "GitHub Actions badge found in README.md"
        else
            print_warning "No GitHub Actions badge in README.md"
        fi
    else
        print_warning "README.md not found"
    fi
}

check_github_secrets() {
    print_header "7. GitHub Secrets (Manual Verification Required)"

    print_info "Cannot automatically verify GitHub secrets from local machine"
    print_info "Please manually verify the following:"
    echo ""
    echo "   1. Go to: https://github.com/$OWNER/$REPO/settings/secrets/actions"
    echo "   2. Verify that CODECOV_TOKEN secret exists"
    echo "   3. If not, add it from Codecov dashboard:"
    echo "      - https://app.codecov.io/gh/$OWNER/$REPO"
    echo ""

    read -p "Have you verified that CODECOV_TOKEN secret exists? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_success "CODECOV_TOKEN verified manually"
    else
        print_warning "CODECOV_TOKEN not verified - uploads will fail without it"
    fi
}

##############################################################################
# Main Execution
##############################################################################

main() {
    clear
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                                ║${NC}"
    echo -e "${BLUE}║        Codecov Integration Verification Script                ║${NC}"
    echo -e "${BLUE}║                                                                ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

    # Run all checks
    check_git_repository
    check_workflow_files
    check_codecov_config
    check_api_tests

    # Ask if user wants to run tests (can take time)
    echo ""
    read -p "Do you want to run test coverage now? This may take 3-5 minutes. (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_test_coverage
    else
        print_info "Skipping test coverage generation"
        echo ""
    fi

    check_readme_badges
    check_github_secrets

    # Final summary
    print_header "Verification Summary"

    echo -e "${GREEN}Checks Passed:${NC} $CHECKS_PASSED"
    echo -e "${RED}Checks Failed:${NC} $CHECKS_FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo ""

    if [ $CHECKS_FAILED -eq 0 ]; then
        echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Codecov integration is properly configured!${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Follow the activation guide: docs/CODECOV_ACTIVATION_GUIDE.md"
        echo "2. Add CODECOV_TOKEN to GitHub secrets"
        echo "3. Push code to trigger GitHub Actions workflow"
        echo "4. Verify coverage upload on Codecov dashboard"
        echo ""
        exit 0
    else
        echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
        echo -e "${RED}✗ Some checks failed. Please review and fix the issues above.${NC}"
        echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
        echo ""
        exit 1
    fi
}

# Run main function
main
