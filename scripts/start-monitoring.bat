@echo off
echo ========================================
echo Starting Printz Monitoring Stack
echo ========================================
echo.

echo [1/3] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✓ Docker is available
echo.

echo [2/3] Starting Uptime Kuma...
docker-compose -f docker-compose.monitoring.yml up -d
if errorlevel 1 (
    echo ERROR: Failed to start Uptime Kuma
    pause
    exit /b 1
)
echo ✓ Uptime Kuma started successfully
echo.

echo [3/3] Waiting for services to be ready...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo Monitoring Stack Started Successfully!
echo ========================================
echo.
echo Uptime Kuma: http://localhost:3001
echo.
echo Next steps:
echo 1. Open http://localhost:3001 in your browser
echo 2. Create an admin account
echo 3. Add monitors for your services
echo.
echo To stop: docker-compose -f docker-compose.monitoring.yml down
echo.
pause
