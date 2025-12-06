# Base strategy: Alpine for small footprint
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Kích hoạt corepack để dùng đúng version pnpm trong package.json
RUN corepack enable

# ---------------------------------------------------------
# Stage 1: Prune (Tạo scope nhỏ chỉ chứa admin-backend)
# ---------------------------------------------------------
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Lệnh này loại bỏ tất cả code của package khác không liên quan
RUN turbo prune admin-backend --docker

# ---------------------------------------------------------
# Stage 2: Builder (Cài đặt & Build)
# ---------------------------------------------------------
FROM base AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy lockfile & package.json trước để tận dụng Docker Layer Caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# OPTIMIZATION: Mount cache để pnpm không tải lại các gói đã có trong store máy chủ
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

# Copy source code đầy đủ sau khi đã cài xong node_modules
COPY --from=pruner /app/out/full/ .

# Build - pnpm turbo thay vì turbo trực tiếp
RUN pnpm turbo build --filter=admin-backend...

# ---------------------------------------------------------
# Stage 3: Runner (Production Image)
# ---------------------------------------------------------
FROM base AS runner
WORKDIR /app

# Tạo user non-root để bảo mật
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

# Cài thư viện OS cần thiết cho xử lý ảnh (Canvas/Fabric)
RUN apk add --no-cache \
    libc6-compat \
    font-noto \
    fontconfig \
    ttf-dejavu \
    lcms2 \
    libpng \
    libjpeg-turbo

# Copy artifacts cần thiết
# Lưu ý: Monorepo cần copy node_modules từ root và từ app
COPY --from=builder --chown=expressjs:expressjs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:expressjs /app/apps/admin-backend/node_modules ./apps/admin-backend/node_modules
COPY --from=builder --chown=expressjs:expressjs /app/apps/admin-backend/package.json ./apps/admin-backend/package.json
COPY --from=builder --chown=expressjs:expressjs /app/apps/admin-backend/dist ./apps/admin-backend/dist

# Switch user
USER expressjs

# Định nghĩa biến môi trường cơ bản
ENV NODE_ENV=production
ENV PORT=3001

# Start
EXPOSE 3001
CMD ["node", "apps/admin-backend/dist/server.js"]