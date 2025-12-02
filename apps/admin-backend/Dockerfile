FROM node:20-alpine AS base

# Stage 1: Prune
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune admin-backend --docker

# Stage 2: Build
FROM base AS builder
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
RUN npm install -g pnpm

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

COPY --from=pruner /app/out/full/ .
# Build Admin
RUN pnpm turbo build --filter=admin-backend...

# Stage 3: Run
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
# Cài đủ thư viện cho Admin xử lý file/ảnh
RUN apk add --no-cache libc6-compat font-noto fontconfig ttf-dejavu lcms2 libpng libjpeg-turbo

COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/admin-backend/package.json .
COPY --from=builder /app/apps/admin-backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin-backend/node_modules ./apps/admin-backend/node_modules

USER expressjs
EXPOSE 3001
CMD ["node", "dist/server.js"]
