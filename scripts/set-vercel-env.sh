#!/bin/bash

# Script để set environment variables trên Vercel
# Sử dụng: bash scripts/set-vercel-env.sh

set -e

echo "🚀 Bắt đầu set environment variables trên Vercel..."

# Màu sắc
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kiểm tra Vercel CLI
VERCEL_CMD="npx vercel"
if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
fi

# Kiểm tra login
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo -e "${RED}❌ Chưa đăng nhập Vercel. Vui lòng chạy: $VERCEL_CMD login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Đã đăng nhập Vercel${NC}"

# Function để set env variable
set_env() {
    local project_dir=$1
    local var_name=$2
    local var_value=$3
    local environment=$4
    
    echo -e "${BLUE}📝 Setting $var_name for $environment...${NC}"
    cd "$project_dir"
    
    # Kiểm tra xem biến đã tồn tại chưa
    if $VERCEL_CMD env ls | grep -q "$var_name"; then
        echo -e "${YELLOW}⚠️  $var_name đã tồn tại. Bỏ qua...${NC}"
    else
        echo "$var_value" | $VERCEL_CMD env add "$var_name" "$environment"
        echo -e "${GREEN}✅ Đã set $var_name cho $environment${NC}"
    fi
    
    cd - > /dev/null
}

# ============================================
# Customer Frontend
# ============================================
echo -e "\n${BLUE}📦 Setting env cho Customer Frontend...${NC}"

cd apps/customer-frontend

# Link project nếu chưa
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Project chưa được link. Đang link...${NC}"
    $VERCEL_CMD link --yes || true
fi

# Bắt buộc
set_env "." "VITE_API_URL" "https://delta-customer.onrender.com" "production"
set_env "." "VITE_API_URL" "https://delta-customer.onrender.com" "preview"
set_env "." "VITE_API_URL" "http://localhost:8000" "development"

set_env "." "VITE_BACKEND_URL" "https://delta-customer.onrender.com" "production"
set_env "." "VITE_BACKEND_URL" "https://delta-customer.onrender.com" "preview"
set_env "." "VITE_BACKEND_URL" "http://localhost:8000" "development"

# Quan trọng (cần lấy giá trị từ Render backend)
echo -e "${YELLOW}⚠️  Các biến sau cần lấy giá trị từ Render backend:${NC}"
echo "   - VITE_STRIPE_PUBLISHABLE_KEY (từ STRIPE_PUBLISHABLE_KEY)"
echo "   - VITE_STRIPE_PUBLIC_KEY (từ STRIPE_PUBLISHABLE_KEY)"
echo "   - VITE_CLOUDINARY_CLOUD_NAME (từ CLOUDINARY_CLOUD_NAME)"
echo "   - VITE_GOOGLE_CLIENT_ID (từ GOOGLE_CLIENT_ID)"
echo ""
echo -e "${YELLOW}Bạn có muốn nhập các giá trị này bây giờ không? (y/n)${NC}"
read -r answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo -e "${BLUE}Nhập VITE_STRIPE_PUBLISHABLE_KEY:${NC}"
    read -r stripe_key
    if [ -n "$stripe_key" ]; then
        set_env "." "VITE_STRIPE_PUBLISHABLE_KEY" "$stripe_key" "production"
        set_env "." "VITE_STRIPE_PUBLISHABLE_KEY" "$stripe_key" "preview"
        set_env "." "VITE_STRIPE_PUBLISHABLE_KEY" "$stripe_key" "development"
        
        set_env "." "VITE_STRIPE_PUBLIC_KEY" "$stripe_key" "production"
        set_env "." "VITE_STRIPE_PUBLIC_KEY" "$stripe_key" "preview"
        set_env "." "VITE_STRIPE_PUBLIC_KEY" "$stripe_key" "development"
    fi
    
    echo -e "${BLUE}Nhập VITE_CLOUDINARY_CLOUD_NAME:${NC}"
    read -r cloudinary_name
    if [ -n "$cloudinary_name" ]; then
        set_env "." "VITE_CLOUDINARY_CLOUD_NAME" "$cloudinary_name" "production"
        set_env "." "VITE_CLOUDINARY_CLOUD_NAME" "$cloudinary_name" "preview"
        set_env "." "VITE_CLOUDINARY_CLOUD_NAME" "$cloudinary_name" "development"
    fi
    
    echo -e "${BLUE}Nhập VITE_GOOGLE_CLIENT_ID:${NC}"
    read -r google_client_id
    if [ -n "$google_client_id" ]; then
        set_env "." "VITE_GOOGLE_CLIENT_ID" "$google_client_id" "production"
        set_env "." "VITE_GOOGLE_CLIENT_ID" "$google_client_id" "preview"
        set_env "." "VITE_GOOGLE_CLIENT_ID" "$google_client_id" "development"
    fi
    
    echo -e "${BLUE}Nhập VITE_VNPAY_RETURN_URL (production):${NC}"
    read -r vnpay_return
    if [ -n "$vnpay_return" ]; then
        set_env "." "VITE_VNPAY_RETURN_URL" "$vnpay_return" "production"
        set_env "." "VITE_VNPAY_RETURN_URL" "http://localhost:5173/checkout/confirmation" "development"
    fi
fi

cd ../..

echo -e "\n${GREEN}✅ Hoàn thành!${NC}"
echo -e "${YELLOW}⚠️  Lưu ý:${NC}"
echo "   1. Cần redeploy trên Vercel để áp dụng thay đổi"
echo "   2. Chạy 'bash scripts/export-vercel-env.sh' để export lại env variables"
echo "   3. Kiểm tra: cd apps/customer-frontend && npx vercel env ls"

