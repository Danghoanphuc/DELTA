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
# ✅ Thêm build tools cho bcrypt và các native modules
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install -g pnpm

# Copy file cấu hình đã lọc
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# ✅ Install với frozen-lockfile, bcrypt sẽ được build
RUN pnpm install --frozen-lockfile

# Copy source code đã lọc
COPY --from=pruner /app/out/full/ .

# Build code (Turbo sẽ tự build @printz/types trước rồi mới đến customer)
RUN pnpm turbo build --filter=customer-backend...

# --- Stage 3: Runner (Chạy thật) ---
FROM base AS runner
# ✅ Thêm runtime dependencies cho bcrypt
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Copy packages (bao gồm @printz/types)
COPY --from=builder /app/packages ./packages

# Copy kết quả build
COPY --from=builder /app/apps/customer-backend/package.json .
COPY --from=builder /app/apps/customer-backend/dist ./dist

# ✅ Copy ALL node_modules (bao gồm bcrypt binaries đã build)
COPY --from=builder /app/node_modules ./node_modules

USER expressjs
EXPOSE 3000
CMD ["node", "dist/server.js"]