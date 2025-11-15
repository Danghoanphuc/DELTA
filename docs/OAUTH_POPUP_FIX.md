# OAuth Popup Fix - Tổng hợp các thay đổi

## 🔍 Vấn đề
Popup đăng nhập Google bị kẹt ở màn hình "Đăng nhập thành công! Đang chuyển hướng..." và không đóng được.

## ✅ Các thay đổi đã thực hiện

### 1. Backend - Đơn giản hóa HTML Callback Page
**File:** `apps/customer-backend/src/modules/auth/auth-oauth.routes.js`

- **Bỏ toàn bộ HTML/CSS phức tạp** - chỉ giữ script tối thiểu
- **Gửi message ngay lập tức** - không đợi DOM ready
- **Delay tối thiểu** - 50ms thay vì 500ms
- **Fallback timeout** - redirect sau 2 giây nếu không đóng được
- **Gửi với wildcard "*"** - đảm bảo message được nhận

### 2. Frontend - Cải thiện Message Listener
**File:** `apps/customer-frontend/src/shared/components/ui/SocialButton.tsx`

- **Chấp nhận message có payload hợp lệ** - bỏ qua origin check nếu có `accessToken`
- **Thêm fallback backend origins** - tự động thêm `delta-customer.onrender.com`
- **Tránh duplicate processing** - flag `messageReceived` để tránh xử lý nhiều lần
- **Cải thiện logging** - thêm log chi tiết để debug
- **Cleanup tốt hơn** - đảm bảo clear timeout/interval

### 3. Backend - Cấu hình Helmet
**File:** `apps/customer-backend/src/server.ts`

- **Tắt Cross-Origin-Opener-Policy** - cho phép popup communication
- **Tắt Cross-Origin-Embedder-Policy** - không chặn postMessage
- **Cho phép inline script** - cần cho OAuth callback page

### 4. Backend - Thêm Logging
**File:** `apps/customer-backend/src/modules/auth/auth-oauth.routes.js`

- Log request origin, referer
- Log CLIENT_ORIGINS
- Log chi tiết trong callback script

## 🔄 Flow hoạt động

1. **User click "Tiếp tục với Google"**
   - Frontend mở popup với URL: `${API_URL}/api/auth/google?origin=${window.location.origin}`
   - Log: `[OAuth] Frontend - Opening Google popup...`

2. **Backend redirect đến Google**
   - Passport authenticate redirect đến Google OAuth
   - User đăng nhập trên Google

3. **Google callback về backend**
   - URL: `/api/auth/google/callback?code=...`
   - Backend tạo session và accessToken
   - Backend trả về HTML page với script

4. **Backend script gửi postMessage**
   - Gửi đến tất cả CLIENT_ORIGINS
   - Gửi với wildcard "*" để đảm bảo
   - Đóng popup sau 50ms

5. **Frontend nhận message**
   - Kiểm tra payload hợp lệ (có `accessToken`)
   - Chấp nhận message nếu có payload hợp lệ (bỏ qua origin check)
   - Set token, fetch user, redirect
   - Đóng popup từ frontend

## 🐛 Các vấn đề đã fix

1. ✅ HTML/CSS phức tạp làm chậm script
2. ✅ Origin check quá strict
3. ✅ Delay quá lâu khiến popup bị kẹt
4. ✅ Helmet chặn popup communication
5. ✅ Thiếu fallback khi popup không đóng được
6. ✅ Message không được nhận do origin mismatch

## 📝 Lưu ý quan trọng

1. **VITE_API_URL** phải được set trên Vercel để frontend parse đúng backend origin
2. **CLIENT_URLS** phải chứa tất cả frontend URLs (production, preview)
3. **Helmet config** đã được điều chỉnh để không chặn popup
4. **Wildcard "*"** được dùng để đảm bảo message được nhận (chỉ trong OAuth callback)

## 🧪 Cách test

1. Mở browser console (F12)
2. Click "Tiếp tục với Google"
3. Xem logs:
   - `[OAuth] Frontend - Opening Google popup...`
   - `[OAuth] Callback script started` (trong popup)
   - `[OAuth] ✅ Sent with wildcard (*)`
   - `[OAuth] Frontend - Received message from origin: ...`
   - `[OAuth] ✅ Frontend - Received access token from popup`
4. Popup sẽ tự đóng và redirect đến `/app`

## 🔧 Nếu vẫn bị kẹt

1. Kiểm tra console logs để xem message có được gửi/nhận không
2. Kiểm tra `VITE_API_URL` trên Vercel
3. Kiểm tra `CLIENT_URLS` trên Render
4. Kiểm tra browser có chặn popup không
5. Thử trên browser khác (Chrome, Firefox, Edge)

