# 🚀 Hướng dẫn Start VNPay Dev - Đơn giản nhất

## ⭐ Cách 0: Cloudflare Tunnel (KHUYẾN NGHỊ - Không có warning page!)

### Bước 1: Start Cloudflare Tunnel
```bash
cd apps/customer-backend
npm run start:cloudflare
```

Script sẽ tự động:
- Khởi động Cloudflare Tunnel
- Hiển thị Public URL và IPN URL
- Bạn chỉ cần copy IPN URL

### Bước 2: Update .env
Copy IPN URL từ output và chạy:
```bash
node scripts/update-ipn-url.js <cloudflare-url>
```

Hoặc update thủ công trong `.env`:
```
VNP_IPN_URL="https://abc123.trycloudflare.com/api/webhooks/vnpay/ipn"
```

### Bước 3: Start server
```bash
npm run dev
```

### Bước 4: Kiểm tra
```bash
npm run health:vnpay
```

✅ **Ưu điểm Cloudflare Tunnel:**
- ✅ KHÔNG CÓ warning page (VNPay có thể gọi IPN được!)
- ✅ Miễn phí
- ✅ Dễ sử dụng

---

## Cách 1: Ngrok (Tự động)

### Bước 1: Mở Terminal 1 - Start ngrok
```bash
cd apps/customer-backend
npx ngrok http 8000
```

Bạn sẽ thấy:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

**Copy URL này** (ví dụ: `https://abc123.ngrok.io`)

### Bước 2: Mở Terminal 2 - Update .env
```bash
cd apps/customer-backend
node scripts/update-ipn-url.js https://abc123.ngrok.io
```

Hoặc nếu ngrok đã chạy, chỉ cần:
```bash
npm run update:ipn-url
```

### Bước 3: Mở Terminal 3 - Start server
```bash
cd apps/customer-backend
npm run dev
```

### Bước 4: Kiểm tra
```bash
npm run health:vnpay
```

✅ Tất cả checks phải pass!

## Cách 2: Thủ công (Nếu script không hoạt động)

### Bước 1: Start ngrok
```bash
npx ngrok http 8000
```

Copy URL từ output (ví dụ: `https://abc123.ngrok.io`)

### Bước 2: Update .env thủ công

Mở file `.env` và tìm dòng:
```
VNP_IPN_URL="http://localhost:8000/api/webhooks/vnpay/ipn"
```

Thay bằng:
```
VNP_IPN_URL="https://abc123.ngrok.io/api/webhooks/vnpay/ipn"
```

(Lưu ý: Thay `abc123.ngrok.io` bằng URL thực tế từ ngrok của bạn)

### Bước 3: Start server
```bash
npm run dev
```

### Bước 4: Kiểm tra
```bash
npm run health:vnpay
```

## ⚠️ Lưu ý

### Cloudflare Tunnel:
- ✅ **KHÔNG CÓ warning page** - VNPay có thể gọi IPN được!
- ⚠️ URL thay đổi mỗi lần restart
- ⚠️ Đảm bảo Cloudflare Tunnel đang chạy khi test

### Ngrok:
- ⚠️ **CÓ warning page** (free plan) - có thể gây lỗi 99!
- ⚠️ URL thay đổi mỗi lần restart ngrok (free plan)
- ⚠️ Mỗi lần restart ngrok, cần update `.env` lại
- ⚠️ Đảm bảo ngrok đang chạy khi test thanh toán

## ✅ Checklist

### Nếu dùng Cloudflare Tunnel:
- [ ] Cloudflare Tunnel đang chạy (`npm run start:cloudflare`)
- [ ] `.env` đã được update với IPN URL từ Cloudflare
- [ ] Server đang chạy trên port 8000 (`npm run dev`)
- [ ] `npm run health:vnpay` - tất cả checks pass

### Nếu dùng Ngrok:
- [ ] Ngrok đang chạy (Terminal 1)
- [ ] `.env` đã được update với IPN URL mới
- [ ] Server đang chạy trên port 8000 (Terminal 3)
- [ ] `npm run health:vnpay` - tất cả checks pass

## 🎉 Hoàn tất!

Bây giờ bạn có thể test thanh toán VNPay!

