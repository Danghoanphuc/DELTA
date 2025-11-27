# ✅ CHECKLIST - Test Fix Browser Crash

## 🔍 Các File Đã Sửa

- ✅ `apps/customer-backend/src/modules/chat/services/browser.service.js`
- ✅ `apps/customer-backend/src/server.ts`
- ✅ `apps/customer-backend/src/modules/chat/workers/url-processor.worker.js`

---

## 🧪 Các Bước Test

### 1. **Restart Server**
```bash
# Stop server hiện tại (Ctrl+C)
^C

# Start lại
pnpm run dev
```

### 2. **Kiểm Tra Log Startup**
Sau khi start, tìm các dòng log này:

```
✅ Đã kết nối Database & Redis thành công.
[Server] 🌐 Pre-initializing browser service...
[BrowserService] 🚀 Pre-initializing Puppeteer at server startup...
[BrowserService] 📦 Importing Puppeteer...
[BrowserService] 💓 Import still running... (2.0s)
[BrowserService] 💓 Import still running... (4.0s)
[BrowserService] 🚀 Pre-launching browser...
[BrowserService] ✅ Browser service ready
[Server] ✅ Browser service ready
✅ Đã khởi chạy Queue Workers...
```

**✅ Nếu thấy các log trên → Pre-initialization thành công!**

**❌ Nếu thấy error hoặc warning:**
- Copy log error gửi cho mình
- Server vẫn có thể chạy được (chỉ là browser chưa sẵn sàng)

---

### 3. **Test URL Preview (Thử Nghiệm Thực Tế)**

1. Vào chat interface
2. Gửi một Canva URL (hoặc bất kỳ URL nào)
   ```
   https://www.canva.com/design/DAG4dV5Q_6M/B-Ol59kwb0FlZSs5II58cA/edit
   ```
3. Theo dõi log server

**Các log mong đợi:**
```
[URL Processor] 🚀 Starting job 83 for URL: https://www.canva.com/...
[URL Processor] 🔄 Getting browser service...
[URL Processor] ✅ Browser service ready
[URL Processor] 📸 Starting screenshot...
[BrowserService] 🎬 Bắt đầu chụp ảnh: https://www.canva.com/...
[BrowserService] 🔄 Đang lấy browser instance...
[BrowserService] ✅ Browser đã connected
[BrowserService] 🌐 Navigating to https://www.canva.com/...
[BrowserService] ✅ Navigation successful
[BrowserService] 📸 Taking screenshot...
[BrowserService] ✅ Screenshot completed in 3.45s
[URL Processor] ✅ Screenshot completed in 3.45s
[URL Processor] ☁️ Uploading to R2...
[URL Processor] ✅ Upload complete (0.5s)
[URL Processor] 🤖 Starting AI analysis...
[URL Processor] ✅ AI analysis complete (12.3s)
[URL Processor] ✅ Job 83 completed in 16.8s
```

**✅ SUCCESS: Server KHÔNG crash, job hoàn thành thành công!**

---

### 4. **Kiểm Tra Kết Quả Frontend**

- ✅ Screenshot xuất hiện trong chat
- ✅ AI analysis được hiển thị
- ✅ Không có error message

---

## 🚨 Các Trường Hợp Cần Lưu Ý

### Case 1: "Import still running..." quá lâu (>20s)
**Nguyên nhân:** Puppeteer đang download Chromium lần đầu
**Giải pháp:** Đợi download xong, lần sau sẽ nhanh hơn

### Case 2: Pre-init failed nhưng server vẫn chạy
**OK!** Server được thiết kế để vẫn start được.
Browser sẽ được init lại khi có job đầu tiên.

### Case 3: Server vẫn crash khi có job
**Không nên xảy ra!** Nếu crash:
1. Check log để xem crash ở đâu
2. Check memory usage: `tasklist /FI "IMAGENAME eq node.exe" /FO LIST`
3. Gửi log cho mình analyze

---

## 📊 Monitoring

### Memory Usage (Optional)
Nếu muốn theo dõi memory:
```bash
# Windows PowerShell
while($true) { 
  Get-Process node | Select-Object Name, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet / 1MB, 2)}} 
  Start-Sleep -Seconds 5 
}
```

**Memory bình thường:**
- Sau start: ~150-200MB
- Sau load Puppeteer: ~300-400MB
- Khi chạy job: ~400-600MB

**⚠️ Cảnh báo nếu:** Memory > 1GB (có thể memory leak)

---

## ✅ Checklist Cuối Cùng

- [ ] Server start thành công
- [ ] Thấy log "Browser service ready"
- [ ] Gửi URL trong chat
- [ ] Screenshot được tạo thành công
- [ ] AI analysis hoàn tất
- [ ] Server KHÔNG crash
- [ ] Có thể gửi nhiều URL liên tiếp

**Nếu tất cả đều ✅ → FIX THÀNH CÔNG!** 🎉

---

## 🆘 Nếu Vẫn Gặp Vấn Đề

1. Copy TOÀN BỘ log từ lúc server start đến lúc crash
2. Screenshot nếu có lỗi trên UI
3. Gửi cho mình analyze tiếp

**Nhưng theo lý thuyết, fix này sẽ giải quyết 99% vấn đề!** 💪
