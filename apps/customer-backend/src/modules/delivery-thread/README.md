# Delivery Thread Module

## Tổng quan

Module Delivery Thread cung cấp tính năng thảo luận (thread/chat) cho các đơn hàng giao hàng giữa:

- **Khách hàng tổ chức** (Organization)
- **Admin** (Quản trị viên)
- **Shipper** (Nhân viên giao hàng)

## Kiến trúc

Module tuân thủ **Layered Architecture** của Delta Swag Platform:

```
delivery-thread/
├── delivery-thread.model.js       # Model & Schema
├── delivery-thread.repository.js  # Data Access Layer
├── delivery-thread.service.js     # Business Logic Layer
├── delivery-thread.controller.js  # HTTP Handler Layer
├── delivery-thread.routes.js      # Route Definitions
└── README.md                      # Documentation
```

## Tính năng

### 1. Thread Management

- ✅ Tự động tạo thread khi có check-in mới
- ✅ Lấy thread theo check-in ID hoặc thread ID
- ✅ Danh sách threads theo organization hoặc user
- ✅ Đếm số tin nhắn chưa đọc

### 2. Message Management

- ✅ Gửi tin nhắn text
- ✅ Chỉnh sửa tin nhắn (chỉ người gửi)
- ✅ Xóa tin nhắn (người gửi hoặc admin)
- ✅ Đánh dấu đã đọc
- ✅ Hiển thị trạng thái "đã chỉnh sửa"

### 3. Thread Status

- ✅ Đánh dấu thread là "đã giải quyết"
- ✅ Chỉ customer hoặc admin có thể resolve
- ✅ Không thể gửi tin nhắn sau khi resolved

### 4. Participants

- ✅ Tự động thêm customer, shipper vào thread
- ✅ Admin có thể tham gia mọi thread
- ✅ Theo dõi thời gian tham gia và đọc cuối

## API Endpoints

### Thread Management

#### GET /api/delivery-threads/checkin/:checkinId

Lấy hoặc tạo thread cho một check-in

**Response:**

```json
{
  "success": true,
  "data": {
    "thread": {
      "_id": "...",
      "checkinId": "...",
      "orderNumber": "ORD-001",
      "participants": [...],
      "messages": [...],
      "messageCount": 5,
      "isResolved": false
    }
  }
}
```

#### GET /api/delivery-threads/:threadId

Lấy thread theo ID

#### GET /api/delivery-threads

Lấy danh sách threads của user hiện tại

**Query params:**

- `page`: Trang (default: 1)
- `limit`: Số lượng (default: 20)
- `isResolved`: Lọc theo trạng thái (true/false)

#### GET /api/delivery-threads/unread-count

Đếm số tin nhắn chưa đọc

### Message Management

#### POST /api/delivery-threads/:threadId/messages

Gửi tin nhắn mới

**Body:**

```json
{
  "content": "Nội dung tin nhắn",
  "messageType": "text"
}
```

#### PUT /api/delivery-threads/:threadId/messages/:messageId

Chỉnh sửa tin nhắn

**Body:**

```json
{
  "content": "Nội dung đã chỉnh sửa"
}
```

#### DELETE /api/delivery-threads/:threadId/messages/:messageId

Xóa tin nhắn (soft delete)

### Thread Actions

#### POST /api/delivery-threads/:threadId/read

Đánh dấu thread là đã đọc

#### POST /api/delivery-threads/:threadId/resolve

Đánh dấu thread là đã giải quyết

## Data Models

### DeliveryThread Schema

```javascript
{
  checkinId: ObjectId,           // Ref to DeliveryCheckin
  orderId: ObjectId,             // Order ID
  orderNumber: String,           // Order number for display
  organizationId: ObjectId,      // Ref to OrganizationProfile

  participants: [{
    userId: ObjectId,            // User or Organization ID
    userModel: String,           // "User" or "OrganizationProfile"
    userName: String,            // Display name
    role: String,                // "customer", "admin", "shipper"
    joinedAt: Date,
    lastReadAt: Date
  }],

  messages: [{
    senderId: ObjectId,
    senderModel: String,
    senderName: String,
    senderRole: String,
    messageType: String,         // "text", "image", "system"
    content: String,
    attachments: [...],
    isEdited: Boolean,
    editedAt: Date,
    isDeleted: Boolean,
    deletedAt: Date,
    createdAt: Date,
    updatedAt: Date
  }],

  messageCount: Number,
  lastMessageAt: Date,
  lastMessagePreview: String,

  isResolved: Boolean,
  resolvedAt: Date,
  resolvedBy: ObjectId,
  resolvedByModel: String,

  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Business Rules

### Authorization

1. **Customer**: Chỉ xem threads của organization mình
2. **Shipper**: Chỉ xem threads mà mình là participant
3. **Admin**: Xem tất cả threads

### Message Permissions

1. **Gửi tin nhắn**: Tất cả participants
2. **Chỉnh sửa**: Chỉ người gửi
3. **Xóa**: Người gửi hoặc admin

### Thread Resolution

1. **Resolve**: Chỉ customer hoặc admin
2. **Sau khi resolved**: Không thể gửi tin nhắn mới
3. **Reopen**: Chưa implement (có thể thêm sau)

## Error Handling

Module sử dụng custom exceptions:

```javascript
// Validation errors
throw new ValidationException("Nội dung tin nhắn không được để trống");

// Not found errors
throw new NotFoundException("Thread", threadId);

// Authorization errors
throw new ForbiddenException("Bạn không có quyền truy cập thread này");

// Conflict errors
throw new ConflictException("Thread đã được đánh dấu là đã giải quyết");
```

## Logging

Module sử dụng Logger utility:

```javascript
Logger.debug(
  `[DeliveryThreadSvc] Getting/creating thread for checkin: ${checkinId}`
);
Logger.success(`[DeliveryThreadSvc] Created thread: ${thread._id}`);
Logger.error(`[DeliveryThreadSvc] Failed to create thread:`, error);
```

## Testing

### Manual Testing

1. **Tạo thread mới:**

```bash
GET /api/delivery-threads/checkin/{checkinId}
```

2. **Gửi tin nhắn:**

```bash
POST /api/delivery-threads/{threadId}/messages
{
  "content": "Test message"
}
```

3. **Đánh dấu đã đọc:**

```bash
POST /api/delivery-threads/{threadId}/read
```

4. **Resolve thread:**

```bash
POST /api/delivery-threads/{threadId}/resolve
```

## Future Enhancements

### Phase 2

- [ ] Real-time updates với WebSocket/Pusher
- [ ] Upload ảnh trong tin nhắn
- [ ] Mentions (@user)
- [ ] Reactions (emoji)
- [ ] Thread templates

### Phase 3

- [ ] Email notifications
- [ ] Push notifications
- [ ] Thread analytics
- [ ] Export thread history
- [ ] Thread archiving

## Dependencies

- `mongoose`: Database ORM
- `express`: Web framework
- Custom exceptions từ `shared/exceptions`
- Logger từ `shared/utils`

## Related Modules

- `delivery-checkin`: Tạo check-in và trigger thread creation
- `organizations`: Quản lý organization participants
- `users`: Quản lý user participants

## Notes

- Thread được tự động tạo khi có check-in mới
- Mỗi check-in chỉ có 1 thread duy nhất (unique constraint)
- Messages được soft delete (isDeleted flag)
- Participants được tự động thêm khi tạo thread
