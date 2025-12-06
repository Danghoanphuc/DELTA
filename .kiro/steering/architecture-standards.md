# Architecture Standards - Delta Swag Platform

## Core Principles

**CRITICAL**: Khi làm việc với codebase này, bạn PHẢI tuân thủ các nguyên tắc sau:

1. **System Thinking First**: Luôn suy nghĩ về tác động toàn hệ thống trước khi thay đổi code
2. **Pattern Consistency**: Tuân thủ patterns đã có, không tự ý tạo patterns mới
3. **No Quick Fixes**: Không chỉ làm cho code chạy được, phải đảm bảo tính nhất quán
4. **Backward Compatibility**: Mọi thay đổi phải tương thích ngược với code hiện tại

---

## Backend Architecture (Node.js/Express)

### Layered Architecture Pattern

**MANDATORY**: Mọi module backend PHẢI tuân theo cấu trúc 4 layers:

```
modules/
  ├── {feature}.model.js       # Data models & schemas
  ├── {feature}.repository.js  # Data access layer
  ├── {feature}.service.js     # Business logic
  ├── {feature}.controller.js  # HTTP handlers
  └── {feature}.routes.js      # Route definitions
```

### 1. Model Layer (\*.model.js)

**Purpose**: Define data schemas, validation, and model methods

**Rules**:

- Use Mongoose schemas with proper validation
- Include instance methods for business logic tied to single document
- Include static methods for queries
- Define enums as constants (e.g., `SWAG_ORDER_STATUS`)
- Add JSDoc comments for complex schemas

**Example Pattern**:

```javascript
// ✅ CORRECT
export const SWAG_ORDER_STATUS = {
  DRAFT: "draft",
  PENDING_INFO: "pending_info",
  // ...
};

const swagOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: Object.values(SWAG_ORDER_STATUS),
    default: SWAG_ORDER_STATUS.DRAFT,
  },
  // ...
});

// Instance method
swagOrderSchema.methods.calculatePricing = function () {
  // Calculate pricing logic
};

// Static method
swagOrderSchema.statics.generateOrderNumber = async function () {
  // Generate unique order number
};

export const SwagOrder = mongoose.model("SwagOrder", swagOrderSchema);
```

### 2. Repository Layer (\*.repository.js)

**Purpose**: Data access abstraction - ALL database operations go here

**Rules**:

- NEVER access models directly from service layer
- Use repository pattern for all CRUD operations
- Return plain objects (use `.lean()`) for read operations
- Return Mongoose documents only when needed for updates
- Include pagination, filtering, and sorting logic
- Handle database errors at this layer

**Example Pattern**:

```javascript
// ✅ CORRECT
export class SwagOrderRepository {
  async create(data) {
    const order = new SwagOrder(data);
    return await order.save();
  }

  async findById(id) {
    return await SwagOrder.findById(id)
      .populate("swagPack")
      .populate("createdBy", "displayName email")
      .lean();
  }

  async findByOrganization(organizationId, options = {}) {
    const { status, page = 1, limit = 20, sortBy = "createdAt" } = options;

    const query = { organization: organizationId };
    if (status && status !== "all") query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      SwagOrder.find(query)
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SwagOrder.countDocuments(query),
    ]);

    return { orders, pagination: { page, limit, total } };
  }
}
```

**❌ WRONG - Don't do this**:

```javascript
// Service directly accessing model
async getOrders(orgId) {
  return await SwagOrder.find({ organization: orgId }); // ❌ NO!
}
```

### 3. Service Layer (\*.service.js)

**Purpose**: Business logic, validation, orchestration

**Rules**:

- ALL business logic goes here
- Use repository for data access
- Throw custom exceptions (ValidationException, NotFoundException, etc.)
- Use Logger for important operations
- Keep methods focused (Single Responsibility)
- Validate input data
- Orchestrate multiple repositories if needed

**Example Pattern**:

```javascript
// ✅ CORRECT
export class SwagOrderService {
  constructor() {
    this.swagOrderRepository = new SwagOrderRepository();
  }

  async createOrder(organizationId, userId, data) {
    Logger.debug(`[SwagOrderSvc] Creating order for org: ${organizationId}`);

    // Validation
    const { swagPackId, recipientIds } = data;
    if (!recipientIds || recipientIds.length === 0) {
      throw new ValidationException("Vui lòng chọn ít nhất 1 người nhận");
    }

    // Business logic
    const pack = await SwagPack.findById(swagPackId);
    if (!pack) throw new NotFoundException("Swag Pack", swagPackId);

    // Authorization check
    if (pack.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền sử dụng bộ quà này");
    }

    // Create order via repository
    const order = await this.swagOrderRepository.create({
      organization: organizationId,
      createdBy: userId,
      // ... other fields
    });

    Logger.success(`[SwagOrderSvc] Created order: ${order.orderNumber}`);
    return order;
  }

  async getOrder(organizationId, orderId) {
    const order = await this.swagOrderRepository.findById(orderId);
    if (!order) throw new NotFoundException("Swag Order", orderId);

    // Authorization check
    if (order.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền truy cập đơn hàng này");
    }

    return order;
  }
}
```

### 4. Controller Layer (\*.controller.js)

**Purpose**: HTTP request/response handling

**Rules**:

- Keep controllers thin - delegate to services
- Use try-catch with next(error) for error handling
- Extract data from req (body, params, query, user)
- Return ApiResponse.success() for successful responses
- Use appropriate HTTP status codes (API_CODES)
- Add JSDoc comments for routes

**Example Pattern**:

```javascript
// ✅ CORRECT
export class SwagOrderController {
  constructor() {
    this.swagOrderService = new SwagOrderService();
  }

  /**
   * Create a new swag order
   * @route POST /api/swag-orders
   */
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
      next(error);
    }
  };

  /**
   * Get orders list
   * @route GET /api/swag-orders
   */
  getOrders = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { status, page, limit } = req.query;

      const result = await this.swagOrderService.getOrders(organizationId, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}
```

### 5. Routes Layer (\*.routes.js)

**Purpose**: Define API endpoints and middleware

**Rules**:

- Group related routes together
- Apply authentication middleware
- Apply validation middleware where needed
- Use descriptive route names
- Follow RESTful conventions

**Example Pattern**:

```javascript
// ✅ CORRECT
import { Router } from "express";
import { SwagOrderController } from "./swag-order.controller.js";
import { authenticate } from "../../shared/middleware/index.js";

const router = Router();
const controller = new SwagOrderController();

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post("/", controller.createOrder);
router.get("/", controller.getOrders);
router.get("/stats", controller.getStats);
router.get("/:id", controller.getOrder);
router.put("/:id", controller.updateOrder);

// Specific actions
router.post("/:id/submit", controller.submitOrder);
router.post("/:id/cancel", controller.cancelOrder);
router.post("/:id/recipients", controller.addRecipients);

export default router;
```

---

## Frontend Architecture (React/TypeScript)

### Feature-Based Structure

**MANDATORY**: Frontend code PHẢI được tổ chức theo features:

```
features/
  └── {feature}/
      ├── pages/              # Page components
      ├── components/         # Feature-specific components
      ├── hooks/              # Custom hooks
      ├── services/           # API services
      └── types.ts            # TypeScript types (optional)
```

### 1. Service Layer (\*.service.ts)

**Purpose**: API communication - ALL API calls go here

**Rules**:

- Use singleton pattern (export instance)
- Use axios instance from shared lib
- Return data directly (unwrap response)
- Handle errors at hook level, not here
- Define TypeScript interfaces for request/response
- Keep methods simple - one API call per method

**Example Pattern**:

```typescript
// ✅ CORRECT
import api from "@/shared/lib/axios";

export interface SwagOrder {
  _id: string;
  orderNumber: string;
  name: string;
  status: string;
  // ... other fields
}

export interface CreateOrderData {
  name: string;
  swagPackId: string;
  recipientIds: string[];
  // ... other fields
}

class SwagOrderService {
  async getOrders(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    const res = await api.get(`/swag-orders?${params}`);
    return res.data?.data?.orders || [];
  }

  async getOrderDetail(orderId: string) {
    const res = await api.get(`/swag-orders/${orderId}`);
    return res.data?.data?.order;
  }

  async createOrder(data: CreateOrderData) {
    const res = await api.post("/swag-orders", data);
    return res.data?.data;
  }

  async cancelOrder(orderId: string, reason: string) {
    return api.post(`/swag-orders/${orderId}/cancel`, { reason });
  }
}

export const swagOrderService = new SwagOrderService();
```

### 2. Custom Hooks (use\*.ts)

**Purpose**: State management, side effects, business logic

**Rules**:

- Follow React hooks rules
- Use service layer for API calls
- Handle loading and error states
- Use toast for user feedback
- Keep hooks focused (Single Responsibility)
- Return object with clear naming

**Example Pattern**:

```typescript
// ✅ CORRECT
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { swagOrderService, SwagOrder } from "../services/swag-order.service";

export function useSwagOrders() {
  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await swagOrderService.getOrders(statusFilter);
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (orderId: string) => {
    try {
      await swagOrderService.cancelOrder(orderId, "Hủy bởi người dùng");
      toast.success("Đã hủy đơn hàng");
      fetchOrders(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  return {
    orders,
    isLoading,
    statusFilter,
    setStatusFilter,
    cancelOrder,
  };
}
```

### 3. Page Components

**Rules**:

- Use custom hooks for data and logic
- Keep JSX clean and readable
- Extract complex UI into sub-components
- Use TypeScript for props
- Handle loading and error states

### 4. Feature Components

**Rules**:

- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic to hooks
- Use shared components from `/shared/components`

---

## Error Handling

### Backend Exceptions

**MANDATORY**: Use custom exceptions, never throw generic Error

```javascript
// ✅ CORRECT
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";

// Validation errors
throw new ValidationException("Vui lòng chọn ít nhất 1 người nhận");

// Not found errors
throw new NotFoundException("Swag Order", orderId);

// Authorization errors
throw new ForbiddenException("Bạn không có quyền truy cập");
```

### Frontend Error Handling

```typescript
// ✅ CORRECT
try {
  await service.doSomething();
  toast.success("Thành công!");
} catch (error: any) {
  toast.error(error.response?.data?.message || "Có lỗi xảy ra");
  console.error("Error:", error);
}
```

---

## Naming Conventions

### Backend (JavaScript)

- **Files**: kebab-case (`swag-order.service.js`)
- **Classes**: PascalCase (`SwagOrderService`)
- **Methods**: camelCase (`createOrder`)
- **Constants**: UPPER_SNAKE_CASE (`SWAG_ORDER_STATUS`)
- **Variables**: camelCase (`organizationId`)

### Frontend (TypeScript)

- **Files**: kebab-case (`use-swag-orders.ts`)
- **Components**: PascalCase (`SwagOrdersPage`)
- **Hooks**: camelCase with 'use' prefix (`useSwagOrders`)
- **Interfaces**: PascalCase (`SwagOrder`, `CreateOrderData`)
- **Variables**: camelCase (`isLoading`)

---

## Code Quality Rules

### 1. Comments

- Add JSDoc for public methods
- Add inline comments for complex logic
- Use Vietnamese for user-facing messages
- Use English for technical comments

### 2. Logging

```javascript
// ✅ CORRECT - Use Logger utility
Logger.debug(`[SwagOrderSvc] Creating order for org: ${organizationId}`);
Logger.success(`[SwagOrderSvc] Created order: ${order.orderNumber}`);
Logger.error(`[SwagOrderSvc] Failed to create order:`, error);
```

### 3. Validation

- Validate at service layer, not controller
- Throw ValidationException for invalid input
- Check authorization after fetching data

### 4. Database Operations

- Always use repository pattern
- Use `.lean()` for read-only operations
- Use transactions for multi-document updates
- Add indexes for frequently queried fields

---

## SOLID Principles Application

### Single Responsibility

- Each layer has ONE responsibility
- Controllers: HTTP handling
- Services: Business logic
- Repositories: Data access
- Models: Data structure

### Open/Closed

- Use Facade pattern for complex subsystems (see `swag-operations.facade.ts`)
- Extend behavior through composition, not modification

### Dependency Inversion

- Services depend on repository interfaces
- Use dependency injection in constructors

---

## Before Making Changes - Checklist

**STOP and ask yourself**:

1. ✅ Does this follow the existing layered architecture?
2. ✅ Am I using the repository pattern for data access?
3. ✅ Is business logic in the service layer?
4. ✅ Are controllers thin and focused on HTTP?
5. ✅ Am I using custom exceptions properly?
6. ✅ Does this maintain backward compatibility?
7. ✅ Have I checked similar code for patterns?
8. ✅ Will this change affect other parts of the system?

**If you answer NO to any question, STOP and reconsider your approach.**

---

## Common Anti-Patterns to AVOID

❌ **Direct model access from controller**

```javascript
// ❌ WRONG
async getOrders(req, res) {
  const orders = await SwagOrder.find({ organization: req.user.orgId });
  res.json(orders);
}
```

❌ **Business logic in controller**

```javascript
// ❌ WRONG
async createOrder(req, res) {
  const pack = await SwagPack.findById(req.body.packId);
  if (!pack) return res.status(404).json({ error: 'Not found' });
  // ... more logic
}
```

❌ **Generic error throwing**

```javascript
// ❌ WRONG
throw new Error("Invalid input");
```

❌ **Mixing concerns**

```javascript
// ❌ WRONG - Repository doing business logic
async createOrder(data) {
  if (data.recipients.length === 0) {
    throw new Error('Need recipients'); // This is business logic!
  }
  return await SwagOrder.create(data);
}
```

---

## Summary

**Remember**: This codebase values SYSTEM INTEGRITY over quick fixes. Always think about:

1. **Consistency**: Does this match existing patterns?
2. **Maintainability**: Will others understand this in 6 months?
3. **Scalability**: Will this work as the system grows?
4. **Testability**: Can this be easily tested?

**When in doubt, look at existing code and follow the same pattern.**
