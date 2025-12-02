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
# [FIX] Thêm lại python3, make, g++ để build bcrypt và các native module khác
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install -g pnpm

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Lệnh này sẽ thành công nếu bạn đã làm Bước 1 (Update lockfile)
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=customer-backend...

# [SAFETY GATE]
RUN node apps/customer-backend/scripts/verify-canvas.js

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Font & Color Profile libs
RUN apk add --no-cache \
    libc6-compat \
    font-noto \
    fontconfig \
    ttf-dejavu \
    lcms2 \
    libpng \
    libjpeg-turbo

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