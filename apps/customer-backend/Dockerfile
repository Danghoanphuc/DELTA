# Sử dụng Node 20 (Debian based - ổn định hơn Alpine cho Puppeteer)
FROM node:20-slim

# 1. CÀI ĐẶT THƯ VIỆN CHO CHROME/PUPPETEER
# Đây là phần quan trọng nhất để fix lỗi "Shared object file not found"
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

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