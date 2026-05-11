#!/bin/bash

# VibraGuard Test Runner Script
# This script runs all tests in the VibraGuard project

set -e

echo "🧪 VibraGuard Test Suite"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    if eval "$test_command"; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        echo ""
        return 1
    fi
}

failed=0

# Backend Tests
if [ -d "vibraguard/backend" ]; then
    run_test "Backend Tests" "cd vibraguard/backend && mvn test -q" || ((failed++))
fi

# Frontend Tests
if [ -d "vibraguard/frontend" ]; then
    run_test "Frontend Tests" "cd vibraguard/frontend && pnpm test" || ((failed++))
fi

# Blockchain Tests
if [ -d "vibraguard/blockchain-net" ]; then
    run_test "Blockchain Tests" "cd vibraguard/blockchain-net && npm test" || ((failed++))
fi

# Python Tests
if [ -d "vibraguard/ia_model" ]; then
    run_test "Python ML Tests" "cd vibraguard/ia_model && pytest tests/ -q" || ((failed++))
fi

echo "======================="
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $failed test suite(s) failed${NC}"
    exit 1
fi
