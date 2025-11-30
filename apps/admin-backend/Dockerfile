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
# ✅ Thêm build tools cho bcrypt và các native modules
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install -g pnpm

# Copy file cấu hình đã lọc
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source code trước khi install (để có tsconfig.json và source cho prepare scripts)
COPY --from=pruner /app/out/full/ .

# ✅ Install với frozen-lockfile, bcrypt sẽ được build
RUN pnpm install --frozen-lockfile

# Build dự án
RUN pnpm turbo build --filter=admin-backend...

# --- Stage 3: Runner ---
FROM base AS runner
# ✅ Thêm runtime dependencies cho bcrypt
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Copy package.json
COPY --from=builder /app/apps/admin-backend/package.json .

# Copy compiled code
COPY --from=builder /app/apps/admin-backend/dist ./dist

# ✅ Copy ALL node_modules (bao gồm bcrypt binaries đã build)
COPY --from=builder /app/node_modules ./node_modules

# ✅ Copy packages (bao gồm @printz/types)
COPY --from=builder /app/packages ./packages

USER expressjs
EXPOSE 3000
CMD ["node", "dist/server.js"]