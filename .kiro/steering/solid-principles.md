# SOLID Principles - Delta Swag Platform

**Purpose**: Hướng dẫn chi tiết về cách áp dụng SOLID principles trong codebase.

---

## Tổng quan SOLID

SOLID là 5 nguyên tắc thiết kế phần mềm giúp code dễ maintain, mở rộng và test:

1. **S**ingle Responsibility Principle (SRP)
2. **O**pen/Closed Principle (OCP)
3. **L**iskov Substitution Principle (LSP)
4. **I**nterface Segregation Principle (ISP)
5. **D**ependency Inversion Principle (DIP)

---

## 1. Single Responsibility Principle (SRP)

**Định nghĩa**: Một class chỉ nên có MỘT lý do để thay đổi.

**Trong codebase**: Mỗi layer có MỘT trách nhiệm duy nhất.

### ✅ Ví dụ đúng từ codebase

```javascript
// ✅ Controller - CHỈ handle HTTP
export class SwagOrderController {
  constructor() {
    this.swagOrderService = new SwagOrderService();
  }

  createOrder = async (req, res, next) => {
    try {
      // Extract data from request
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;

      // Delegate to service
      const order = await this.swagOrderService.createOrder(
        organizationId,
        userId,
        req.body
      );

      // Format response
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ order }, "Đã tạo đơn gửi quà!"));
    } catch (error) {
      next(error);
    }
  };
}

// ✅ Service - CHỈ business logic
export class SwagOrderService {
  constructor() {
    this.swagOrderRepository = new SwagOrderRepository();
  }

  async createOrder(organizationId, userId, data) {
    // Validation
    if (!data.recipientIds || data.recipientIds.length === 0) {
      throw new ValidationException("Vui lòng chọn ít nhất 1 người nhận");
    }

    // Business logic
    const pack = await SwagPack.findById(data.swagPackId);
    if (!pack) throw new NotFoundException("Swag Pack", data.swagPackId);

    // Authorization
    if (pack.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền sử dụng bộ quà này");
    }

    // Create via repository
    const order = await this.swagOrderRepository.create({
      organization: organizationId,
      createdBy: userId,
      // ...
    });

    return order;
  }
}

// ✅ Repository - CHỈ data access
export class SwagOrderRepository {
  async create(data) {
    const order = new SwagOrder(data);
    return await order.save();
  }

  async findById(id) {
    return await SwagOrder.findById(id).populate("swagPack").lean();
  }
}
```

### ❌ Vi phạm SRP

```javascript
// ❌ WRONG - Controller làm quá nhiều việc
export class SwagOrderController {
  createOrder = async (req, res) => {
    try {
      // ❌ Validation trong controller
      if (!req.body.recipientIds || req.body.recipientIds.length === 0) {
        return res.status(400).json({ error: "Need recipients" });
      }

      // ❌ Business logic trong controller
      const pack = await SwagPack.findById(req.body.swagPackId);
      if (!pack) {
        return res.status(404).json({ error: "Pack not found" });
      }

      // ❌ Direct database access
      const order = new SwagOrder({
        organization: req.user.organizationProfileId,
        // ...
      });
      await order.save();

      res.json({ order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
```

### Frontend SRP

```typescript
// ✅ Service - CHỈ API calls
class SwagOrderService {
  async getOrders(status?: string) {
    const res = await api.get(`/swag-orders?status=${status}`);
    return res.data?.data?.orders || [];
  }
}

// ✅ Hook - CHỈ state management
export function useSwagOrders() {
  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await swagOrderService.getOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách");
    } finally {
      setIsLoading(false);
    }
  };

  return { orders, isLoading, fetchOrders };
}

// ✅ Component - CHỈ UI rendering
export function SwagOrdersPage() {
  const { orders, isLoading, fetchOrders } = useSwagOrders();

  if (isLoading) return <LoadingSpinner />;

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

## 2. Open/Closed Principle (OCP)

**Định nghĩa**: Classes nên mở cho mở rộng, nhưng đóng cho sửa đổi.

**Trong codebase**: Sử dụng Facade Pattern và Adapter Pattern.

### ✅ Ví dụ: Facade Pattern

```typescript
// ✅ Facade - Mở rộng bằng cách thêm services mới
export class SwagOperationsFacade {
  private readonly dashboardService: DashboardService;
  private readonly orderService: OrderService;
  private readonly shipmentService: ShipmentService;
  private readonly inventoryService: InventoryService;
  private readonly fulfillmentService: FulfillmentService;

  constructor(
    orderRepo: SwagOrderRepository,
    invRepo: InventoryRepository,
    orgRepo: OrganizationRepository
  ) {
    // Inject dependencies
    this.dashboardService = new DashboardService(orderRepo, orgRepo);
    this.orderService = new OrderService(orderRepo);
    this.shipmentService = new ShipmentService(orderRepo);
    this.inventoryService = new InventoryService(invRepo);
    this.fulfillmentService = new FulfillmentService(orderRepo);
  }

  // Delegate to specialized services
  async getDashboardStats() {
    return this.dashboardService.getStats();
  }

  async getOrders(filters: OrderFilters) {
    return this.orderService.getOrders(filters);
  }

  // Thêm method mới KHÔNG cần sửa code cũ
  async getShipmentTracking(orderId: string, recipientId: string) {
    return this.shipmentService.getTrackingInfo(orderId, recipientId);
  }
}
```

### ✅ Ví dụ: Adapter Pattern cho Carriers

```typescript
// ✅ Base interface - Đóng cho sửa đổi
export abstract class BaseCarrierAdapter {
  abstract createShipment(data: ShipmentData): Promise<ShipmentResult>;
  abstract getTracking(trackingNumber: string): Promise<TrackingInfo>;
  abstract cancelShipment(shipmentId: string): Promise<void>;
}

// ✅ Mở rộng bằng cách thêm adapter mới
export class GHNAdapter extends BaseCarrierAdapter {
  async createShipment(data: ShipmentData): Promise<ShipmentResult> {
    // GHN specific implementation
    const response = await this.ghnClient.createOrder({
      // Map data to GHN format
    });
    return this.mapToStandardFormat(response);
  }

  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    // GHN specific implementation
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    // GHN specific implementation
  }
}

// ✅ Thêm carrier mới KHÔNG cần sửa code cũ
export class ViettelPostAdapter extends BaseCarrierAdapter {
  async createShipment(data: ShipmentData): Promise<ShipmentResult> {
    // ViettelPost specific implementation
  }

  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    // ViettelPost specific implementation
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    // ViettelPost specific implementation
  }
}

// ✅ Factory để tạo adapter
export class CarrierFactory {
  static createAdapter(carrier: string): BaseCarrierAdapter {
    switch (carrier) {
      case "ghn":
        return new GHNAdapter();
      case "viettel-post":
        return new ViettelPostAdapter();
      default:
        throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }
}
```

### ❌ Vi phạm OCP

```javascript
// ❌ WRONG - Phải sửa code mỗi khi thêm carrier mới
async function createShipment(carrier, data) {
  if (carrier === "ghn") {
    // GHN logic
    const response = await ghnApi.createOrder(data);
    return response;
  } else if (carrier === "viettel-post") {
    // ViettelPost logic
    const response = await viettelApi.createShipment(data);
    return response;
  } else if (carrier === "vnpost") {
    // ❌ Phải sửa function này
    // VNPost logic
    const response = await vnpostApi.create(data);
    return response;
  }
}
```

---

## 3. Liskov Substitution Principle (LSP)

**Định nghĩa**: Subclass phải có thể thay thế base class mà không làm hỏng chương trình.

**Trong codebase**: Repository implementations phải tuân thủ interface.

### ✅ Ví dụ đúng

```typescript
// ✅ Base interface
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
}

// ✅ Implementation tuân thủ interface
export class SwagOrderRepository implements IRepository<SwagOrder> {
  async findById(id: string): Promise<SwagOrder | null> {
    return await SwagOrder.findById(id).lean();
  }

  async findOne(filter: FilterQuery<SwagOrder>): Promise<SwagOrder | null> {
    return await SwagOrder.findOne(filter).lean();
  }

  async find(filter: FilterQuery<SwagOrder>): Promise<SwagOrder[]> {
    return await SwagOrder.find(filter).lean();
  }

  async create(data: Partial<SwagOrder>): Promise<SwagOrder> {
    const order = new SwagOrder(data);
    return await order.save();
  }

  async update(
    id: string,
    data: Partial<SwagOrder>
  ): Promise<SwagOrder | null> {
    return await SwagOrder.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await SwagOrder.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter?: FilterQuery<SwagOrder>): Promise<number> {
    return await SwagOrder.countDocuments(filter || {});
  }
}

// ✅ Có thể thay thế bằng implementation khác
export class InMemorySwagOrderRepository implements IRepository<SwagOrder> {
  private orders: Map<string, SwagOrder> = new Map();

  async findById(id: string): Promise<SwagOrder | null> {
    return this.orders.get(id) || null;
  }

  async findOne(filter: FilterQuery<SwagOrder>): Promise<SwagOrder | null> {
    // In-memory implementation
    return Array.from(this.orders.values()).find(/* match filter */) || null;
  }

  // ... implement other methods
}
```

### ❌ Vi phạm LSP

```typescript
// ❌ WRONG - Subclass thay đổi behavior
class SpecialSwagOrderRepository extends SwagOrderRepository {
  // ❌ Thay đổi return type
  async findById(id: string): Promise<SwagOrder> {
    // Không có | null
    const order = await super.findById(id);
    if (!order) {
      throw new Error("Order not found"); // ❌ Throw error thay vì return null
    }
    return order;
  }

  // ❌ Thêm side effect không mong đợi
  async create(data: Partial<SwagOrder>): Promise<SwagOrder> {
    const order = await super.create(data);
    await this.sendEmail(order); // ❌ Side effect không có trong base class
    return order;
  }
}
```

---

## 4. Interface Segregation Principle (ISP)

**Định nghĩa**: Không nên bắt client implement interface mà nó không dùng.

**Trong codebase**: Tách interfaces thành các phần nhỏ, focused.

### ✅ Ví dụ đúng

```typescript
// ✅ Tách thành nhiều interfaces nhỏ
export interface IReadRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  count(filter?: FilterQuery<T>): Promise<number>;
}

export interface IWriteRepository<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// ✅ Service chỉ cần read operations
export class SwagOrderQueryService {
  constructor(private readonly repository: IReadRepository<SwagOrder>) {}

  async getOrders(filters: OrderFilters) {
    return await this.repository.find(filters);
  }

  async getOrder(id: string) {
    return await this.repository.findById(id);
  }
}

// ✅ Service cần cả read và write
export class SwagOrderCommandService {
  constructor(
    private readonly readRepo: IReadRepository<SwagOrder>,
    private readonly writeRepo: IWriteRepository<SwagOrder>
  ) {}

  async createOrder(data: CreateOrderData) {
    // Validate using read repo
    const existing = await this.readRepo.findOne({
      orderNumber: data.orderNumber,
    });
    if (existing) throw new ConflictException("Order exists");

    // Create using write repo
    return await this.writeRepo.create(data);
  }
}
```

### ❌ Vi phạm ISP

```typescript
// ❌ WRONG - Interface quá lớn
export interface ISwagOrderRepository {
  // Read operations
  findById(id: string): Promise<SwagOrder | null>;
  findByOrganization(orgId: string): Promise<SwagOrder[]>;
  findByStatus(status: string): Promise<SwagOrder[]>;

  // Write operations
  create(data: Partial<SwagOrder>): Promise<SwagOrder>;
  update(id: string, data: Partial<SwagOrder>): Promise<SwagOrder | null>;
  delete(id: string): Promise<boolean>;

  // Analytics operations
  getStats(orgId: string): Promise<OrderStats>;
  getRevenueByMonth(orgId: string): Promise<RevenueData[]>;

  // Export operations
  exportToCSV(filters: OrderFilters): Promise<string>;
  exportToPDF(orderId: string): Promise<Buffer>;
}

// ❌ Service chỉ cần read nhưng phải implement tất cả
class ReadOnlyOrderService implements ISwagOrderRepository {
  async findById(id: string) {
    /* implement */
  }

  // ❌ Phải implement những method không dùng
  async create(data: Partial<SwagOrder>) {
    throw new Error("Not supported");
  }

  async update(id: string, data: Partial<SwagOrder>) {
    throw new Error("Not supported");
  }

  async delete(id: string) {
    throw new Error("Not supported");
  }

  // ... phải implement tất cả
}
```

---

## 5. Dependency Inversion Principle (DIP)

**Định nghĩa**:

- High-level modules không nên phụ thuộc vào low-level modules. Cả hai nên phụ thuộc vào abstractions.
- Abstractions không nên phụ thuộc vào details. Details nên phụ thuộc vào abstractions.

**Trong codebase**: Sử dụng Dependency Injection.

### ✅ Ví dụ đúng

```typescript
// ✅ Service phụ thuộc vào abstraction (Repository interface)
export class SwagOrderService {
  constructor(
    private readonly orderRepository: IRepository<SwagOrder>,
    private readonly packRepository: IRepository<SwagPack>
  ) {}

  async createOrder(data: CreateOrderData) {
    // Use abstraction, not concrete implementation
    const pack = await this.packRepository.findById(data.swagPackId);
    if (!pack) throw new NotFoundException("Pack", data.swagPackId);

    const order = await this.orderRepository.create({
      swagPack: pack._id,
      // ...
    });

    return order;
  }
}

// ✅ Inject dependencies
const orderRepository = new SwagOrderRepository();
const packRepository = new SwagPackRepository();
const orderService = new SwagOrderService(orderRepository, packRepository);

// ✅ Dễ dàng test với mock
const mockOrderRepo = new InMemorySwagOrderRepository();
const mockPackRepo = new InMemorySwagPackRepository();
const testService = new SwagOrderService(mockOrderRepo, mockPackRepo);
```

### ✅ Frontend DIP

```typescript
// ✅ Hook phụ thuộc vào service abstraction
export function useSwagOrders(service: ISwagOrderService = swagOrderService) {
  const [orders, setOrders] = useState<SwagOrder[]>([]);

  const fetchOrders = async () => {
    const data = await service.getOrders();
    setOrders(data);
  };

  return { orders, fetchOrders };
}

// ✅ Dễ test với mock service
const mockService: ISwagOrderService = {
  getOrders: jest.fn().mockResolvedValue([]),
  getOrderDetail: jest.fn(),
  createOrder: jest.fn(),
};

const { result } = renderHook(() => useSwagOrders(mockService));
```

### ❌ Vi phạm DIP

```javascript
// ❌ WRONG - Service phụ thuộc trực tiếp vào concrete class
export class SwagOrderService {
  constructor() {
    // ❌ Tạo dependency trong constructor
    this.orderRepository = new SwagOrderRepository();
    this.packRepository = new SwagPackRepository();
  }

  async createOrder(data) {
    // ❌ Không thể test với mock
    // ❌ Không thể thay đổi implementation
    const pack = await this.packRepository.findById(data.swagPackId);
    // ...
  }
}

// ❌ WRONG - Direct model access
export class SwagOrderService {
  async createOrder(data) {
    // ❌ Phụ thuộc trực tiếp vào Mongoose model
    const pack = await SwagPack.findById(data.swagPackId);
    const order = new SwagOrder(data);
    await order.save();
    return order;
  }
}
```

---

## Tổng kết: SOLID trong Delta Swag Platform

### Backend Architecture

```
┌─────────────────────────────────────────┐
│         Controller Layer                │  ← SRP: HTTP handling only
│  (Depends on Service abstraction)       │  ← DIP: Inject service
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │  ← SRP: Business logic only
│  (Depends on Repository abstraction)    │  ← DIP: Inject repository
│  (Uses Facade for complex subsystems)   │  ← OCP: Extend via Facade
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Repository Layer                │  ← SRP: Data access only
│  (Implements IRepository interface)     │  ← LSP: Substitutable
│  (Segregated read/write interfaces)     │  ← ISP: Focused interfaces
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Model Layer                     │  ← SRP: Data structure only
└─────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│         Component Layer                 │  ← SRP: UI rendering only
│  (Uses custom hooks)                    │  ← DIP: Depends on hooks
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Hook Layer                      │  ← SRP: State management
│  (Uses service abstraction)             │  ← DIP: Inject service
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │  ← SRP: API calls only
│  (Implements service interface)         │  ← LSP: Substitutable
└─────────────────────────────────────────┘
```

---

## Checklist: Áp dụng SOLID

Trước khi commit code, hỏi bản thân:

### Single Responsibility

- [ ] Mỗi class/function có đúng MỘT trách nhiệm?
- [ ] Controller chỉ handle HTTP?
- [ ] Service chỉ có business logic?
- [ ] Repository chỉ có data access?

### Open/Closed

- [ ] Có thể mở rộng mà không sửa code cũ?
- [ ] Có dùng Facade/Adapter pattern khi cần?
- [ ] Có hardcode logic cần extract thành strategy?

### Liskov Substitution

- [ ] Subclass có thể thay thế base class?
- [ ] Implementation tuân thủ interface contract?
- [ ] Không thay đổi behavior của base class?

### Interface Segregation

- [ ] Interface có quá nhiều methods không?
- [ ] Client có phải implement methods không dùng?
- [ ] Có thể tách thành interfaces nhỏ hơn?

### Dependency Inversion

- [ ] Service phụ thuộc vào abstraction?
- [ ] Có inject dependencies qua constructor?
- [ ] Có thể test với mock dependencies?

---

## Khi nào vi phạm SOLID là OK?

Đôi khi vi phạm SOLID là chấp nhận được nếu:

1. **Simplicity > Purity**: Code đơn giản hơn nhiều khi vi phạm nhẹ
2. **Premature abstraction**: Chưa cần abstraction vì chỉ có 1 implementation
3. **Performance**: Abstraction layer gây overhead đáng kể

**Nhưng**: Luôn document lý do và sẵn sàng refactor khi cần!

---

## Tài liệu tham khảo

- [SOLID Principles Explained](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Xem thêm: `apps/admin-backend/docs/SOLID_REFACTORING.md` trong codebase
