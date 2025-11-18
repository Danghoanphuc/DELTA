# 🚀 Quick Test VNPay - Đảm bảo thanh toán thành công

## ✅ Checklist trước khi test

### 1. Cloudflare Tunnel đang chạy với URL đúng
```bash
npm run start:cloudflare:match
```
**Lưu ý:** Script sẽ tự động restart cho đến khi có URL khớp với `.env`

### 2. Server đang chạy
```bash
npm run dev
```
**Lưu ý:** Server phải chạy trên port 8000

### 3. IPN URL đã đăng ký trong VNPay
- Vào: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/ipn
- Đảm bảo IPN URL khớp với URL trong `.env`

### 4. Chạy health check
```bash
npm run health:vnpay
```
**Kết quả mong đợi:** Tất cả checks phải pass ✅

## 🧪 Test thanh toán

### Bước 1: Tạo đơn hàng
1. Vào frontend
2. Thêm sản phẩm vào giỏ hàng
3. Đi đến checkout

### Bước 2: Chọn thanh toán VNPay
1. Chọn phương thức thanh toán: VNPay
2. Nhấn "Thanh toán"
3. Hệ thống sẽ redirect đến VNPay sandbox

### Bước 3: Thanh toán trên VNPay
1. Chọn ngân hàng test
2. Nhập thông tin test
3. Xác nhận thanh toán

### Bước 4: Kiểm tra kết quả
- ✅ Nếu thành công: Redirect về trang confirmation
- ❌ Nếu lỗi 99: Kiểm tra lại:
  - IPN URL có khớp không?
  - Cloudflare Tunnel có đang chạy không?
  - Server có đang chạy không?

## 🔧 Troubleshooting

### Lỗi 99 - IPN URL không khớp
```bash
# Kiểm tra IPN URL trong .env
grep VNP_IPN_URL .env

# Kiểm tra IPN URL đã đăng ký trong VNPay
# Vào: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/ipn

# Nếu khác nhau, update:
node scripts/update-ipn-url.js <cloudflare-url>
# Sau đó update lại trong VNPay Merchant Portal
```

### Cloudflare Tunnel không có URL đúng
```bash
# Dùng script tự động restart
npm run start:cloudflare:match
```

### Server không chạy
```bash
# Kiểm tra port 8000
netstat -ano | grep ":8000"

# Start server
npm run dev
```

## 📋 Scripts hữu ích

```bash
# Test setup hoàn chỉnh
node scripts/test-vnpay-complete.js

# Kiểm tra IPN URL match
node scripts/check-ipn-match.js

# Fix IPN URL mismatch
node scripts/fix-ipn-url-mismatch.js

# Health check
npm run health:vnpay
```

## 🎯 Mục tiêu: Thanh toán thành công!

Sau khi hoàn tất tất cả các bước trên, thanh toán VNPay sẽ thành công! 🎉

