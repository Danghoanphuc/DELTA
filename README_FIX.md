# 🎯 FIX SERVER CRASH - COMPLETE GUIDE

Phúc ơi, tất cả file fix đã sẵn sàng! Đọc theo thứ tự này nhé:

---

## 📚 ĐỌC THEO THỨ TỰ

### 1️⃣ **QUICK_FIX.md** (2 phút)
   - Đọc đầu tiên để hiểu nhanh vấn đề và giải pháp
   - 3 bước đơn giản: Download Chromium → Tăng Memory → Apply Patches
   - [Xem ngay →](./QUICK_FIX.md)

### 2️⃣ **VISUALIZATION.md** (3 phút)
   - Xem flow chart để hiểu TẠI SAO bị crash
   - So sánh TRƯỚC vs SAU khi fix
   - Hiểu rõ trade-offs
   - [Xem ngay →](./VISUALIZATION.md)

### 3️⃣ **PATCH_*.txt** (5 phút)
   - Apply các patches vào code:
     - [PATCH_server.ts.txt](./PATCH_server.ts.txt)
     - [PATCH_browser.service.js.txt](./PATCH_browser.service.js.txt)
     - [PATCH_package.json.txt](./PATCH_package.json.txt)

### 4️⃣ **FIX_SERVER_CRASH.md** (10 phút)
   - Hướng dẫn chi tiết từng bước
   - Troubleshooting nếu vẫn gặp vấn đề
   - [Xem ngay →](./FIX_SERVER_CRASH.md)

### 5️⃣ **test-fix.sh** (Optional)
   - Run script này để verify fix
   - Kiểm tra xem tất cả đã OK chưa
   - [Xem ngay →](./test-fix.sh)

---

## ⚡ QUICK START (Nếu muốn fix ngay lập tức)

```bash
# 1. Download Chromium
npx puppeteer browsers install chrome

# 2. Tăng memory - Thêm vào .env
echo "NODE_OPTIONS=--max-old-space-size=4096" >> .env

# 3. Comment out pre-init trong server.ts (dòng 44-62)
# 4. Disable preInitialize() trong browser.service.js (dòng 110-135)

# 5. Restart server
pnpm run dev
```

**Kết quả:** Server start trong 7-8s, không crash nữa! ✅

---

## 📋 CHECKLIST

Sau khi apply fix, check các điều sau:

- [ ] Chromium đã download: `npx puppeteer browsers list`
- [ ] `.env` có `NODE_OPTIONS=--max-old-space-size=4096`
- [ ] `server.ts` đã comment out pre-init code
- [ ] `browser.service.js` preInitialize() trả về `Promise.resolve()`
- [ ] Server start thành công trong 7-8s
- [ ] Frontend kết nối OK (không còn ECONNREFUSED)
- [ ] Test gửi URL: Lần đầu ~35-45s (bình thường), lần sau ~18s

---

## 🆘 NẾU VẪN CRASH

1. **Check log xem crash ở đâu**
2. **Check memory:** `Get-Process node | Select-Object Memory`
3. **Xem chi tiết trong:** [FIX_SERVER_CRASH.md](./FIX_SERVER_CRASH.md) → Section Troubleshooting

---

## 🎉 TÓM TẮT

**Vấn đề:**
- Server crash khi pre-load Puppeteer
- Puppeteer quá nặng (~500MB), block event loop
- Frontend không kết nối được API

**Giải pháp:**
- Bỏ pre-init, dùng lazy load
- Tăng Node.js memory lên 4GB
- Puppeteer chỉ load khi user gửi URL lần đầu

**Kết quả:**
- Server start nhanh (7-8s)
- Frontend hoạt động bình thường
- First URL hơi chậm (35-45s) - ACCEPTABLE
- Next URLs nhanh hơn (18s)

---

## 📞 SUPPORT

Nếu vẫn gặp vấn đề sau khi apply fix:

1. Copy **TOÀN BỘ LOG** từ lúc start đến lúc crash
2. Screenshot error (nếu có)
3. Check file [FIX_SERVER_CRASH.md](./FIX_SERVER_CRASH.md) section Troubleshooting
4. Gửi log để mình analyze tiếp

---

**Chúc Phúc fix thành công! Nghỉ ngơi đi nhé! 💪🎉**
