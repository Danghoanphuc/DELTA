# Template Service - Quick Start Guide

## Overview

The Template Service provides complete functionality for:

- ✅ Creating templates from existing orders
- ✅ Loading templates for reorder with availability checking
- ✅ Suggesting substitute products for discontinued items
- ✅ Managing template lifecycle (CRUD operations)

## API Endpoints

### 1. Create Template from Order

```http
POST /api/admin/templates/from-order/:orderId
Authorization: Bearer <token>

{
  "name": "Welcome Kit 2024",
  "description": "Standard welcome kit for new employees",
  "type": "welcome_kit",
  "isPublic": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "template": {
      "_id": "...",
      "name": "Welcome Kit 2024",
      "type": "welcome_kit",
      "items": [...],
      "usageTracking": {
        "timesUsed": 0,
        "totalRevenue": 0
      }
    }
  },
  "message": "Đã tạo template thành công!"
}
```

### 2. Get Templates List

```http
GET /api/admin/templates?type=welcome_kit&isActive=true
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "templates": [...],
    "total": 5
  }
}
```

### 3. Load Template for Reorder

```http
GET /api/admin/templates/:id/load-for-reorder
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "template": {...},
    "availability": {
      "allAvailable": false,
      "unavailableProducts": [
        {
          "productId": "...",
          "productName": "Old T-Shirt",
          "suggestedSubstitutes": ["...", "..."]
        }
      ]
    },
    "needsUpdate": true
  }
}
```

### 4. Get Suggested Substitutes

```http
GET /api/admin/templates/:id/substitutes/:productId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "substitutes": [
      {
        "productId": "...",
        "productName": "New T-Shirt",
        "productSku": "TSH-002",
        "basePrice": 150000,
        "reason": "Giá tương đương, chất lượng tương tự",
        "priceDifference": 5000,
        "isInStock": true
      }
    ],
    "total": 3
  }
}
```

### 5. Update Template Substitutes

```http
PUT /api/admin/templates/:id/substitutes/:productId
Authorization: Bearer <token>

{
  "substituteProductIds": ["...", "..."]
}
```

### 6. Update Template

```http
PUT /api/admin/templates/:id
Authorization: Bearer <token>

{
  "name": "Updated Template Name",
  "description": "Updated description",
  "isActive": true,
  "isPublic": false
}
```

### 7. Delete Template

```http
DELETE /api/admin/templates/:id
Authorization: Bearer <token>
```

## Service Methods

### createFromOrder()

```typescript
const template = await templateService.createFromOrder(organizationId, userId, {
  orderId: "...",
  name: "Welcome Kit 2024",
  description: "Standard welcome kit",
  type: "welcome_kit",
  isPublic: false,
});
```

**What it does:**

1. Validates order exists and user has access
2. Extracts products from order
3. Creates template with items
4. Sets up usage tracking
5. Returns created template

### loadForReorder()

```typescript
const result = await templateService.loadForReorder(organizationId, templateId);

// result = {
//   template: IProductTemplate,
//   availability: {
//     allAvailable: boolean,
//     unavailableProducts: [...]
//   },
//   needsUpdate: boolean
// }
```

**What it does:**

1. Loads template with populated products
2. Checks authorization
3. Validates template is active
4. Checks product availability
5. Returns template with availability status

### getSuggestedSubstitutes()

```typescript
const substitutes = await templateService.getSuggestedSubstitutes(
  templateId,
  productId
);

// substitutes = [
//   {
//     productId: ObjectId,
//     productName: string,
//     productSku: string,
//     basePrice: number,
//     reason: string,
//     priceDifference: number,
//     isInStock: boolean
//   }
// ]
```

**What it does:**

1. Gets template and original product
2. Retrieves configured substitutes or finds similar products
3. Calculates price differences
4. Generates reasons for substitution
5. Returns detailed substitute information

## Integration with Order Service

### Creating Order from Template

```typescript
// In OrderService
async createFromTemplate(
  organizationId: string,
  userId: string,
  templateId: string,
  data: CreateOrderData
): Promise<Order> {
  // 1. Load template with availability check
  const result = await templateService.loadForReorder(
    organizationId,
    templateId
  );

  // 2. Handle unavailable products
  if (!result.availability.allAvailable) {
    // Show user unavailable products and substitutes
    // Let user choose substitutes or remove items
  }

  // 3. Create order from template items
  const orderData = {
    ...data,
    items: result.template.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      // ... other fields
    }))
  };

  const order = await this.createOrder(organizationId, userId, orderData);

  // 4. Record template usage
  await result.template.recordUsage(
    order._id,
    order.orderNumber,
    order.organization,
    order.totalAmount,
    order.recipientShipments.length,
    userId
  );

  return order;
}
```

## Usage Examples

### Example 1: Create Template from Order

```typescript
// After customer completes an order
const template = await templateService.createFromOrder(
  req.user.organizationProfileId,
  req.user._id,
  {
    orderId: order._id,
    name: "Q1 2024 Welcome Kit",
    description: "Standard welcome kit for Q1 2024",
    type: "welcome_kit",
    isPublic: false,
  }
);
```

### Example 2: Reorder with Availability Check

```typescript
// Customer wants to reorder
const result = await templateService.loadForReorder(
  req.user.organizationProfileId,
  templateId
);

if (!result.availability.allAvailable) {
  // Show unavailable products
  for (const unavailable of result.availability.unavailableProducts) {
    console.log(`${unavailable.productName} is no longer available`);

    // Get substitutes
    const substitutes = await templateService.getSuggestedSubstitutes(
      templateId,
      unavailable.productId.toString()
    );

    console.log(`Suggested substitutes: ${substitutes.length}`);
    substitutes.forEach((sub) => {
      console.log(`- ${sub.productName} (${sub.productSku}): ${sub.reason}`);
    });
  }
}
```

### Example 3: Update Substitutes

```typescript
// User selects substitute products
await templateService.updateSubstitutes(
  req.user.organizationProfileId,
  templateId,
  discontinuedProductId,
  [newProductId1, newProductId2]
);
```

## Error Handling

### Common Errors

```typescript
// Order not found
throw new NotFoundException("Swag Order", orderId);

// Unauthorized access
throw new ForbiddenException("Bạn không có quyền tạo template từ đơn hàng này");

// Invalid input
throw new ValidationException("Tên template không được để trống");

// Template inactive
throw new ValidationException("Template này đã bị vô hiệu hóa");
```

## Best Practices

1. **Always check availability** before creating order from template
2. **Provide substitute options** to users when products are unavailable
3. **Record usage** after successful order creation
4. **Keep templates updated** - remove discontinued products
5. **Use meaningful names** for templates
6. **Set appropriate visibility** (public vs private)

## Testing

### Unit Tests

```typescript
describe("TemplateService", () => {
  it("should create template from order", async () => {
    const template = await templateService.createFromOrder(orgId, userId, {
      orderId: order._id,
      name: "Test Template",
      type: "custom",
    });

    expect(template.name).toBe("Test Template");
    expect(template.items).toHaveLength(order.packSnapshot.items.length);
  });

  it("should check product availability", async () => {
    const result = await templateService.loadForReorder(orgId, templateId);

    expect(result).toHaveProperty("template");
    expect(result).toHaveProperty("availability");
    expect(result).toHaveProperty("needsUpdate");
  });

  it("should suggest substitutes", async () => {
    const substitutes = await templateService.getSuggestedSubstitutes(
      templateId,
      productId
    );

    expect(substitutes).toBeInstanceOf(Array);
    substitutes.forEach((sub) => {
      expect(sub).toHaveProperty("productId");
      expect(sub).toHaveProperty("reason");
      expect(sub).toHaveProperty("priceDifference");
    });
  });
});
```

## Next Steps

- ✅ Task 9.1.1: Enhanced Product Template Model (COMPLETE)
- ✅ Task 9.1.2: Implement Template Service (COMPLETE)
- ✅ Task 9.1.3: Create Template Controller & Routes (COMPLETE)
- ⏭️ Task 9.2.1: Create Template Library Page (Frontend)
- ⏭️ Task 9.2.2: Create Save as Template Modal (Frontend)
- ⏭️ Task 9.2.3: Create Reorder from Template Flow (Frontend)

## Summary

The Template Service provides complete backend functionality for:

- Creating reusable templates from orders
- Loading templates with availability checking
- Suggesting substitute products
- Managing template lifecycle

All endpoints are secured with authentication and authorization checks.
