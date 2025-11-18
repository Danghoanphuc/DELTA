# VNPay Payment Scripts

Các script hỗ trợ kiểm tra và debug VNPay payment integration.

## Scripts có sẵn

### 1. `check-vnpay-config.js`
Kiểm tra cấu hình VNPay (biến môi trường, URLs, etc.)

```bash
npm run check:vnpay
```

**Kiểm tra:**
- Tất cả biến môi trường VNPay đã được set
- IPN URL không phải localhost
- Tất cả URLs có format đúng

### 2. `test-vnpay-ipn.js`
Tạo dữ liệu test cho IPN endpoint

```bash
npm run test:vnpay-ipn
```

**Output:**
- Dữ liệu test giống như VNPay gửi
- Query string với chữ ký hợp lệ
- Hướng dẫn test bằng curl

### 3. `vnpay-health-check.js`
Kiểm tra toàn bộ hệ thống VNPay

```bash
npm run health:vnpay
```

**Kiểm tra:**
- Cấu hình môi trường
- VnPayService hoạt động
- IPN URL và Return URL
- Tạo payment URL thành công

## Sử dụng

### Kiểm tra nhanh

```bash
# Kiểm tra tất cả
npm run health:vnpay

# Chỉ kiểm tra cấu hình
npm run check:vnpay

# Test IPN
npm run test:vnpay-ipn
```

### Debug lỗi 99

1. Chạy health check:
   ```bash
   npm run health:vnpay
   ```

2. Kiểm tra IPN URL:
   - Đảm bảo không phải localhost
   - Đảm bảo là HTTPS (hoặc HTTP nếu dev)
   - Đảm bảo VNPay có thể gọi được

3. Test IPN endpoint:
   ```bash
   npm run test:vnpay-ipn
   # Copy query string và test bằng curl
   ```

4. Xem logs backend khi VNPay gọi IPN

## Troubleshooting

Xem file `vnpay-troubleshooting.md` để biết chi tiết về:
- Nguyên nhân lỗi 99
- Cách khắc phục từng lỗi
- Checklist trước khi deploy
- Debug tips

## Lưu ý

- Tất cả scripts cần chạy từ thư mục `apps/customer-backend`
- Scripts sẽ load `.env` tự động (nếu không phải production)
- IPN URL phải là URL public (không thể là localhost)

