# Polymorphic Reference Solution - DeliveryCheckin

## Vấn đề gốc rễ

Lỗi `Schema hasn't been registered for model "Order"` xảy ra vì:

1. **Thiếu thống nhất Schema**: DeliveryCheckin model có `orderId` ref đến "Order" - một model không tồn tại
2. **Hệ thống có nhiều loại Order**: SwagOrder và MasterOrder là 2 models riêng biệt
3. **Hardcoded reference**: Mongoose populate không thể resolve dynamic model names

## Giải pháp: Polymorphic Reference Pattern

### 1. Single Source of Truth - Order Types Constants

```javascript
// apps/customer-backend/src/shared/constants/order-types.constant.js

export const ORDER_TYPES = {
  SWAG: "swag", // SwagOrder - Đơn gửi quà
  MASTER: "master", // MasterOrder - Đơn mua hàng
};

export const ORDER_TYPE_TO_MODEL = {
  [ORDER_TYPES.SWAG]: "SwagOrder",
  [ORDER_TYPES.MASTER]: "MasterOrder",
};
```

### 2. Order Resolver Service

```javascript
// apps/customer-backend/src/shared/services/order-resolver.service.js

class OrderResolverService {
  // Resolve order by ID and type
  async resolveById(orderId, orderType) {
    const Model = this._getModel(orderType);
    const order = await Model.findById(orderId).lean();
    return this._normalizeOrder(order, orderType);
  }

  // Auto-detect type from orderNumber prefix
  async resolveByOrderNumber(orderNumber) {
    const orderType = detectOrderTypeFromNumber(orderNumber);
    // ...
  }
}
```

### 3. DeliveryCheckin Model với Polymorphic Reference

```javascript
// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.model.js

const deliveryCheckinSchema = new mongoose.Schema({
  // Polymorphic reference fields
  orderType: {
    type: String,
    enum: Object.values(ORDER_TYPES),
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "orderModel", // Dynamic reference
    required: true,
  },
  orderModel: {
    type: String,
    enum: Object.values(ORDER_TYPE_TO_MODEL),
    required: true,
  },
  orderNumber: String, // Denormalized for quick access
  // ...
});
```

### 4. Repository sử dụng Resolver

```javascript
// apps/customer-backend/src/modules/delivery-checkin/delivery-checkin.repository.js

async findByIdWithOrder(id) {
  const checkin = await this.findById(id);
  if (!checkin) return null;

  // Resolve order using polymorphic resolver
  const order = await orderResolverService.resolveById(
    checkin.orderId,
    checkin.orderType
  );

  return { ...checkin, order };
}
```

## Lợi ích

1. **Không còn lỗi "Schema hasn't been registered"**: Không hardcode model name
2. **Dễ mở rộng**: Thêm order type mới chỉ cần update constants
3. **Single collection**: DeliveryCheckin lưu check-ins cho tất cả order types
4. **Type-safe**: orderType field đảm bảo data integrity
5. **Performance**: orderNumber denormalized, không cần populate cho display

## Files đã thay đổi

| File                                                                | Thay đổi                        |
| ------------------------------------------------------------------- | ------------------------------- |
| `shared/constants/order-types.constant.js`                          | NEW - Constants cho order types |
| `shared/services/order-resolver.service.js`                         | NEW - Service resolve orders    |
| `modules/delivery-checkin/delivery-checkin.model.js`                | UPDATED - Polymorphic schema    |
| `modules/delivery-checkin/delivery-checkin.repository.js`           | UPDATED - Use resolver          |
| `modules/delivery-checkin/delivery-checkin.repository.optimized.js` | UPDATED - Sync pattern          |
| `modules/delivery-checkin/delivery-checkin.service.js`              | UPDATED - Support orderType     |

## Migration

```bash
# Run migration to add orderType/orderModel to existing records
node --experimental-vm-modules src/scripts/migrations/migrate-delivery-checkins-polymorphic.js

# Seed new test data
node --experimental-vm-modules src/scripts/seed-delivery-checkins-v2.js

# Verify solution
node --experimental-vm-modules src/scripts/verify-polymorphic-solution.js
```

## Thêm Order Type mới

1. Thêm vào `ORDER_TYPES` constant
2. Thêm mapping vào `ORDER_TYPE_TO_MODEL`
3. Thêm prefix vào `ORDER_NUMBER_PREFIXES`
4. Implement normalize method trong `OrderResolverService`

```javascript
// Ví dụ: Thêm ReturnOrder
export const ORDER_TYPES = {
  SWAG: "swag",
  MASTER: "master",
  RETURN: "return", // NEW
};

export const ORDER_TYPE_TO_MODEL = {
  [ORDER_TYPES.SWAG]: "SwagOrder",
  [ORDER_TYPES.MASTER]: "MasterOrder",
  [ORDER_TYPES.RETURN]: "ReturnOrder", // NEW
};
```
