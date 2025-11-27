# Sử dụng Node 20 (Debian based)
FROM node:20-slim

# ✅ Đã bỏ phần cài Chrome/Puppeteer - Giờ dùng ApiFlash API (nhẹ hơn ~500MB RAM)

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file cấu hình package
COPY package.json pnpm-lock.yaml ./

# Cài đặt pnpm
RUN npm install -g pnpm

# Cài đặt dependencies
RUN pnpm install

# Copy toàn bộ source code
COPY . .

# Build project (nếu dùng TypeScript/Build step - ở đây JS thuần thì có thể bỏ qua)
# RUN pnpm build

# Mở port
EXPOSE 3000

# Chạy ứng dụng
CMD ["pnpm", "start"]