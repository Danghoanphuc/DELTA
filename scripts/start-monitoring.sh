#!/bin/bash

echo "========================================"
echo "Starting Printz Monitoring Stack"
echo "========================================"
echo ""

echo "[1/3] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✓ Docker is available"
echo ""

echo "[2/3] Starting Uptime Kuma..."
docker-compose -f docker-compose.monitoring.yml up -d
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start Uptime Kuma"
    exit 1
fi
echo "✓ Uptime Kuma started successfully"
echo ""

echo "[3/3] Waiting for services to be ready..."
sleep 5
echo ""

echo "========================================"
echo "Monitoring Stack Started Successfully!"
echo "========================================"
echo ""
echo "Uptime Kuma: http://localhost:3001"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Create an admin account"
echo "3. Add monitors for your services"
echo ""
echo "To stop: docker-compose -f docker-compose.monitoring.yml down"
echo ""
