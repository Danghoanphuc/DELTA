# Hướng dẫn cài đặt Zalo OA (Official Account)

## 📋 Tổng quan

Printz sử dụng Zalo OA để gửi thông báo đến khách hàng và người nhận quà. Các loại thông báo:

1. **Đơn hàng mới** - Thông báo khi có đơn gửi quà mới
2. **Đã gửi hàng** - Thông báo khi quà được gửi đi
3. **Đã giao hàng** - Thông báo khi quà đã giao thành công
4. **Self-service** - Link để người nhận điền thông tin
5. **Mời team** - Thông báo mời tham gia tổ chức
6. **Tồn kho thấp** - Cảnh báo sản phẩm sắp hết

## 🚀 Các bước cài đặt

### Bước 1: Tạo Zalo OA

1. Truy cập [Zalo OA](https://oa.zalo.me/)
2. Đăng nhập bằng tài khoản Zalo
3. Tạo Official Account mới
4. Xác minh doanh nghiệp (cần GPKD)

### Bước 2: Đăng ký Zalo API

1. Truy cập [Zalo Developers](https://developers.zalo.me/)
2. Tạo ứng dụng mới
3. Liên kết với Zalo OA đã tạo
4. Lấy các thông tin:
   - **OA ID**: ID của Official Account
   - **Access Token**: Token để gọi API

### Bước 3: Tạo ZNS Templates

ZNS (Zalo Notification Service) yêu cầu tạo template trước khi gửi.

1. Truy cập [ZNS Console](https://zns.zalo.me/)
2. Tạo các template sau:

#### Template: Đơn hàng mới

```
Xin chào {recipient_name},

Bạn có quà tặng từ {organization_name}!

📦 Bộ quà: {pack_name}
📅 Ngày đặt: {order_date}
💰 Giá trị: {total_amount}

Vui lòng kiểm tra email để biết thêm chi tiết.
```

#### Template: Đã gửi hàng

```
Quà của bạn đang trên đường đến!

📦 Mã đơn: {order_number}
🚚 Đơn vị vận chuyển: {carrier}
📍 Mã vận đơn: {tracking_number}
⏰ Dự kiến giao: {estimated_delivery}

Theo dõi đơn hàng tại: {tracking_url}
```

#### Template: Self-service

```
Xin chào {recipient_name},

Bạn có quà tặng từ {organization_name}!

🎁 Bộ quà: {pack_name}

Vui lòng điền thông tin nhận quà tại:
{self_service_url}

⏰ Link có hiệu lực đến: {expiry_date}
```

### Bước 4: Cấu hình Environment

Thêm vào file `.env`:

```env
# Zalo OA Configuration
ZALO_OA_ACCESS_TOKEN=your-access-token
ZALO_OA_ID=your-oa-id

# Template IDs (lấy từ ZNS Console)
ZALO_TEMPLATE_ORDER=123456
ZALO_TEMPLATE_SHIPPED=123457
ZALO_TEMPLATE_DELIVERED=123458
ZALO_TEMPLATE_SELF_SERVICE=123459
ZALO_TEMPLATE_TEAM_INVITE=123460
ZALO_TEMPLATE_LOW_STOCK=123461
```

## 📝 Lưu ý quan trọng

### Giới hạn API

- **Free tier**: 500 tin nhắn/tháng
- **Paid tier**: Theo gói đăng ký

### Yêu cầu người dùng

- Người nhận phải **follow** Zalo OA trước khi nhận tin nhắn
- Hoặc sử dụng ZNS (có phí) để gửi đến số điện thoại

### Format số điện thoại

- Zalo yêu cầu format: `84xxxxxxxxx` (không có dấu +)
- Service tự động convert từ `0xxx` sang `84xxx`

## 🔧 Test API

```bash
# Test gửi tin nhắn
curl -X POST "https://openapi.zalo.me/v3.0/oa/message/cs" \
  -H "Content-Type: application/json" \
  -H "access_token: YOUR_ACCESS_TOKEN" \
  -d '{
    "recipient": {"user_id": "USER_ZALO_ID"},
    "message": {"text": "Test message from Printz"}
  }'
```

## 📚 Tài liệu tham khảo

- [Zalo OA API Docs](https://developers.zalo.me/docs/api/official-account-api)
- [ZNS API Docs](https://developers.zalo.me/docs/api/zalo-notification-service-api)
- [Zalo OA Console](https://oa.zalo.me/)

---

**Ngày cập nhật:** December 5, 2025
**Version:** 1.0.0
