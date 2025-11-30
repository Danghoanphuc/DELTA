# apps/admin-backend/Dockerfile
FROM node:20-alpine AS base

# --- Stage 1: Pruning ---
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune admin-backend --docker

# --- Stage 2: Installer & Builder ---
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

# Copy file cấu hình đã lọc
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# [FIXED] Thêm --ignore-scripts để tránh chạy lệnh prepare/tsc khi chưa có code
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code đã lọc (Lúc này mới có tsconfig.json)
COPY --from=pruner /app/out/full/ .

# Build dự án
RUN pnpm turbo build --filter=admin-backend...

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/apps/admin-backend/package.json .
COPY --from=builder /app/apps/admin-backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin-backend/node_modules ./apps/admin-backend/node_modules

USER expressjs
EXPOSE 3000
CMD ["node", "dist/server.js"]