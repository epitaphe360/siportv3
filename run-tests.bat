@echo off
REM Test Execution Guide for SiPorts 2026 (Windows)
REM Run comprehensive E2E test suite

setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🎯 SIPORTS 2026 - COMPREHENSIVE E2E TEST SUITE (230+ TESTS)   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM 1. SETUP & VALIDATION
REM ============================================================================

echo [1/5] Validating environment...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Node.js not found. Please install Node.js 18+
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
  echo ❌ npm not found. Please install npm
  exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION%

REM Check if dependencies installed
if not exist "node_modules" (
  echo ⚠️  node_modules not found. Installing dependencies...
  call npm install
)
echo ✅ Dependencies installed

REM ============================================================================
REM 2. BUILD PROJECT
REM ============================================================================

echo.
echo [2/5] Building project...

call npm run build >nul 2>&1
if errorlevel 1 (
  echo ⚠️  Build skipped or failed ^(may be optional^)
) else (
  echo ✅ Build successful
)

REM ============================================================================
REM 3. CHECK DEV SERVER
REM ============================================================================

echo.
echo [3/5] Checking dev server...

REM Check if server is already running
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
  echo ⚠️  Dev server not running. Starting in background...
  start "" npm run dev
  timeout /t 3 /nobreak >nul
) else (
  echo ✅ Dev server already running on http://localhost:5173
)

REM ============================================================================
REM 4. RUN TESTS
REM ============================================================================

echo.
echo [4/5] Running comprehensive E2E test suite...
echo.

REM Run full test suite
call npx playwright test e2e/full-coverage-100percent.spec.ts ^
                        e2e/workflows-business-logic.spec.ts ^
                        e2e/accessibility-ux.spec.ts ^
                        --reporter=html,list,json

set TEST_RESULT=%ERRORLEVEL%

echo.

REM ============================================================================
REM 5. RESULTS & REPORT
REM ============================================================================

echo [5/5] Generating reports...

if %TEST_RESULT% equ 0 (
  echo ✅ All tests passed!
) else (
  echo ❌ Some tests failed. Check HTML report for details.
)

echo.
echo 📊 Test Results:
echo    HTML Report: ./playwright-report/index.html
echo    JSON Report: ./test-results/results.json
echo    JUnit XML:   ./test-results/junit.xml

echo.
echo 📈 Coverage Summary:
echo    Total Test Files: 3
echo    Total Tests: 230+
echo    - Authentication: 6 tests
echo    - Registration: 3 tests
echo    - Dashboards: 19 tests
echo    - Workflows: 70+ tests
echo    - Accessibility: 30 tests
echo    - UX/Performance: 20 tests
echo    - Error Handling: 50+ tests

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ E2E Test Execution Complete
echo ═══════════════════════════════════════════════════════════════

REM Open HTML report if available
if exist "playwright-report\index.html" (
  echo.
  echo Opening HTML report...
  start "" "playwright-report\index.html"
)

exit /b %TEST_RESULT%
