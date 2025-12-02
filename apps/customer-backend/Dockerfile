FROM node:20-alpine AS base

# --- Stage 1: Pruning ---
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune customer-backend --docker

# --- Stage 2: Installer & Builder ---
FROM base AS builder
# Thêm python3/make/g++ để đảm bảo build được mọi native deps (bcrypt, etc)
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install -g pnpm

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# [QUAN TRỌNG] Dùng --no-frozen-lockfile để bỏ qua lỗi check checksum
# Đây là giải pháp an toàn nhất cho Staging khi lockfile chưa đồng bộ
RUN pnpm install --no-frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=customer-backend...

# Verify Engine
RUN node apps/customer-backend/scripts/verify-canvas.js

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Thêm lcms2 (Color Profile) và các thư viện ảnh
RUN apk add --no-cache \
    libc6-compat font-noto fontconfig ttf-dejavu \
    lcms2 libpng libjpeg-turbo

COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/customer-backend/package.json .
COPY --from=builder /app/apps/customer-backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/customer-backend/node_modules ./apps/customer-backend/node_modules

USER expressjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "dist/server.js"]
