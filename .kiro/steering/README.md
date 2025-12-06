# Kiro Steering Rules - Delta Swag Platform

## Giới thiệu

Đây là bộ quy tắc coding standards cho Delta Swag Platform. Tất cả AI agents làm việc với codebase này PHẢI tuân thủ các quy tắc này.

## Mục đích

1. **Đảm bảo tính nhất quán**: Mọi thay đổi code đều follow cùng một pattern
2. **Ngăn chặn quick fixes**: Không chỉ làm cho code chạy, mà phải đảm bảo chất lượng
3. **Bảo vệ architecture**: Giữ vững layered architecture và SOLID principles
4. **Tăng maintainability**: Code dễ đọc, dễ hiểu, dễ maintain

## Các file Steering

### 1. architecture-standards.md

**Nội dung**: Quy tắc architecture tổng thể

- Layered architecture (Model/Repository/Service/Controller)
- Backend patterns (Node.js/Express)
- Frontend patterns (React/TypeScript)
- SOLID principles application
- Naming conventions
- Anti-patterns cần tránh

**Khi nào dùng**: Mọi lúc khi viết code mới hoặc refactor

### 2. code-review-checklist.md

**Nội dung**: Checklist review code trước khi commit

- Pre-implementation review
- During implementation checks
- Post-implementation review
- Red flags cần dừng ngay

**Khi nào dùng**: Trước và sau khi implement mỗi feature/fix

### 3. error-handling-guide.md

**Nội dung**: Quy tắc xử lý errors

- Custom exceptions (ValidationException, NotFoundException, etc.)
- Error handling patterns cho từng layer
- Logging best practices
- User-facing vs technical messages

**Khi nào dùng**: Khi implement error handling hoặc fix bugs

### 4. solid-principles.md

**Nội dung**: Hướng dẫn chi tiết về SOLID principles

- Single Responsibility Principle (SRP)
- Open/Closed Principle (OCP)
- Liskov Substitution Principle (LSP)
- Interface Segregation Principle (ISP)
- Dependency Inversion Principle (DIP)
- Ví dụ cụ thể từ codebase
- Checklist áp dụng SOLID

**Khi nào dùng**: Khi thiết kế classes/modules mới hoặc refactor code

## Workflow cho AI Agent

### Bước 1: Hiểu yêu cầu

```
1. Đọc kỹ request của user
2. Xác định phạm vi ảnh hưởng
3. Hỏi làm rõ nếu cần
```

### Bước 2: Review architecture

```
1. Đọc architecture-standards.md
2. Tìm code tương tự trong codebase
3. Xác định pattern cần follow
```

### Bước 3: Implement

```
1. Follow layered architecture
2. Tuân thủ naming conventions
3. Sử dụng custom exceptions
4. Add logging appropriately
```

### Bước 4: Self-review

```
1. Chạy qua code-review-checklist.md
2. Kiểm tra error handling (error-handling-guide.md)
3. Đảm bảo không có red flags
4. Test code
```

### Bước 5: Present to user

```
1. Giải thích changes
2. Highlight potential impacts
3. Suggest testing steps
```

## Nguyên tắc vàng

### 1. System Thinking First

**Luôn suy nghĩ về tác động toàn hệ thống trước khi thay đổi code**

❌ Sai:

```javascript
// Quick fix - chỉ làm cho code chạy
async getOrders(req, res) {
  const orders = await SwagOrder.find();
  res.json(orders);
}
```

✅ Đúng:

```javascript
// System thinking - follow architecture
async getOrders(req, res, next) {
  try {
    const organizationId = req.user.organizationProfileId;
    const result = await this.swagOrderService.getOrders(organizationId, req.query);
    res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}
```

### 2. Pattern Consistency

**Tuân thủ patterns đã có, không tự ý tạo patterns mới**

❌ Sai:

```javascript
// Tạo pattern mới không cần thiết
class OrderManager {
  async handleOrder(data) {
    // Mix của controller + service + repository
  }
}
```

✅ Đúng:

```javascript
// Follow existing pattern
class SwagOrderService {
  constructor() {
    this.repository = new SwagOrderRepository();
  }

  async createOrder(orgId, userId, data) {
    // Business logic only
  }
}
```

### 3. No Quick Fixes

**Không chỉ làm cho code chạy được, phải đảm bảo tính nhất quán**

❌ Sai:

```javascript
// Quick fix - throw generic error
if (!data.name) {
  throw new Error("Name required");
}
```

✅ Đúng:

```javascript
// Proper fix - use custom exception
if (!data.name || data.name.trim().length === 0) {
  throw new ValidationException("Tên đơn hàng không được để trống");
}
```

### 4. Backward Compatibility

**Mọi thay đổi phải tương thích ngược với code hiện tại**

❌ Sai:

```javascript
// Breaking change - thay đổi API response format
return { orders: data }; // Trước đây là { data: { orders } }
```

✅ Đúng:

```javascript
// Backward compatible - giữ nguyên format
return { data: { orders: data } };
```

## Khi nào cần hỏi user

### Hỏi khi:

1. ✅ Yêu cầu không rõ ràng
2. ✅ Có nhiều cách implement, không biết chọn cách nào
3. ✅ Thay đổi có breaking changes
4. ✅ Cần quyết định về business logic
5. ✅ Phát hiện potential issues trong existing code

### KHÔNG hỏi khi:

1. ❌ Đã có pattern rõ ràng trong codebase
2. ❌ Quy tắc đã được define trong steering rules
3. ❌ Là technical decision đơn giản

## Red Flags - Dừng ngay nếu thấy

🚨 **Architecture Violations**

- Truy cập model trực tiếp từ controller
- Business logic trong controller
- Database operations không qua repository

🚨 **Pattern Inconsistencies**

- Tạo pattern mới khi đã có pattern tương tự
- Naming không theo convention
- File structure không theo standard

🚨 **Quality Issues**

- Không có error handling
- Không có validation
- Không có logging
- Magic numbers/strings

🚨 **Security Risks**

- Không có authorization checks
- Không validate user input
- Expose sensitive data

## Ví dụ thực tế

### Scenario 1: Thêm API endpoint mới

**Request**: "Thêm API để lấy danh sách orders theo status"

**Sai lầm thường gặp**:

```javascript
// ❌ Quick fix - không follow architecture
router.get("/orders", async (req, res) => {
  const orders = await SwagOrder.find({ status: req.query.status });
  res.json(orders);
});
```

**Cách đúng**:

```javascript
// ✅ Follow architecture

// 1. Repository
async findByStatus(organizationId, status, options) {
  const query = { organization: organizationId };
  if (status !== 'all') query.status = status;
  return await SwagOrder.find(query).lean();
}

// 2. Service
async getOrdersByStatus(organizationId, status, options) {
  return await this.repository.findByStatus(organizationId, status, options);
}

// 3. Controller
getOrders = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const { status } = req.query;
    const orders = await this.service.getOrdersByStatus(organizationId, status);
    res.status(API_CODES.SUCCESS).json(ApiResponse.success({ orders }));
  } catch (error) {
    next(error);
  }
};

// 4. Route
router.get('/', authenticate, controller.getOrders);
```

### Scenario 2: Fix bug

**Request**: "Fix lỗi khi user cancel order"

**Sai lầm thường gặp**:

```javascript
// ❌ Quick fix - không check business rules
async cancelOrder(orderId) {
  await SwagOrder.findByIdAndUpdate(orderId, { status: 'cancelled' });
}
```

**Cách đúng**:

```javascript
// ✅ Proper fix - validate business rules
async cancelOrder(organizationId, orderId, reason) {
  // 1. Get order
  const order = await this.getOrder(organizationId, orderId);

  // 2. Check business rules
  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
    throw new ConflictException('Không thể hủy đơn hàng này');
  }

  // 3. Update
  order.status = SWAG_ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  await order.save();

  // 4. Log
  Logger.success(`[SwagOrderSvc] Order cancelled: ${order.orderNumber}`);

  return order;
}
```

## Tóm tắt

**Nhớ 4 điều này**:

1. 🎯 **System Thinking**: Suy nghĩ về toàn hệ thống
2. 📐 **Pattern Consistency**: Follow patterns đã có
3. 🚫 **No Quick Fixes**: Làm đúng, không làm nhanh
4. 🔄 **Backward Compatible**: Tương thích ngược

**Khi nghi ngờ**: Tìm code tương tự và follow pattern đó!

---

## Liên hệ

Nếu có câu hỏi về steering rules, hãy hỏi user để làm rõ.
