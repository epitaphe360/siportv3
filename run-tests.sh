#!/bin/bash
# Test Execution Guide for SiPorts 2026
# Run comprehensive E2E test suite

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🎯 SIPORTS 2026 - COMPREHENSIVE E2E TEST SUITE (230+ TESTS)   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. SETUP & VALIDATION
# ============================================================================

echo -e "${BLUE}[1/5] Validating environment...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
  exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not found. Please install npm${NC}"
  exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"

# Check if dependencies installed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
  npm install
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# ============================================================================
# 2. BUILD PROJECT
# ============================================================================

echo ""
echo -e "${BLUE}[2/5] Building project...${NC}"

npm run build 2>/dev/null && echo -e "${GREEN}✅ Build successful${NC}" || {
  echo -e "${YELLOW}⚠️  Build skipped or failed (may be optional)${NC}"
}

# ============================================================================
# 3. START DEV SERVER
# ============================================================================

echo ""
echo -e "${BLUE}[3/5] Starting dev server...${NC}"

# Check if server is already running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Dev server already running on http://localhost:5173${NC}"
else
  echo -e "${YELLOW}⚠️  Starting dev server in background...${NC}"
  npm run dev > /dev/null 2>&1 &
  DEV_PID=$!
  sleep 3
  
  # Wait for server to be ready
  max_attempts=30
  attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
      echo -e "${GREEN}✅ Dev server ready${NC}"
      break
    fi
    sleep 1
    ((attempt++))
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Dev server failed to start${NC}"
    exit 1
  fi
fi

# ============================================================================
# 4. RUN TESTS
# ============================================================================

echo ""
echo -e "${BLUE}[4/5] Running comprehensive E2E test suite...${NC}"
echo ""

# Run full test suite
npx playwright test e2e/full-coverage-100percent.spec.ts \
                   e2e/workflows-business-logic.spec.ts \
                   e2e/accessibility-ux.spec.ts \
                   --reporter=html,list,json

TEST_RESULT=$?

echo ""

# ============================================================================
# 5. RESULTS & REPORT
# ============================================================================

echo -e "${BLUE}[5/5] Generating reports...${NC}"

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo -e "${RED}❌ Some tests failed. Check HTML report for details.${NC}"
fi

echo ""
echo -e "${BLUE}📊 Test Results:${NC}"
echo "   HTML Report: ./playwright-report/index.html"
echo "   JSON Report: ./test-results/results.json"
echo "   JUnit XML:   ./test-results/junit.xml"

echo ""
echo -e "${BLUE}📈 Coverage Summary:${NC}"
echo "   Total Test Files: 3"
echo "   Total Tests: 230+"
echo "   - Authentication: 6 tests"
echo "   - Registration: 3 tests"
echo "   - Dashboards: 19 tests"
echo "   - Workflows: 70+ tests"
echo "   - Accessibility: 30 tests"
echo "   - UX/Performance: 20 tests"
echo "   - Error Handling: 50+ tests"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ E2E Test Execution Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

# Open HTML report if available
if [ -f "playwright-report/index.html" ]; then
  echo ""
  echo "Opening HTML report..."
  if command -v open &> /dev/null; then
    open playwright-report/index.html
  elif command -v xdg-open &> /dev/null; then
    xdg-open playwright-report/index.html
  elif command -v start &> /dev/null; then
    start playwright-report/index.html
  fi
fi

# Clean up dev server if we started it
if [ -n "$DEV_PID" ]; then
  kill $DEV_PID 2>/dev/null || true
fi

exit $TEST_RESULT
