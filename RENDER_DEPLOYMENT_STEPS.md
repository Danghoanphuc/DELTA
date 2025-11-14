# 🚀 HƯỚNG DẪN DEPLOY ADMIN-BACKEND TRÊN RENDER

## ✅ ĐÃ SỬA TRONG CODE

1. ✅ **render.yaml**: Đã sửa `startCommand` từ `dist/index.js` → `dist/server.js`
2. ✅ **Build Command**: Đã bỏ `corepack enable pnpm` (không cần nữa)
3. ✅ **pnpm-lock.yaml**: Đã xác nhận lockfileVersion 9.0 (tương thích pnpm 9.12.3)

---

## 📋 CÁC BƯỚC CẦN LÀM TRÊN RENDER DASHBOARD

### **BƯỚC 1: Commit và Push code lên GitHub**

```bash
git add render.yaml
git commit -m "fix: correct start command to dist/server.js in render.yaml"
git push origin main
```

### **BƯỚC 2: Vào Render Dashboard**

1. Truy cập: https://dashboard.render.com
2. Đăng nhập vào tài khoản của bạn
3. Tìm service **admin-backend** (hoặc tạo mới nếu chưa có)

### **BƯỚC 3: Cấu hình Service (Nếu Render không tự detect render.yaml)**

Nếu Render **KHÔNG** tự động đọc `render.yaml`, bạn cần cấu hình thủ công:

#### **3.1. Vào Settings → Build & Deploy**

Tìm section **Build & Deploy Settings**

#### **3.2. Cập nhật Build Command**

**XÓA HOÀN TOÀN** build command cũ (có `corepack enable pnpm`), thay bằng:

```bash
NODE_ENV=development pnpm install --frozen-lockfile && pnpm --filter @printz/types build && pnpm --filter admin-backend build
```

⚠️ **QUAN TRỌNG**: 
- ❌ **KHÔNG** dùng: `corepack enable pnpm && ...`
- ✅ **BẮT BUỘC** phải có `NODE_ENV=development` trước `pnpm install` để cài đặt `@types/*` packages (cần cho TypeScript build)
- ✅ Build command phải là: `NODE_ENV=development pnpm install --frozen-lockfile && ...`
- ℹ️ **Lưu ý**: `NODE_ENV=development` chỉ cho build time, runtime vẫn dùng `NODE_ENV=production` từ env vars

#### **3.3. Cập nhật Start Command**

Thay đổi start command thành:

```bash
node apps/admin-backend/dist/server.js
```

Hoặc nếu bạn muốn chắc chắn về đường dẫn:

```bash
cd apps/admin-backend && node dist/server.js
```

#### **3.4. Kiểm tra Root Directory**

⚠️ **QUAN TRỌNG**: 
- **Root Directory**: Phải để **TRỐNG** (empty) - không set gì cả, không phải `/`
- Render cần chạy từ root của repo để:
  - `pnpm --filter` hoạt động đúng
  - Build command có thể build `@printz/types` và `admin-backend`
  - Start command có thể tìm thấy `apps/admin-backend/dist/server.js`
- **NẾU** Root Directory đang set thành `apps/admin-backend` hoặc bất kỳ giá trị nào khác:
  - **XÓA** nó đi (để trống hoàn toàn)
  - Save và deploy lại

### **BƯỚC 4: Cấu hình Environment Variables**

Vào **Settings → Environment** và thêm/cập nhật các biến sau:

```
NODE_ENV=production
MONGODB_CONNECTIONSTRING=mongodb+srv://phucdh911_db_user:FqnRRXUeYSTcfxAM@cluster0.98qehyw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ADMIN_JWT_SECRET=DAY_LA_MOT_CHUOI_BI_MAT_RAT_KHAC_VOI_APP_CHINH_CUA_PHUC
ADMIN_APP_URL=https://admin.printz.vn
ADMIN_API_PORT=5002
FROM_EMAIL=admin@printz.vn
RESEND_API_KEY=re_iWVywHwH_9zKcUReqcnmcSqsSBk2NLMnJ
SUPERADMIN_EMAIL=phuc@printz.vn
SUPERADMIN_PASSWORD=MotMatKhauThatManh!
ADMIN_PASSWORD_RESET_TOKEN_MINUTES=30
ACCESS_TOKEN_SECRET=b09de1e3da75aa3db477cb150c471d3897679841ba4cefbed4933a4185e3f178a4ae25d835205b510b5c99f399579e5398b6a5f0044b0c1beefcab6f7b2fc5c4
```

**Lưu ý**: 
- ✅ Đảm bảo tất cả biến đều được set (không có biến nào trống)
- ✅ `PORT` sẽ được Render tự động set, không cần set thủ công
- ✅ Các secret keys nên được giữ bí mật

### **BƯỚC 5: Trigger Manual Deploy**

1. Vào tab **Manual Deploy** (hoặc click **Deploy latest commit**)
2. Chọn branch `main`
3. Click **Deploy**

### **BƯỚC 6: Theo dõi Build Logs**

1. Sau khi deploy, vào tab **Logs**
2. Theo dõi quá trình build:
   - ✅ Sẽ thấy: `NODE_ENV=development pnpm install --frozen-lockfile` chạy thành công và cài đặt cả devDependencies
   - ✅ Sẽ thấy: `pnpm --filter @printz/types build` chạy thành công
   - ✅ Sẽ thấy: `pnpm --filter admin-backend build` chạy thành công
   - ❌ **KHÔNG** còn thấy lỗi `Cannot find matching keyid` nữa

### **BƯỚC 7: Kiểm tra Deploy thành công**

Sau khi build xong, check:

1. ✅ **Build Status**: Phải là `Build successful`
2. ✅ **Service Status**: Phải là `Live`
3. ✅ **Logs**: Phải thấy message `🚀 Admin API Server listening on http://localhost:...`

---

## 🐛 TROUBLESHOOTING

### **Lỗi vẫn còn: "Cannot find matching keyid"**

**Nguyên nhân**: Render vẫn đang dùng build command cũ có `corepack enable pnpm`

**Giải pháp**:
1. Vào **Settings → Build & Deploy**
2. Xóa toàn bộ Build Command
3. Paste lại: `NODE_ENV=development pnpm install --frozen-lockfile && pnpm --filter @printz/types build && pnpm --filter admin-backend build`
4. Save và deploy lại

### **Lỗi: "Cannot find module '@printz/types'"**

**Nguyên nhân**: Package `@printz/types` chưa được build

**Giải pháp**:
- Đảm bảo build command có: `pnpm --filter @printz/types build` **TRƯỚC** `pnpm --filter admin-backend build`

### **Lỗi: "Cannot find module dist/server.js"**

**Nguyên nhân**: 
- Build chưa chạy hoặc build thất bại
- Render không preserve build artifacts giữa build phase và runtime phase
- Start command sai đường dẫn

**Giải pháp**:
1. **Kiểm tra build logs**:
   - Vào Render Dashboard → admin-backend service → Logs tab
   - Tìm dòng `==> Build successful 🎉`
   - Nếu build thành công nhưng vẫn lỗi này, có thể là vấn đề preserve artifacts

2. **Kiểm tra start command**:
   - Phải là: `cd apps/admin-backend && node dist/server.js`
   - Hoặc: `node apps/admin-backend/dist/server.js` (từ root)
   - Đảm bảo trong Render Dashboard → Settings → Build & Deploy → Start Command đúng

3. **Kiểm tra Root Directory**:
   - Render Dashboard → Settings → Build & Deploy → Root Directory
   - Phải để **TRỐNG** (empty) - không set gì cả
   - Render cần chạy từ root của repo để `pnpm --filter` hoạt động

4. **Nếu vẫn lỗi - Debug**:
   - Có thể Render không preserve `dist/` folder
   - Thử thêm debug command trong start: `cd apps/admin-backend && ls -la && node dist/server.js`
   - Hoặc thử build trong start command (không khuyến khích): `cd apps/admin-backend && pnpm build && node dist/server.js`

### **Lỗi: "Could not find a declaration file for module 'express'" (TypeScript errors)**

**Nguyên nhân**: 
- Build command không có `NODE_ENV=development` trước `pnpm install`
- pnpm bỏ qua `devDependencies` khi `NODE_ENV=production`
- TypeScript cần `@types/*` packages để build

**Giải pháp**:
1. Vào **Settings → Build & Deploy**
2. Kiểm tra Build Command phải có `NODE_ENV=development`:
   ```bash
   NODE_ENV=development pnpm install --frozen-lockfile && pnpm --filter @printz/types build && pnpm --filter admin-backend build
   ```
3. Nếu không có, thêm `NODE_ENV=development` vào trước `pnpm install`
4. Save và deploy lại

### **Lỗi: "Unknown option: 'frozen-lockfile'" hoặc "Unknown option: 'include=dev'"**

**Nguyên nhân**: 
- pnpm 9.12.3 không hỗ trợ `--include=dev` cùng với `--frozen-lockfile`
- Cần dùng cách khác để install devDependencies

**Giải pháp**:
1. Thay vì dùng `--include=dev`, dùng `NODE_ENV=development`:
   ```bash
   NODE_ENV=development pnpm install --frozen-lockfile && ...
   ```
2. Điều này sẽ force pnpm cài đặt cả devDependencies trong build time
3. Runtime vẫn dùng `NODE_ENV=production` từ environment variables

### **Lỗi: "Port already in use" hoặc "EADDRINUSE"**

**Nguyên nhân**: Conflict port

**Giải pháp**:
- Không cần set `PORT` trong env vars
- Render sẽ tự động inject `PORT` environment variable
- Code của bạn dùng `process.env.ADMIN_API_PORT || 5002`, nhưng nên dùng `process.env.PORT || 5002` để tương thích với Render

---

## 📝 CHECKLIST TRƯỚC KHI DEPLOY

- [ ] Đã commit và push `render.yaml` lên GitHub
- [ ] Build Command **KHÔNG** có `corepack enable pnpm`
- [ ] Build Command **CÓ** `NODE_ENV=development` trước `pnpm install` (cần cho TypeScript build)
- [ ] Start Command là `node apps/admin-backend/dist/server.js`
- [ ] Root Directory để trống (hoặc `/`)
- [ ] Tất cả Environment Variables đã được set
- [ ] Đã trigger manual deploy

---

## ✅ KẾT QUẢ MONG ĐỢI

Sau khi làm theo các bước trên:

✅ **Build thành công** - Không còn lỗi corepack signature  
✅ **Service Live** - Admin backend chạy và có thể truy cập  
✅ **Logs hiển thị** - Server listening message xuất hiện  

---

## 📞 LƯU Ý

1. **Render tự động detect render.yaml**: Nếu bạn đã connect repo qua Blueprint, Render sẽ tự động đọc `render.yaml`. Trong trường hợp này, chỉ cần đảm bảo file `render.yaml` đã được push lên GitHub là đủ.

2. **Manual config override render.yaml**: Nếu bạn đã set build/start command trong Dashboard, nó sẽ **override** `render.yaml`. Vì vậy, bạn phải update trong Dashboard như hướng dẫn trên.

3. **Environment Variables**: Nên set trong Dashboard, không nên hardcode trong `render.yaml` vì lý do bảo mật.

---

**Tạo bởi**: Auto (AI Assistant)  
**Ngày**: 2025-11-14
