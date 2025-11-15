# Danh sách Environment Variables cần set trên Vercel

## 📋 Kết quả kiểm tra

### ❌ Hiện trạng:
- **Customer Frontend**: Không có environment variables nào được set
- **Admin Frontend**: Không có environment variables nào được set

### ✅ Các biến cần set:

## Customer Frontend

### 🔴 Bắt buộc (Required):
1. **`VITE_API_URL`**
   - Mô tả: URL của backend API
   - Production: `https://delta-customer.onrender.com`
   - Preview: `https://delta-customer.onrender.com` (hoặc preview backend URL)
   - Development: `http://localhost:8000`
   - Sử dụng trong: `axios.ts`, `SocialButton.tsx`

### 🟡 Quan trọng (Important):
2. **`VITE_BACKEND_URL`**
   - Mô tả: URL backend cho Vite proxy (development)
   - Production: `https://delta-customer.onrender.com`
   - Preview: `https://delta-customer.onrender.com`
   - Development: `http://localhost:8000`
   - Sử dụng trong: `vite.config.ts`

3. **`VITE_STRIPE_PUBLISHABLE_KEY`**
   - Mô tả: Stripe publishable key
   - Giá trị: Lấy từ Render backend env (`STRIPE_PUBLISHABLE_KEY`)
   - Sử dụng trong: `vite.config.ts`

4. **`VITE_STRIPE_PUBLIC_KEY`**
   - Mô tả: Stripe public key (có thể giống với publishable key)
   - Giá trị: Lấy từ Render backend env
   - Sử dụng trong: `env.config.ts`

### 🟢 Tùy chọn (Optional):
5. **`VITE_CLOUDINARY_CLOUD_NAME`**
   - Mô tả: Cloudinary cloud name
   - Giá trị: Lấy từ Render backend env (`CLOUDINARY_CLOUD_NAME`)
   - Sử dụng trong: `env.config.ts`

6. **`VITE_CLOUDINARY_UPLOAD_PRESET`**
   - Mô tả: Cloudinary upload preset
   - Giá trị: Cần tạo trên Cloudinary Dashboard
   - Sử dụng trong: `env.config.ts`

7. **`VITE_GOOGLE_CLIENT_ID`**
   - Mô tả: Google OAuth Client ID
   - Giá trị: Lấy từ Render backend env (`GOOGLE_CLIENT_ID`)
   - Sử dụng trong: `env.config.ts`

8. **`VITE_VNPAY_RETURN_URL`**
   - Mô tả: VNPay return URL sau khi thanh toán
   - Production: `https://www.printz.vn/checkout/confirmation`
   - Preview: URL preview của Vercel + `/checkout/confirmation`
   - Development: `http://localhost:5173/checkout/confirmation`
   - Sử dụng trong: `env.config.ts`

9. **`VITE_FACEBOOK_APP_ID`** (nếu có)
   - Mô tả: Facebook App ID (nếu dùng Facebook login)
   - Sử dụng trong: `env.config.ts`

## Admin Frontend

Cần kiểm tra code để xác định các biến cần thiết cho admin frontend.

---

## 🚀 Cách set Environment Variables trên Vercel

### Cách 1: Qua Vercel Dashboard
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project (customer-frontend hoặc admin-frontend)
3. Vào **Settings** → **Environment Variables**
4. Thêm từng biến:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://delta-customer.onrender.com`
   - **Environment**: Chọn Production, Preview, Development (hoặc tất cả)
5. Click **Save**

### Cách 2: Qua Vercel CLI (Tự động)

Chạy script:
```bash
bash scripts/set-vercel-env.sh
```

Hoặc set từng biến:
```bash
cd apps/customer-frontend
npx vercel env add VITE_API_URL production
# Nhập giá trị khi được hỏi: https://delta-customer.onrender.com
```

---

## 📝 Lưu ý quan trọng

1. **Prefix VITE_**: Tất cả biến frontend phải có prefix `VITE_` để Vite có thể expose chúng ra client-side
2. **Environment**: Set cho đúng môi trường (Production, Preview, Development)
3. **Sensitive Data**: Không set các secret keys (như `GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`) ở frontend
4. **Sau khi set**: Cần redeploy để áp dụng thay đổi

---

## 🔄 Sau khi set xong

1. Export lại env variables:
   ```bash
   bash scripts/export-vercel-env.sh
   ```

2. Kiểm tra lại:
   ```bash
   cd apps/customer-frontend
   npx vercel env ls
   ```

3. Redeploy trên Vercel để áp dụng thay đổi

