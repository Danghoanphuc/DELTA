@echo off
REM Pre-deploy check script for Windows
REM Chạy tất cả tests để đảm bảo code an toàn trước khi deploy

setlocal enabledelayedexpansion
set FAILED=0

echo.
echo ========================================
echo 🚀 PRE-DEPLOY CHECK
echo ========================================
echo.

REM 1. Production environment test
echo [1/3] Running Production Environment Test...
node scripts/test-production-env.js
if errorlevel 1 (
    echo ❌ Production Environment Test FAILED
    set /a FAILED+=1
) else (
    echo ✅ Production Environment Test PASSED
)
echo.

REM 2. Worker isolated test
echo [2/3] Running Worker Isolated Test...
node scripts/test-workers-isolated.js
if errorlevel 1 (
    echo ❌ Worker Isolated Test FAILED
    set /a FAILED+=1
) else (
    echo ✅ Worker Isolated Test PASSED
)
echo.

REM 3. Check for common issues
echo [3/3] Checking for common issues...

REM Check for double commas
findstr /S /R ",," src\*.js src\*.ts >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Found double commas in code
    set /a FAILED+=1
) else (
    echo ✅ No double commas found
)

echo.
echo ========================================
echo 📊 SUMMARY
echo ========================================

if !FAILED! EQU 0 (
    echo ✅ All checks passed! Safe to deploy.
    exit /b 0
) else (
    echo ❌ !FAILED! check(s) failed! DO NOT DEPLOY.
    exit /b 1
)
