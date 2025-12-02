FROM node:20-alpine AS base

# --- Stage 1: Pruning (Cắt tỉa Monorepo) ---
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Chỉ lấy những gì customer-backend cần
RUN turbo prune customer-backend --docker

# --- Stage 2: Installer & Builder (Nặng nhất - Cần Cache kỹ) ---
FROM base AS builder
# Cài đặt Build Tools cho Canvas & Native Modules
# Mẹo: Chỉ cài ở bước này, không đưa sang Production để giảm size
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app
RUN npm install -g pnpm

# [TỐI ƯU CỰC MẠNH] 
# 1. Copy file định nghĩa trước
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# 2. Cài đặt Dependencies NGAY LÚC NÀY
# Docker sẽ CACHE layer này. Nếu bạn chỉ sửa code mà không sửa package.json,
# Docker sẽ bỏ qua bước này (tiết kiệm 2-3 phút compile Canvas)
RUN pnpm install --frozen-lockfile

# 3. Bây giờ mới copy source code vào
COPY --from=pruner /app/out/full/ .

# 4. Build dự án
RUN pnpm turbo build --filter=customer-backend...

# --- Stage 3: Runner (Môi trường chạy thật - Nhẹ & Bảo mật) ---
FROM base AS runner
WORKDIR /app

# Tạo user để không chạy dưới quyền root (Security)
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Cài đặt Runtime Libraries cho Canvas (Không cần compiler g++/make nữa)
RUN apk add --no-cache \
    libc6-compat \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy dependencies và code đã build từ Stage 2
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/customer-backend/package.json .
COPY --from=builder /app/apps/customer-backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/customer-backend/node_modules ./apps/customer-backend/node_modules

USER expressjs
EXPOSE 3000

CMD ["node", "dist/server.js"]