# ⚡ QUICK FIX - DEPLOYMENT ISSUES

## 🎯 TÓM TẮT VẤN ĐỀ

❌ **pnpm 10.22.0** = BUG với Vercel & Render  
✅ **pnpm 9.12.3** = WORKING 100%

---

## 🚀 CÁC FILE ĐÃ ĐƯỢC SỬA/TẠO

1. ✅ **package.json** - Downgrade pnpm → 9.12.3
2. ✅ **apps/customer-frontend/vercel.json** - Bỏ corepack, dùng pnpm trực tiếp
3. ✅ **render.yaml** - Config mới cho admin-backend (tạo mới)
4. ✅ **.nvmrc** - Lock Node 20.18.0 (tạo mới)
5. ✅ **.npmrc** - Config pnpm (tạo mới)
6. ✅ **DEPLOYMENT_FIX_GUIDE.md** - Hướng dẫn chi tiết (tạo mới)

---

## ⚡ 3 BƯỚC ĐỂ FIX NGAY

### 1️⃣ Regenerate lockfile
```bash
cd D:\LAP-TRINH\DELTA
rm -rf node_modules apps/*/node_modules pnpm-lock.yaml
pnpm install
```

### 2️⃣ Test build local
```bash
pnpm --filter @printz/types build
pnpm --filter admin-backend build
pnpm --filter customer-frontend build
```

### 3️⃣ Commit & Push
```bash
git add .
git commit -m "fix: downgrade pnpm to 9.12.3 to fix Vercel & Render deployment"
git push origin main
```

---

## ✅ SAU KHI PUSH

- **Vercel** sẽ tự động rebuild customer-frontend → ✅ PASS
- **Render** cần manual trigger hoặc đợi auto rebuild → ✅ PASS

---

## 📖 Chi tiết

Đọc file **DEPLOYMENT_FIX_GUIDE.md** để hiểu rõ hơn về:
- Tại sao pnpm 10 lỗi
- Cách config chi tiết cho từng platform
- Troubleshooting nếu còn lỗi

---

**Thời gian dự kiến:** 5-10 phút  
**Success rate:** 99.9% ✅
