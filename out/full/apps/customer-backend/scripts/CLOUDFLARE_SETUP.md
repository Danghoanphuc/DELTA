# Setup Cloudflare Tunnel cho VNPay

## 🚀 Quick Start

### Bước 1: Cài đặt Cloudflare Tunnel

```bash
npm install -g cloudflared
```

### Bước 2: Start Cloudflare Tunnel

**Mở Terminal mới và chạy:**
```bash
cloudflared tunnel --url http://localhost:8000
```

Bạn sẽ thấy output như:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://abc123.trycloudflare.com                                                         |
+--------------------------------------------------------------------------------------------+
```

**Copy URL này** (ví dụ: `https://abc123.trycloudflare.com`)

### Bước 3: Update .env

**Trong terminal hiện tại:**
```bash
node scripts/update-ipn-url.js https://abc123.trycloudflare.com
```

### Bước 4: Update IPN URL trong VNPay

1. Vào: https://sandbox.vnpayment.vn/merchantv2/
2. Vào **Cấu hình IPN URL**
3. Update với URL mới:
   ```
   https://abc123.trycloudflare.com/api/webhooks/vnpay/ipn
   ```
4. **Lưu**

### Bước 5: Test

1. Restart server: `npm run dev`
2. Test thanh toán VNPay
3. Kiểm tra logs - nếu thấy `[VnPayWebhook] Nhận IPN request` → Thành công! ✅

## ✅ Lợi ích Cloudflare Tunnel

- ✅ **KHÔNG CÓ warning page** - VNPay gọi được ngay
- ✅ **FREE** - Không cần trả phí
- ✅ **Nhanh** - Tốc độ tốt
- ✅ **Ổn định** - Ít timeout

## ⚠️ Lưu ý

- Giữ terminal Cloudflare Tunnel **MỞ** khi test
- URL thay đổi mỗi lần restart → Cần update lại IPN URL trong VNPay
- Nếu restart Cloudflare Tunnel, cần update IPN URL lại

## 🎉 Hoàn tất!

Bây giờ VNPay có thể gọi được IPN URL mà không bị chặn bởi warning page!

