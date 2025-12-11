# Contact Request Module

Module xử lý yêu cầu báo giá từ form liên hệ trên website.

## Tính năng

### 1. Thu thập thông tin khách hàng

- Họ tên, số điện thoại, email (optional)
- Nội dung yêu cầu
- Metadata: User agent, referrer, source

### 2. Tự động lấy vị trí (Silent Location Tracking)

- **Browser Geolocation API**: Lấy tọa độ GPS từ browser (nếu user cho phép)
- **IP Geolocation**: Fallback sử dụng ipapi.co để lấy vị trí từ IP
- **Goong.io Reverse Geocoding**: Chuyển tọa độ thành địa chỉ chi tiết (thành phố, quận, phường)

### 3. Gửi email thông báo

- Email tự động gửi đến admin (b2b@printz.vn)
- Bao gồm đầy đủ thông tin khách hàng và vị trí
- Template email đẹp, responsive

### 4. Quản lý trạng thái

- `new`: Yêu cầu mới
- `contacted`: Đã liên hệ
- `quoted`: Đã báo giá
- `converted`: Đã chuyển đổi thành đơn hàng
- `closed`: Đã đóng

## API Endpoints

### Public Endpoints

#### POST /api/contact-requests

Tạo yêu cầu liên hệ mới (public, không cần auth)

**Request Body:**

```json
{
  "name": "Nguyễn Văn A",
  "phone": "0865726848",
  "email": "example@email.com",
  "message": "Tôi muốn in 100 bộ giftset Tết",
  "latitude": 10.762622,
  "longitude": 106.660172
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "...",
      "name": "Nguyễn Văn A",
      "phone": "0865726848",
      "status": "new",
      "location": {
        "latitude": 10.762622,
        "longitude": 106.660172,
        "address": "Quận 1, TP Hồ Chí Minh",
        "city": "Hồ Chí Minh"
      }
    }
  },
  "message": "Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
}
```

### Admin Endpoints (Require Authentication)

#### GET /api/contact-requests

Lấy danh sách yêu cầu (admin only)

**Query Parameters:**

- `status`: Filter theo trạng thái (new, contacted, quoted, converted, closed, all)
- `page`: Số trang (default: 1)
- `limit`: Số items per page (default: 20)

#### GET /api/contact-requests/:id

Lấy chi tiết yêu cầu (admin only)

#### PUT /api/contact-requests/:id/status

Cập nhật trạng thái (admin only)

**Request Body:**

```json
{
  "status": "contacted",
  "notes": "Đã gọi điện, khách hàng quan tâm"
}
```

## Architecture

### Layered Architecture (SOLID Principles)

```
contact-request.routes.js       → HTTP routing
contact-request.controller.js   → HTTP handling
contact-request.service.js      → Business logic
contact-request.repository.js   → Data access
contact-request.model.js        → Data schema
```

### Service Layer Logic

1. **Validation**: Kiểm tra input data
2. **Location Enrichment**:
   - Nếu có coordinates → Reverse geocode với Goong.io
   - Nếu không có coordinates → IP geolocation
3. **Create Record**: Lưu vào database
4. **Send Email**: Gửi notification (non-blocking)

### Email Service

Email được gửi qua Resend API với template HTML đẹp:

- Thông tin khách hàng
- Nội dung yêu cầu
- Thông tin vị trí (nếu có)
- CTA buttons (Gọi ngay, Gửi email)

## Frontend Integration

### Hook: useContactForm

```typescript
const { isSubmitting, submitForm } = useContactForm();

const handleSubmit = async () => {
  const success = await submitForm({
    name: "...",
    phone: "...",
    email: "...",
    message: "...",
  });

  if (success) {
    // Reset form
  }
};
```

### Silent Location Tracking

Hook tự động lấy vị trí từ browser (nếu có):

- Không hiển thị popup xin phép
- Timeout 3 seconds
- Cache 5 minutes
- Fallback gracefully nếu không có permission

## Environment Variables

```env
# Email
RESEND_API_KEY=re_xxx

# Goong.io (Maps & Geocoding)
GOONG_API_KEY=xxx
```

## Database Schema

```javascript
{
  name: String,           // Required
  phone: String,          // Required
  email: String,          // Optional
  message: String,        // Required
  status: String,         // Enum: new, contacted, quoted, converted, closed
  location: {
    ip: String,
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    district: String,
    ward: String,
    country: String
  },
  userAgent: String,
  referrer: String,
  source: String,         // Default: "contact_form"
  notes: String,          // Admin notes
  contactedAt: Date,
  quotedAt: Date,
  convertedAt: Date,
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Manual Testing

1. Mở form liên hệ: http://localhost:5173/contact
2. Điền thông tin và submit
3. Kiểm tra:
   - Toast notification hiển thị
   - Email gửi đến b2b@printz.vn
   - Record được tạo trong database
   - Location data được lưu (nếu có)

### API Testing

```bash
# Create contact request
curl -X POST http://localhost:5001/api/contact-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "0123456789",
    "message": "Test message"
  }'

# Get all requests (admin)
curl http://localhost:5001/api/contact-requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Considerations

1. **Rate Limiting**: Nên thêm rate limiting cho public endpoint
2. **Spam Protection**: Có thể thêm CAPTCHA nếu cần
3. **Data Validation**: Đã validate input ở service layer
4. **Authorization**: Admin endpoints require authentication

## Future Enhancements

1. **CRM Integration**: Tích hợp với CRM system
2. **Auto-response**: Gửi email tự động cho khách hàng
3. **SMS Notification**: Gửi SMS cho admin khi có request mới
4. **Analytics**: Track conversion rate, response time
5. **Webhook**: Gửi notification đến Slack/Discord

## Notes

- Location tracking hoàn toàn âm thầm, không làm phiền user
- Email notification là non-blocking, không làm chậm response
- Fallback gracefully nếu Goong.io API fail
- Compatible với SOLID principles và architecture standards
