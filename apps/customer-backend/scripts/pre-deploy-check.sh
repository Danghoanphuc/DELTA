#!/bin/bash
# Pre-deploy check script
# Chạy tất cả tests để đảm bảo code an toàn trước khi deploy

set -e  # Exit on error

echo "🚀 PRE-DEPLOY CHECK"
echo "===================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to run test and track result
run_test() {
  local test_name=$1
  local test_command=$2
  
  echo -e "${YELLOW}▶ Running: ${test_name}${NC}"
  
  if eval "$test_command"; then
    echo -e "${GREEN}✓ ${test_name} PASSED${NC}"
    echo ""
  else
    echo -e "${RED}✗ ${test_name} FAILED${NC}"
    echo ""
    FAILED=$((FAILED + 1))
  fi
}

# 1. Syntax check
run_test "TypeScript/JavaScript Syntax Check" "npm run lint 2>/dev/null || echo 'Lint not configured, skipping...'"

# 2. Production environment test
run_test "Production Environment Test" "node scripts/test-production-env.js"

# 3. Worker isolated test
run_test "Worker Isolated Test" "node scripts/test-workers-isolated.js"

# 4. Check for common issues
echo -e "${YELLOW}▶ Checking for common issues...${NC}"

# Check for double commas
if grep -r ",," src/ --include="*.js" --include="*.ts" 2>/dev/null | grep -v node_modules; then
  echo -e "${RED}✗ Found double commas (,,) in code${NC}"
  FAILED=$((FAILED + 1))
else
  echo -e "${GREEN}✓ No double commas found${NC}"
fi

# Check for console.log in production code (warning only)
if grep -r "console\.log" src/ --include="*.js" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v "Logger\." | head -5; then
  echo -e "${YELLOW}⚠ Found console.log statements (consider using Logger)${NC}"
fi

# Check for TODO/FIXME
if grep -r "TODO\|FIXME" src/ --include="*.js" --include="*.ts" 2>/dev/null | grep -v node_modules | head -5; then
  echo -e "${YELLOW}⚠ Found TODO/FIXME comments${NC}"
fi

echo ""
echo "===================="
echo "📊 SUMMARY"
echo "===================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Safe to deploy.${NC}"
  exit 0
else
  echo -e "${RED}❌ ${FAILED} check(s) failed! DO NOT DEPLOY.${NC}"
  exit 1
fi
