# Hướng Dẫn Cấu Hình Deploy

## Vercel - Admin Frontend

### Settings → General
- **Root Directory**: `apps/admin-frontend`
- **Framework Preset**: Vite

### Settings → Build & Development Settings
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm --filter admin-frontend build`
- **Output Directory**: `apps/admin-frontend/dist`

### Settings → Environment Variables
- `VITE_ADMIN_API_URL` = `https://delta-admin-vch9.onrender.com/api/admin` (KHÔNG có dấu @)

### Lưu ý
- File `vercel.json` đã được tạo tự động trong `apps/admin-frontend/vercel.json`
- Vercel sẽ tự động detect và sử dụng cấu hình từ file này

---

## Vercel - Customer Frontend

### Settings → General
- **Root Directory**: `apps/customer-frontend`
- **Framework Preset**: Vite

### Settings → Build & Development Settings
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm --filter customer-frontend build`
- **Output Directory**: `apps/customer-frontend/dist`

### Settings → Environment Variables
- `VITE_API_URL` = `https://delta-j7qn.onrender.com`
- `VITE_BACKEND_URL` = `https://delta-j7qn.onrender.com`
- `VITE_STRIPE_PUBLISHABLE_KEY` = (giá trị từ file customer.env)
- Các biến khác theo nhu cầu

---

## Render - Admin Backend

### Settings → Build & Deploy
- **Root Directory**: `apps/admin-backend`
- **Build Command**: `corepack enable pnpm && pnpm install --frozen-lockfile && pnpm --filter @printz/types build && pnpm --filter admin-backend build`
- **Start Command**: `pnpm --filter admin-backend start`

### Settings → Environment
- **Node Version**: 22 (hoặc để Render tự detect)

### Environment Variables (lấy từ file admin.env):
```
ACCESS_TOKEN_SECRET=<your-access-token-secret>
ADMIN_APP_URL=https://admin.printz.vn
ADMIN_JWT_SECRET=<your-admin-jwt-secret>
ADMIN_PASSWORD_RESET_TOKEN_MINUTES=30
FROM_EMAIL=admin@printz.vn
MONGODB_CONNECTIONSTRING=<your-mongodb-connection-string>
NODE_ENV=production
PORT= (để trống, Render sẽ tự động gán)
RESEND_API_KEY=<your-resend-api-key>
SUPERADMIN_EMAIL=<your-superadmin-email>
SUPERADMIN_PASSWORD=<your-superadmin-password>
```

**Lưu ý**: Thay thế các giá trị `<...>` bằng giá trị thực tế từ file `admin.env` của bạn. KHÔNG commit file `.env` lên GitHub!

---

## Render - Customer Backend

### Settings → Build & Deploy
- **Root Directory**: `apps/customer-backend`
- **Build Command**: `corepack enable pnpm && pnpm install --frozen-lockfile && pnpm --filter @printz/types build && pnpm --filter customer-backend build`
- **Start Command**: `pnpm --filter customer-backend start`

### Settings → Environment
- **Node Version**: 22 (hoặc để Render tự detect)

### Environment Variables (lấy từ file customer.env):
```
ACCESS_TOKEN_SECRET=<your-access-token-secret>
API_URL=http://localhost:5001
CLIENT_URL=https://www.printz.vn
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
GEMINI_API_KEY=<your-gemini-api-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MONGODB_CONNECTIONSTRING=<your-mongodb-connection-string>
NODE_ENV=production
OPENAI_API_KEY=<your-openai-api-key>
REDIS_URL=<your-redis-url>
RESEND_API_KEY=<your-resend-api-key>
SERVER_URL=https://delta-j7qn.onrender.com
SESSION_SECRET=<your-session-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
PORT= (để trống, Render sẽ tự động gán)
```

**Lưu ý**: Thay thế các giá trị `<...>` bằng giá trị thực tế từ file `customer.env` của bạn. KHÔNG commit file `.env` lên GitHub!

---

## Lưu Ý Quan Trọng

1. **Lockfile**: Đã thêm `packageManager: "pnpm@10.22.0"` vào root `package.json` để đảm bảo Vercel và Render dùng đúng version pnpm.

2. **Build Order**: Build commands trên Render đã được cập nhật để build `@printz/types` trước khi build backend, tránh lỗi "Cannot find module '@printz/types'".

3. **Output Directory**: Admin frontend đã có `vercel.json` với `outputDirectory: apps/admin-frontend/dist`.

4. **Environment Variables**: 
   - Admin frontend: `VITE_ADMIN_API_URL` phải KHÔNG có dấu `@` ở đầu
   - URL phải kết thúc bằng `/api/admin` vì axios baseURL đã có sẵn `/api/admin`

