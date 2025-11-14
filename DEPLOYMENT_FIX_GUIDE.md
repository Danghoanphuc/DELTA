# 🚀 DEPLOYMENT GUIDE - PRINTZ MONOREPO

## ⚠️ VẤN ĐỀ ĐÃ ĐƯỢC FIX

### 🔧 Các thay đổi đã thực hiện:

#### 1. **Downgrade pnpm từ 10.22.0 → 9.12.3**
- ✅ `package.json`: Đổi `"packageManager": "pnpm@9.12.3"`
- ❌ pnpm 10.x có bug nghiêm trọng với Vercel và Render
- ✅ pnpm 9.12.3 là version ổn định, được hỗ trợ tốt nhất

#### 2. **Sửa Vercel config (customer-frontend)**
- ✅ Bỏ `corepack enable pnpm` 
- ✅ Đổi thành `pnpm install --frozen-lockfile`
- ✅ File: `apps/customer-frontend/vercel.json`

#### 3. **Tạo Render config (admin-backend)**
- ✅ Tạo file `render.yaml` tại root
- ✅ Build command không dùng corepack nữa
- ✅ Dùng trực tiếp `pnpm install --frozen-lockfile`

#### 4. **Thêm .nvmrc**
- ✅ Lock Node.js version = 20.18.0
- ✅ Đảm bảo consistency giữa local và deployment

---

## 📋 CÁC BƯỚC DEPLOYMENT

### BƯỚC 1: Regenerate lockfile với pnpm 9.12.3

```bash
# Tại D:\LAP-TRINH\DELTA

# Xóa node_modules và lockfile cũ
rm -rf node_modules apps/*/node_modules packages/*/node_modules pnpm-lock.yaml

# Cài pnpm 9.12.3 (nếu chưa có)
npm install -g pnpm@9.12.3

# Hoặc dùng corepack
corepack prepare pnpm@9.12.3 --activate

# Cài lại dependencies
pnpm install

# Verify lockfile version
head -n 5 pnpm-lock.yaml
# Phải thấy: lockfileVersion: '9.0'
```

### BƯỚC 2: Test build locally

```bash
# Build packages/types trước
pnpm --filter @printz/types build

# Build admin-backend
pnpm --filter admin-backend build

# Build customer-frontend  
pnpm --filter customer-frontend build

# Nếu tất cả build OK → Tiếp tục
```

### BƯỚC 3: Commit và push

```bash
git add .
git commit -m "fix: downgrade pnpm to 9.12.3, fix deployment configs"
git push origin main
```

---

## 🎯 DEPLOYMENT TRÊN VERCEL (customer-frontend)

### Option A: Auto deploy từ Git (Recommended)

1. **Vercel sẽ tự động detect push**
2. **Vercel sẽ đọc `apps/customer-frontend/vercel.json`**
3. **Build command tự động:**
   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter @printz/types build && pnpm --filter customer-frontend build
   ```

### Option B: Manual config (nếu cần)

1. Vào Vercel Dashboard → Project Settings
2. **Build & Development Settings:**
   - Framework Preset: `Vite`
   - Root Directory: `apps/customer-frontend`
   - Build Command: `pnpm --filter @printz/types build && pnpm --filter customer-frontend build`
   - Output Directory: `dist`
   - Install Command: `pnpm install --frozen-lockfile`

3. **Environment Variables:**
   - Copy từ `.env` của customer-frontend
   - Add vào Vercel Dashboard

---

## 🎯 DEPLOYMENT TRÊN RENDER (admin-backend)

### Option A: Dùng render.yaml (Recommended)

1. **Render sẽ tự động đọc `render.yaml`** ở root
2. **Nếu chưa, connect GitHub repo:**
   - Dashboard → New → Blueprint
   - Chọn repo: `Danghoanphuc/DELTA`
   - Render sẽ detect `render.yaml`

### Option B: Manual config (nếu render.yaml không work)

1. Vào Render Dashboard → admin-backend service
2. **Build & Deploy:**
   - Build Command: 
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @printz/types build && pnpm --filter admin-backend build
     ```
   - Start Command: 
     ```bash
     node apps/admin-backend/dist/index.js
     ```

3. **Environment Variables:**
   - Add: `NODE_ENV=production`
   - Add: `PNPM_HOME=/opt/render/project/.pnpm`
   - Copy các env khác từ `.env`

---

## 🐛 TROUBLESHOOTING

### Lỗi: "lockfileVersion mismatch"

```bash
# Solution: Regenerate lockfile
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: regenerate lockfile with pnpm 9.12.3"
git push
```

### Lỗi: "EROFS: read-only file system"

✅ **ĐÃ FIX** - Không dùng `corepack enable` nữa

### Lỗi: "ERR_INVALID_THIS" trên Vercel

✅ **ĐÃ FIX** - Downgrade pnpm về 9.12.3

### Lỗi: "Cannot find module @printz/types"

```bash
# Đảm bảo build types trước
pnpm --filter @printz/types build

# Rồi mới build app
pnpm --filter admin-backend build
```

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [ ] `package.json` có `"packageManager": "pnpm@9.12.3"`
- [ ] `pnpm-lock.yaml` có `lockfileVersion: '9.0'`
- [ ] `apps/customer-frontend/vercel.json` không có `corepack enable`
- [ ] `render.yaml` đã được tạo ở root
- [ ] `.nvmrc` có Node version 20.18.0
- [ ] Test build locally thành công
- [ ] Đã commit tất cả changes
- [ ] Đã push lên GitHub

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi làm theo guide này:

✅ **Vercel (customer-frontend)**: Build và deploy thành công  
✅ **Render (admin-backend)**: Build và deploy thành công  
✅ **Vercel (admin-frontend)**: Đã thành công từ trước  
✅ **Render (customer-backend)**: Đã thành công từ trước

---

## 📞 LƯU Ý

1. **Không bao giờ dùng pnpm 10.x** cho production hiện tại
2. **Luôn dùng `--frozen-lockfile`** trong CI/CD
3. **Build @printz/types trước** mọi app khác
4. Nếu vẫn lỗi, check logs cụ thể và ping lại

---

**Last Updated:** 2025-11-14  
**Author:** Claude AI + Phuc Dang
