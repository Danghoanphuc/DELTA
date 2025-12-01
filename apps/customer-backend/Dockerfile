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
# Cài đặt công cụ để build (Dev dependencies)
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

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source trước để script prepare chạy được
COPY --from=pruner /app/out/full/ .
RUN pnpm install --frozen-lockfile

RUN pnpm turbo build --filter=customer-backend...

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# [QUAN TRỌNG] Cài thư viện Runtime (Bản không có đuôi -dev) để chạy xử lý ảnh/PDF
RUN apk add --no-cache \
    libc6-compat \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman

# Copy packages dùng chung
COPY --from=builder /app/packages ./packages

# Copy kết quả build
COPY --from=builder /app/apps/customer-backend/package.json .
COPY --from=builder /app/apps/customer-backend/dist ./dist

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
# Copy thêm node_modules của chính app đó (đề phòng pnpm không hoist hết)
COPY --from=builder /app/apps/customer-backend/node_modules ./apps/customer-backend/node_modules

USER expressjs
EXPOSE 3000
CMD ["node", "dist/server.js"]