FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------------------------------------------------------
# Stage 1: Pruner (Cắt tỉa Monorepo)
# ---------------------------------------------------------
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Chỉ lấy code liên quan đến customer-backend
RUN turbo prune customer-backend --docker

# ---------------------------------------------------------
# Stage 2: Builder
# ---------------------------------------------------------
FROM base AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install turbo globally
RUN npm install -g turbo

# Tăng RAM cho node build (quan trọng cho Canvas/Fabric)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy lockfile trước để cache
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build (Tự động build dependencies: types, utils, ui)
RUN turbo build --filter=customer-backend...

# ---------------------------------------------------------
# Stage 3: Runner
# ---------------------------------------------------------
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Cài thư viện OS cho Canvas/Fabric (BẮT BUỘC CHO ALPINE)
RUN apk add --no-cache \
    libc6-compat \
    font-noto \
    fontconfig \
    ttf-dejavu \
    lcms2 \
    libpng \
    libjpeg-turbo

# Copy kết quả build
COPY --from=builder --chown=expressjs:expressjs /app/apps/customer-backend/package.json ./apps/customer-backend/package.json
COPY --from=builder --chown=expressjs:expressjs /app/apps/customer-backend/dist ./apps/customer-backend/dist
# Copy node_modules đã cài (production only nếu prune kỹ, ở đây copy full cho an toàn monorepo link)
COPY --from=builder --chown=expressjs:expressjs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:expressjs /app/apps/customer-backend/node_modules ./apps/customer-backend/node_modules

ENV NODE_ENV=production
ENV PORT=3000

USER expressjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Chạy đúng đường dẫn trong context Monorepo
CMD ["node", "apps/customer-backend/dist/server.js"]