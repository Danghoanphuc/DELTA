FROM node:20-alpine AS base

# --- Stage 1: Pruning (Lọc code) ---
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Lệnh quan trọng: Lọc ra customer-backend và các gói nó cần (types, utils...)
RUN turbo prune customer-backend --docker

# --- Stage 2: Installer & Builder ---
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

# Copy file cấu hình đã lọc
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Cài đặt dependencies (Quan trọng: --ignore-scripts để tránh lỗi permission)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code đã lọc
COPY --from=pruner /app/out/full/ .

# Build code (Turbo sẽ tự build @printz/types trước rồi mới đến customer)
RUN pnpm turbo build --filter=customer-backend...

# --- Stage 3: Runner (Chạy thật) ---
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Copy kết quả build
COPY --from=builder /app/apps/customer-backend/package.json .
COPY --from=builder /app/apps/customer-backend/dist ./dist
# Copy node_modules (chỉ lấy gói cần cho production)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/customer-backend/node_modules ./apps/customer-backend/node_modules

USER expressjs
# Customer thường chạy port khác Admin một chút để dễ dev, ví dụ 3000 (trong docker)
EXPOSE 3000
CMD ["node", "dist/server.js"]