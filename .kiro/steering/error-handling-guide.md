# Error Handling Guide

**Purpose**: Đảm bảo errors được handle nhất quán và user-friendly trong toàn bộ hệ thống.

---

## Backend Error Handling

### Custom Exception Classes

**MANDATORY**: Luôn sử dụng custom exceptions, KHÔNG BAO GIỜ throw generic Error.

```javascript
import {
  ValidationException, // 400 - Invalid input
  UnauthorizedException, // 401 - Not authenticated
  ForbiddenException, // 403 - Not authorized
  NotFoundException, // 404 - Resource not found
  ConflictException, // 409 - Conflict (duplicate, etc.)
  InternalServerException, // 500 - Server error
} from "../../shared/exceptions/index.js";
```

### When to Use Each Exception

#### ValidationException (400)

**Use when**: User input is invalid

```javascript
// ✅ CORRECT
if (!recipientIds || recipientIds.length === 0) {
  throw new ValidationException("Vui lòng chọn ít nhất 1 người nhận");
}

if (!email || !email.includes("@")) {
  throw new ValidationException("Email không hợp lệ");
}

if (quantity < 1) {
  throw new ValidationException("Số lượng phải lớn hơn 0");
}
```

#### NotFoundException (404)

**Use when**: Resource doesn't exist

```javascript
// ✅ CORRECT
const order = await this.repository.findById(orderId);
if (!order) {
  throw new NotFoundException("Swag Order", orderId);
}

const user = await User.findById(userId);
if (!user) {
  throw new NotFoundException("User", userId);
}
```

#### ForbiddenException (403)

**Use when**: User doesn't have permission

```javascript
// ✅ CORRECT
if (order.organization.toString() !== organizationId.toString()) {
  throw new ForbiddenException("Bạn không có quyền truy cập đơn hàng này");
}

if (user.role !== "admin") {
  throw new ForbiddenException("Chỉ admin mới có quyền thực hiện thao tác này");
}
```

#### ConflictException (409)

**Use when**: Resource already exists or state conflict

```javascript
// ✅ CORRECT
const existing = await User.findOne({ email });
if (existing) {
  throw new ConflictException("Email đã được sử dụng");
}

if (order.status === "shipped") {
  throw new ConflictException("Không thể hủy đơn hàng đã gửi");
}
```

### Service Layer Error Handling

**Pattern**: Validate → Check existence → Check authorization → Execute

```javascript
// ✅ CORRECT
export class SwagOrderService {
  async updateOrder(organizationId, orderId, data) {
    // 1. Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationException("Tên đơn hàng không được để trống");
    }

    // 2. Check existence
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    // 3. Check authorization
    if (order.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa đơn hàng này");
    }

    // 4. Check business rules
    if (!["draft", "pending_info"].includes(order.status)) {
      throw new ConflictException("Không thể chỉnh sửa đơn hàng đã xử lý");
    }

    // 5. Execute
    order.name = data.name;
    await order.save();

    Logger.success(`[SwagOrderSvc] Updated order: ${order.orderNumber}`);
    return order;
  }
}
```

### Controller Layer Error Handling

**Pattern**: Try-catch with next(error)

```javascript
// ✅ CORRECT
export class SwagOrderController {
  createOrder = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;

      const order = await this.swagOrderService.createOrder(
        organizationId,
        userId,
        req.body
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ order }, "Đã tạo đơn gửi quà!"));
    } catch (error) {
      next(error); // Let error middleware handle it
    }
  };
}
```

**❌ WRONG - Don't handle errors in controller**:

```javascript
// ❌ WRONG
createOrder = async (req, res) => {
  try {
    const order = await this.service.createOrder(req.body);
    res.json({ success: true, order });
  } catch (error) {
    // ❌ Don't do this!
    res.status(500).json({ error: error.message });
  }
};
```

### Repository Layer Error Handling

**Pattern**: Let database errors bubble up, add context if needed

```javascript
// ✅ CORRECT
export class SwagOrderRepository {
  async create(data) {
    try {
      const order = new SwagOrder(data);
      return await order.save();
    } catch (error) {
      // Add context for specific errors
      if (error.code === 11000) {
        throw new ConflictException("Order number already exists");
      }
      // Let other errors bubble up
      throw error;
    }
  }

  async findById(id) {
    // No try-catch needed for simple queries
    return await SwagOrder.findById(id).lean();
  }
}
```

---

## Frontend Error Handling

### Service Layer

**Pattern**: Don't handle errors, let hooks handle them

```typescript
// ✅ CORRECT
class SwagOrderService {
  async getOrders(status?: string) {
    // No try-catch - let hook handle errors
    const res = await api.get(`/swag-orders?status=${status}`);
    return res.data?.data?.orders || [];
  }

  async createOrder(data: CreateOrderData) {
    // No try-catch - let hook handle errors
    const res = await api.post("/swag-orders", data);
    return res.data?.data;
  }
}
```

### Hooks Layer

**Pattern**: Try-catch with toast notifications

```typescript
// ✅ CORRECT
export function useSwagOrders() {
  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await swagOrderService.getOrders();
      setOrders(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể tải danh sách đơn hàng";
      setError(message);
      toast.error(message);
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderData) => {
    try {
      const order = await swagOrderService.createOrder(data);
      toast.success("Đã tạo đơn hàng thành công!");
      return order;
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể tạo đơn hàng";
      toast.error(message);
      throw err; // Re-throw so component can handle if needed
    }
  };

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
  };
}
```

### Component Layer

**Pattern**: Display loading/error states

```typescript
// ✅ CORRECT
export function SwagOrdersPage() {
  const { orders, isLoading, error, fetchOrders } = useSwagOrders();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchOrders} />;
  }

  return (
    <div>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
}
```

---

## Error Messages

### User-Facing Messages (Vietnamese)

**Rules**:

- Clear and actionable
- Polite and professional
- Suggest next steps when possible

```javascript
// ✅ GOOD
"Vui lòng chọn ít nhất 1 người nhận";
"Email đã được sử dụng. Vui lòng sử dụng email khác";
"Không thể hủy đơn hàng đã gửi";
"Bạn không có quyền truy cập đơn hàng này";

// ❌ BAD
"Invalid input";
"Error";
"Failed";
"Unauthorized";
```

### Technical Messages (English)

**Rules**:

- For logging and debugging
- Include context and IDs
- Use consistent format

```javascript
// ✅ GOOD
Logger.error(`[SwagOrderSvc] Failed to create order for org ${orgId}:`, error);
Logger.debug(`[SwagOrderSvc] Processing order ${orderNumber}`);
Logger.warn(`[SwagOrderSvc] Order ${orderId} has pending recipients`);

// ❌ BAD
console.log("error");
console.log(error);
```

---

## Logging Best Practices

### When to Log

**Debug Level**: Development info

```javascript
Logger.debug(`[SwagOrderSvc] Creating order for org: ${organizationId}`);
Logger.debug(`[SwagOrderSvc] Found ${recipients.length} recipients`);
```

**Success Level**: Important operations completed

```javascript
Logger.success(`[SwagOrderSvc] Created order: ${order.orderNumber}`);
Logger.success(`[SwagOrderSvc] Order ${orderId} shipped successfully`);
```

**Warn Level**: Potential issues

```javascript
Logger.warn(
  `[SwagOrderSvc] Order ${orderId} has ${pendingCount} pending recipients`
);
Logger.warn(`[SwagOrderSvc] Low inventory for product ${productId}`);
```

**Error Level**: Actual errors

```javascript
Logger.error(`[SwagOrderSvc] Failed to create order:`, error);
Logger.error(`[SwagOrderSvc] Payment failed for order ${orderId}:`, error);
```

### Log Format

**Pattern**: `[ServiceName] Action: details`

```javascript
// ✅ CORRECT
Logger.debug(`[SwagOrderSvc] Creating order for org: ${organizationId}`);
Logger.success(`[SwagOrderSvc] Created order: ${order.orderNumber}`);
Logger.error(`[SwagOrderSvc] Failed to update order ${orderId}:`, error);

// ❌ WRONG
Logger.debug("creating order");
Logger.success("done");
Logger.error(error);
```

---

## Error Response Format

### Backend API Response

**Success Response**:

```javascript
{
  success: true,
  data: { order: {...} },
  message: 'Đã tạo đơn gửi quà!'
}
```

**Error Response**:

```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Vui lòng chọn ít nhất 1 người nhận',
    details: { field: 'recipientIds' }
  }
}
```

### Error Middleware

**Pattern**: Centralized error handling

```javascript
// ✅ CORRECT - Error middleware
export const errorHandler = (err, req, res, next) => {
  // Log error
  Logger.error(`[API] ${req.method} ${req.path}:`, err);

  // Handle custom exceptions
  if (err instanceof ValidationException) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
      },
    });
  }

  if (err instanceof NotFoundException) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: err.message,
      },
    });
  }

  // ... handle other exceptions

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Đã có lỗi xảy ra. Vui lòng thử lại sau",
    },
  });
};
```

---

## Common Patterns

### Async Error Handling

```javascript
// ✅ CORRECT
async function processOrder(orderId) {
  try {
    const order = await getOrder(orderId);
    await validateOrder(order);
    await processPayment(order);
    await sendNotification(order);
    return order;
  } catch (error) {
    Logger.error(`[OrderProcessor] Failed to process order ${orderId}:`, error);
    throw error; // Re-throw to let caller handle
  }
}
```

### Multiple Operations

```javascript
// ✅ CORRECT
async function createOrderWithRecipients(data) {
  // Validate all first
  if (!data.packId) throw new ValidationException("Pack ID required");
  if (!data.recipientIds?.length)
    throw new ValidationException("Recipients required");

  // Check existence
  const pack = await getPack(data.packId);
  if (!pack) throw new NotFoundException("Pack", data.packId);

  const recipients = await getRecipients(data.recipientIds);
  if (recipients.length !== data.recipientIds.length) {
    throw new ValidationException("Some recipients not found");
  }

  // Execute
  const order = await createOrder({ ...data, pack, recipients });
  return order;
}
```

### Graceful Degradation

```javascript
// ✅ CORRECT - Non-critical operations
async function createOrderWithNotification(data) {
  const order = await createOrder(data);

  // Try to send notification, but don't fail if it doesn't work
  try {
    await sendNotification(order);
  } catch (error) {
    Logger.warn(
      `[SwagOrderSvc] Failed to send notification for order ${order._id}:`,
      error
    );
    // Continue - notification failure shouldn't fail order creation
  }

  return order;
}
```

---

## Summary

**Key Principles**:

1. ✅ **Use custom exceptions** - Never throw generic Error
2. ✅ **Validate early** - Check input before processing
3. ✅ **Check authorization** - After fetching data
4. ✅ **Log appropriately** - Debug, Success, Warn, Error
5. ✅ **User-friendly messages** - Clear and actionable
6. ✅ **Consistent format** - Follow patterns
7. ✅ **Let errors bubble** - Don't swallow errors
8. ✅ **Handle at right layer** - Service throws, Controller catches

**Remember**: Good error handling makes debugging easier and users happier!
