#!/bin/bash
# scripts/stop-ngrok.sh
# Script dừng ngrok process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Dừng ngrok...${NC}\n"

# Check if PID file exists
if [ -f /tmp/ngrok_vnpay.pid ]; then
    NGROK_PID=$(cat /tmp/ngrok_vnpay.pid)
    if ps -p $NGROK_PID > /dev/null 2>&1; then
        kill $NGROK_PID
        echo -e "${GREEN}✅ Đã dừng ngrok (PID: ${NGROK_PID})${NC}"
        rm /tmp/ngrok_vnpay.pid
    else
        echo -e "${YELLOW}⚠️  Process không còn chạy${NC}"
        rm /tmp/ngrok_vnpay.pid
    fi
else
    # Try to find and kill ngrok process
    if command -v ngrok &> /dev/null; then
        NGROK_PIDS=$(pgrep -f "ngrok http 8000" || true)
        if [ -n "$NGROK_PIDS" ]; then
            echo "$NGROK_PIDS" | xargs kill
            echo -e "${GREEN}✅ Đã dừng ngrok process${NC}"
        else
            echo -e "${YELLOW}⚠️  Không tìm thấy ngrok process đang chạy${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ngrok chưa được cài đặt${NC}"
    fi
fi

echo -e "\n${GREEN}✅ Hoàn tất!${NC}"

