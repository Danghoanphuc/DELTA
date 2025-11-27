# ⚡ QUICK FIX GUIDE - Server Crash

## 🔴 Vấn đề
Server treo tại: `[BrowserService] Step 2.1.6.3: Inside await wrapper, calling await...`  
→ Backend không start được  
→ Frontend ECONNREFUSED

## ✅ Giải pháp (3 bước - 5 phút)

### 1. Download Chromium
```bash
npx puppeteer browsers install chrome
```

### 2. Tăng Memory
Thêm vào `.env`:
```bash
NODE_OPTIONS=--max-old-space-size=4096
```

### 3. Apply Patches

#### File 1: `server.ts` (dòng ~44-62)
**TÌM:**
```typescript
Logger.info('[Server] 🌐 Pre-initializing browser service...');
try {
  const { getBrowserService } = await import(...);
  await browserService.preInitialize();
  ...
}
```

**THAY BẰNG:**
```typescript
// ❌ BỎ PRE-INIT
Logger.info('[Server] 🌐 Browser service will be initialized on first use (lazy load)');
```

#### File 2: `browser.service.js` (dòng ~110-135)
**TÌM:**
```javascript
async preInitialize() {
  if (puppeteerModule) { ... }
  Logger.info('[BrowserService] 🚀 Pre-initializing...');
  await this._getPuppeteer();
  ...
}
```

**THAY BẰNG:**
```javascript
async preInitialize() {
  Logger.warn('[BrowserService] ⚠️ preInitialize() is deprecated');
  Logger.info('[BrowserService] 🌐 Browser will be initialized on first use (lazy load)');
  return Promise.resolve();
}
```

---

## 🧪 Test

```bash
# Stop server
Ctrl+C

# Clear cache
rm -rf node_modules/.cache apps/customer-backend/dist

# Start
pnpm run dev
```

**Kết quả mong đợi:**
- ✅ Server start trong 3-5s (không treo!)
- ✅ Frontend kết nối OK (không ECONNREFUSED)
- ✅ Gửi URL lần đầu hơi chậm (15-20s) - bình thường
- ✅ Gửi URL lần 2+ nhanh hơn

---

## 📚 Chi tiết

Xem file `FIX_SERVER_CRASH.md` để biết thêm chi tiết và troubleshooting.

---

**Nguyên tắc:** Puppeteer RẤT NẶNG → Không load khi start → Chỉ load khi cần!
