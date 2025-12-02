# VNPay Payment Troubleshooting Guide

## Lỗi 99 - Nguyên nhân và cách khắc phục

Lỗi 99 từ VNPay thường xảy ra khi:
1. **IPN URL không accessible** - NGUYÊN NHÂN PHỔ BIẾN NHẤT
2. **Chữ ký (SecureHash) không hợp lệ**
3. **IPN endpoint trả về lỗi**
4. **Thiếu hoặc sai cấu hình**

## Các bước kiểm tra

### 1. Kiểm tra cấu hình

```bash
npm run check:vnpay
```

Script này sẽ kiểm tra:
- Tất cả biến môi trường VNPay đã được set
- IPN URL không phải localhost
- Tất cả URLs có format đúng

### 2. Kiểm tra IPN URL

**QUAN TRỌNG**: IPN URL phải là URL public mà VNPay có thể gọi được.

- ❌ **SAI**: `http://localhost:8000/api/webhooks/vnpay/ipn`
- ❌ **SAI**: `http://127.0.0.1:8000/api/webhooks/vnpay/ipn`
- ✅ **ĐÚNG**: `https://yourdomain.com/api/webhooks/vnpay/ipn`

**Nếu đang dev local:**
1. Dùng ngrok để expose localhost:
   ```bash
   ngrok http 8000
   ```
2. Copy URL từ ngrok (ví dụ: `https://abc123.ngrok.io`)
3. Set `VNP_IPN_URL=https://abc123.ngrok.io/api/webhooks/vnpay/ipn`
4. **LƯU Ý**: Ngrok URL thay đổi mỗi lần restart (trừ khi dùng ngrok pro)

### 3. Test IPN endpoint

```bash
npm run test:vnpay-ipn
```

Script này sẽ:
- Tạo dữ liệu test giống VNPay
- Tạo chữ ký hợp lệ
- Hiển thị URL để test

Sau đó test bằng curl:
```bash
curl "https://yourdomain.com/api/webhooks/vnpay/ipn?[query_string_from_script]"
```

### 4. Kiểm tra logs

Khi VNPay gọi IPN, kiểm tra logs backend:
- `[VnPayWebhook] Nhận IPN request` - VNPay đã gọi được
- `[VnPayService] Chữ ký VNPay HỢP LỆ` - Chữ ký đúng
- `[OrderSvc]` - Xử lý đơn hàng

### 5. Kiểm tra chữ ký

Nếu chữ ký không hợp lệ, kiểm tra:
- `VNP_HASH_SECRET` đúng và không có khoảng trắng thừa
- Thứ tự params đã được sắp xếp theo ABC
- Không encode khi tạo chữ ký (chỉ encode khi build URL)

## Các mã lỗi VNPay phổ biến

- **99**: Lỗi không xác định / IPN không accessible
- **97**: Chữ ký không hợp lệ
- **01**: Không tìm thấy đơn hàng
- **00**: Thành công

## Checklist trước khi deploy

- [ ] `VNP_IPN_URL` là URL public (HTTPS)
- [ ] `VNP_RETURN_URL` đúng format
- [ ] `VNP_TMN_CODE` và `VNP_HASH_SECRET` đúng
- [ ] IPN endpoint trả về JSON với format: `{ RspCode: "00", Message: "..." }`
- [ ] Server có thể nhận request từ internet (không bị firewall chặn)
- [ ] Đã test với VNPay sandbox

## Debug tips

1. **Bật logging chi tiết**: Set `NODE_ENV=development` để xem SignData và SecureHash
2. **Kiểm tra network**: Dùng ngrok logs để xem VNPay có gọi được không
3. **Test từng bước**: Test tạo URL trước, sau đó test IPN riêng

## Liên hệ hỗ trợ

Nếu vẫn gặp lỗi sau khi kiểm tra tất cả:
- Kiểm tra logs backend đầy đủ
- Chụp screenshot lỗi từ VNPay
- Liên hệ VNPay support: 1900 55 55 77

