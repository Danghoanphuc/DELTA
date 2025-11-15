#!/bin/bash

# Script để export environment variables từ Vercel
# Sử dụng: bash scripts/export-vercel-env.sh

set -e

echo "🚀 Bắt đầu export environment variables từ Vercel..."

# Màu sắc cho output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kiểm tra Vercel CLI
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI chưa được cài đặt. Đang cài đặt..."
    npm install -g vercel
fi

# Sử dụng npx nếu vercel không có trong PATH
VERCEL_CMD="npx vercel"
if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
fi

# Kiểm tra login
echo -e "${BLUE}📋 Kiểm tra trạng thái đăng nhập Vercel...${NC}"
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Chưa đăng nhập Vercel. Vui lòng đăng nhập:${NC}"
    echo "   Chạy: $VERCEL_CMD login"
    exit 1
fi

echo -e "${GREEN}✅ Đã đăng nhập Vercel${NC}"

# Export cho Customer Frontend
echo -e "\n${BLUE}📦 Exporting env cho Customer Frontend...${NC}"
cd apps/customer-frontend

# Kiểm tra xem đã link chưa
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Project chưa được link. Đang link...${NC}"
    echo "   Vui lòng chọn project 'customer-frontend' khi được hỏi"
    $VERCEL_CMD link --yes || true
fi

# Export các môi trường
echo -e "${GREEN}📥 Exporting production env...${NC}"
$VERCEL_CMD env pull .env.production --environment=production --yes || echo "⚠️  Không thể export production env"

echo -e "${GREEN}📥 Exporting preview env...${NC}"
$VERCEL_CMD env pull .env.preview --environment=preview --yes || echo "⚠️  Không thể export preview env"

echo -e "${GREEN}📥 Exporting development env...${NC}"
$VERCEL_CMD env pull .env.local --environment=development --yes || echo "⚠️  Không thể export development env"

cd ../..

# Export cho Admin Frontend
echo -e "\n${BLUE}📦 Exporting env cho Admin Frontend...${NC}"
cd apps/admin-frontend

# Kiểm tra xem đã link chưa
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Project chưa được link. Đang link...${NC}"
    echo "   Vui lòng chọn project 'admin-frontend' khi được hỏi"
    $VERCEL_CMD link --yes || true
fi

# Export các môi trường
echo -e "${GREEN}📥 Exporting production env...${NC}"
$VERCEL_CMD env pull .env.production --environment=production --yes || echo "⚠️  Không thể export production env"

echo -e "${GREEN}📥 Exporting preview env...${NC}"
$VERCEL_CMD env pull .env.preview --environment=preview --yes || echo "⚠️  Không thể export preview env"

echo -e "${GREEN}📥 Exporting development env...${NC}"
$VERCEL_CMD env pull .env.local --environment=development --yes || echo "⚠️  Không thể export development env"

cd ../..

echo -e "\n${GREEN}✅ Hoàn thành! Các file .env đã được export:${NC}"
echo "   - apps/customer-frontend/.env.production"
echo "   - apps/customer-frontend/.env.preview"
echo "   - apps/customer-frontend/.env.local"
echo "   - apps/admin-frontend/.env.production"
echo "   - apps/admin-frontend/.env.preview"
echo "   - apps/admin-frontend/.env.local"

