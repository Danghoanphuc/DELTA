# 🔧 FIX: Server Crash Khi Import Puppeteer

## 🔴 VẤN ĐỀ

Server bị **TREO HOÀN TOÀN** tại bước:
```
[BrowserService] 📦 Step 2.1.6.3: Inside await wrapper, calling await...
```

**Nguyên nhân:** Puppeteer import quá nặng (~500MB), block event loop, server không thể start.

---

## ✅ GIẢI PHÁP - 3 BƯỚC

### **BƯỚC 1: Pre-Download Chromium**

Mở terminal tại `D:\LAP-TRINH\DELTA`, chạy:

```bash
# Stop server hiện tại (Ctrl+C)

# Download Chromium trước
npx puppeteer browsers install chrome
```

**Kết quả mong đợi:**
```
Chrome@... downloaded to .../.cache/puppeteer/chrome/...
✅ Chromium đã được download!
```

---

### **BƯỚC 2: Tăng Node.js Memory Limit**

Tạo file `.env` tại root project (nếu chưa có), thêm dòng:

```bash
# D:\LAP-TRINH\DELTA\.env
NODE_OPTIONS=--max-old-space-size=4096
```

Hoặc update file `package.json`:

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=--max-old-space-size=4096 pnpm dev:services:down && pnpm dev:services:up && concurrently \"pnpm dev:be\" \"pnpm dev:fe\"",
    "dev:be": "cross-env NODE_OPTIONS=--max-old-space-size=4096 pnpm --filter ./apps/customer-backend dev"
  }
}
```

**Cài đặt cross-env (nếu chưa có):**
```bash
pnpm add -D cross-env
```

---

### **BƯỚC 3: Bỏ Pre-Initialization (Dùng Lazy Load)**

#### 3.1. Sửa `server.ts`

Tìm dòng:
```typescript
// ✅ CRITICAL: Pre-initialize BrowserService NGAY SAU KHI KẾT NỐI DB
Logger.info('[Server] 🌐 Pre-initializing browser service...');
try {
  const { getBrowserService } = await import('./modules/chat/services/browser.service.js');
  const browserService = getBrowserService();
  await browserService.preInitialize();
  Logger.success('[Server] ✅ Browser service ready');
} catch (browserError) {
  Logger.error('[Server] ⚠️ Browser pre-init failed, will retry on first use:', browserError);
}
```

**COMMENT TOÀN BỘ ĐOẠN CODE NÀY:**

```typescript
// ❌ BỎ PRE-INIT: Puppeteer sẽ được load lazy khi cần
// Logger.info('[Server] 🌐 Pre-initializing browser service...');
// try {
//   const { getBrowserService } = await import('./modules/chat/services/browser.service.js');
//   const browserService = getBrowserService();
//   await browserService.preInitialize();
//   Logger.success('[Server] ✅ Browser service ready');
// } catch (browserError) {
//   Logger.error('[Server] ⚠️ Browser pre-init failed, will retry on first use:', browserError);
// }

// ✅ THAY BẰNG: Log đơn giản
Logger.info('[Server] 🌐 Browser service will be initialized on first use (lazy load)');
```

#### 3.2. Sửa `browser.service.js`

Tìm hàm `preInitialize()` trong `browser.service.js`:

```javascript
async preInitialize() {
  if (puppeteerModule) {
    Logger.info('[BrowserService] Already pre-initialized');
    return;
  }

  Logger.info('[BrowserService] 🚀 Pre-initializing Puppeteer at server startup...');
  
  try {
    // ✅ Import Puppeteer TRƯỚC KHI có bất kỳ job nào
    await this._getPuppeteer();
    
    // ✅ Pre-launch browser để sẵn sàng ngay
    Logger.info('[BrowserService] 🚀 Pre-launching browser...');
    await this.getBrowser();
    
    Logger.info('[BrowserService] ✅ Pre-initialization completed successfully');
  } catch (error) {
    Logger.error('[BrowserService] ❌ Pre-initialization failed:', {
      message: error?.message || 'Unknown',
      name: error?.name || 'Error',
      code: error?.code || 'NO_CODE',
    });
    // ✅ Không throw để server vẫn có thể start
    Logger.warn('[BrowserService] ⚠️ Browser will be initialized on first use');
  }
}
```

**ĐÁNH DẤU LÀ DEPRECATED (hoặc xóa hẳn):**

```javascript
/**
 * @deprecated Không dùng nữa - gây crash server
 * Browser sẽ được khởi tạo lazy khi cần
 */
async preInitialize() {
  Logger.warn('[BrowserService] ⚠️ preInitialize() is deprecated and does nothing');
  Logger.info('[BrowserService] Browser will be initialized on first use (lazy load)');
  // ✅ Không làm gì cả - để lazy load thực sự
  return;
}
```

---

## 🧪 TEST

### 1. Restart Server

```bash
# Stop server (Ctrl+C)

# Clear cache
rm -rf node_modules/.cache
rm -rf apps/customer-backend/dist

# Start lại
pnpm run dev
```

### 2. Kiểm tra Log

**Server PHẢI start thành công:**
```
✅ Đã kết nối MongoDB Atlas thành công!
✅ Đã kết nối Redis thành công!
✅ Đã kết nối Database & Redis thành công.
🌐 Browser service will be initialized on first use (lazy load)
[Server] 🚀 Server đang chạy tại http://localhost:3000
```

**Frontend PHẢI kết nối được API:**
```
[vite] ready in 293 ms
➜ Local: http://localhost:5173/
```

**KHÔNG CÒN LỖI ECONNREFUSED!**

### 3. Test Gửi URL

1. Mở frontend: `http://localhost:5173`
2. Gửi một Canva URL trong chat
3. Server sẽ lazy load Puppeteer **CHỈ KHI CẦN**
4. Log sẽ hiện:
```
[BrowserService] 📦 Importing Puppeteer...
[BrowserService] 💓 Import still running... (2s)
[BrowserService] 💓 Import still running... (4s)
[BrowserService] ✅ Import OK - Module validated successfully
[BrowserService] 🚀 Launching...
[BrowserService] ✅ Browser launched successfully
```

5. Screenshot thành công, AI analyze thành công!

---

## 🎯 KẾT QUẢ MONG ĐỢI

### ✅ Trước đó (Lỗi):
```
Server start → Treo ở import Puppeteer → Crash → Frontend ECONNREFUSED
```

### ✅ Sau khi fix:
```
Server start → Skip Puppeteer → Server ready trong 3-5s →
User gửi URL → Lazy load Puppeteer (15-20s lần đầu) →
Screenshot + AI OK → Job complete!
```

---

## 🔍 TROUBLESHOOTING

### Nếu vẫn treo:

1. **Check memory:**
```bash
# Windows PowerShell
Get-Process node | Select-Object Name, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet / 1MB, 2)}}
```

Nếu Memory > 1GB → Có memory leak

2. **Check Chromium:**
```bash
# Xem Chromium đã download chưa
ls ~/.cache/puppeteer/chrome  # Linux/Mac
dir %USERPROFILE%\.cache\puppeteer\chrome  # Windows
```

3. **Force clean:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules
rm -rf pnpm-lock.yaml
pnpm install
```

4. **Nếu vẫn không được:**
```bash
# Dùng Playwright thay vì Puppeteer (nhẹ hơn)
pnpm remove puppeteer
pnpm add playwright
# Sau đó cần refactor browser.service.js
```

---

## 📝 TÓM TẮT

1. ✅ Download Chromium trước: `npx puppeteer browsers install chrome`
2. ✅ Tăng memory: `NODE_OPTIONS=--max-old-space-size=4096`
3. ✅ Bỏ pre-init trong `server.ts` và `browser.service.js`
4. ✅ Test: Server start nhanh, Puppeteer load lazy khi cần

**Nguyên tắc:** Puppeteer RẤT NẶNG → Không load khi server start → Chỉ load khi thực sự cần!

---

## 🎉 DONE!

Phúc nghỉ ngơi đi, để code lo cho! 💪
