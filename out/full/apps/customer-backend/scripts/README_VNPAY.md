# VNPay Payment Integration - Complete Setup Guide

## 📋 Tổng quan

Hệ thống đã được setup đầy đủ với các script tự động để test thanh toán VNPay trong môi trường dev.

## 🚀 Quick Start (3 bước)

### 1. Cài đặt ngrok (nếu chưa có)

```bash
# Windows (với Chocolatey)
choco install ngrok

# Mac (với Homebrew)
brew install ngrok

# Hoặc download từ: https://ngrok.com/download
```

### 2. Start server

```bash
cd apps/customer-backend
npm run dev
```

### 3. Setup ngrok và update .env

```bash
npm run setup:vnpay-dev
```

Script này sẽ:
- ✅ Kiểm tra ngrok đã cài đặt
- ✅ Start ngrok tự động
- ✅ Lấy ngrok URL
- ✅ Tự động update .env với IPN URL mới

## ✅ Kiểm tra setup

```bash
# Kiểm tra ngrok đang chạy
npm run check:ngrok

# Kiểm tra cấu hình VNPay
npm run health:vnpay
```

Tất cả checks phải pass! ✅

## 📚 Các script có sẵn

### Setup & Configuration

| Script | Mô tả |
|--------|-------|
| `npm run setup:vnpay-dev` | Setup tự động ngrok và update .env |
| `npm run check:ngrok` | Kiểm tra ngrok đang chạy và lấy URL |
| `npm run check:vnpay` | Kiểm tra cấu hình VNPay |
| `npm run health:vnpay` | Kiểm tra toàn bộ hệ thống VNPay |

### Testing

| Script | Mô tả |
|--------|-------|
| `npm run test:vnpay-ipn` | Tạo dữ liệu test cho IPN endpoint |

## 🧪 Test thanh toán

### 1. Thẻ test từ VNPay

Từ email VNPay bạn đã nhận:
- **Ngân hàng:** NCB
- **Số thẻ:** `9704198526191432198`
- **Tên chủ thẻ:** `NGUYEN VAN A`
- **Ngày phát hành:** `07/15`
- **Mật khẩu OTP:** `123456`

### 2. Quy trình test

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Setup ngrok:**
   ```bash
   npm run setup:vnpay-dev
   ```

3. **Kiểm tra:**
   ```bash
   npm run health:vnpay
   ```

4. **Test thanh toán:**
   - Mở frontend: `http://localhost:5173`
   - Tạo đơn hàng
   - Chọn VNPay
   - Dùng thẻ test ở trên
   - Nhập OTP: `123456`

5. **Kiểm tra kết quả:**
   - Xem logs backend khi VNPay gọi IPN
   - Kiểm tra đơn hàng đã được cập nhật

## 📁 Files đã tạo

### Scripts

- `scripts/setup-vnpay-dev.js` - Setup tự động (cross-platform)
- `scripts/setup-vnpay-dev.sh` - Setup tự động (bash)
- `scripts/stop-ngrok.sh` - Dừng ngrok
- `scripts/check-ngrok.js` - Kiểm tra ngrok
- `scripts/check-vnpay-config.js` - Kiểm tra cấu hình
- `scripts/test-vnpay-ipn.js` - Test IPN
- `scripts/vnpay-health-check.js` - Health check toàn bộ

### Documentation

- `scripts/VNPAY_DEV_SETUP.md` - Hướng dẫn chi tiết
- `scripts/QUICK_START.md` - Quick start guide
- `scripts/vnpay-troubleshooting.md` - Troubleshooting guide
- `docs/VNPAY_PAYMENT_FIX.md` - Tổng hợp các thay đổi

## ⚠️ Lưu ý quan trọng

### 1. Ngrok URL thay đổi

- **Free plan:** URL thay đổi mỗi lần restart ngrok
- **Pro plan:** Có thể giữ URL cố định
- **Giải pháp:** Dùng script tự động để update .env mỗi lần start

### 2. Ngrok session timeout

- Free plan có giới hạn thời gian
- Nếu ngrok dừng, cần restart và update .env lại

### 3. Security

- Ngrok URL là public, ai cũng có thể truy cập
- **CHỈ DÙNG CHO DEV/TEST**
- Production phải deploy lên server thật

### 4. IPN URL format

- Phải là: `https://your-ngrok-url.ngrok.io/api/webhooks/vnpay/ipn`
- Không có trailing slash
- Phải accessible từ internet

## 🔧 Troubleshooting

### Ngrok không start

```bash
# Kiểm tra port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kiểm tra ngrok
ngrok version
```

### IPN URL vẫn là localhost

```bash
# Kiểm tra .env
cat .env | grep VNP_IPN_URL

# Restart server
npm run dev
```

### VNPay vẫn báo lỗi 99

1. Kiểm tra ngrok: `npm run check:ngrok`
2. Kiểm tra cấu hình: `npm run health:vnpay`
3. Test IPN: `npm run test:vnpay-ipn`
4. Xem logs backend khi VNPay gọi IPN

Xem thêm: `scripts/vnpay-troubleshooting.md`

## 📞 Hỗ trợ

- **VNPay Support:** support.vnpayment@vnpay.vn
- **VNPay Hotline:** 1900 55 55 77
- **VNPay Docs:** https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html

## ✅ Checklist

Trước khi test thanh toán, đảm bảo:

- [ ] ngrok đã cài đặt
- [ ] Server đang chạy trên port 8000
- [ ] Đã chạy `npm run setup:vnpay-dev`
- [ ] `npm run health:vnpay` - tất cả checks pass
- [ ] Frontend đang chạy
- [ ] Đã có thẻ test từ VNPay

## 🎉 Hoàn tất!

Nếu tất cả checks pass, bạn đã sẵn sàng test thanh toán VNPay!

