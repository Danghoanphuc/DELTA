# Product Template Model - Quick Start Guide

## Overview

The enhanced Product Template model supports:

- ✅ Usage tracking (times used, revenue, last used)
- ✅ Order history (last 50 orders created from template)
- ✅ Substitute product support (for discontinued products)
- ✅ Automatic availability checking

## Model Structure

```typescript
interface IProductTemplate {
  // Basic Info
  name: string;
  description?: string;
  type: "welcome_kit" | "event_swag" | "client_gift" | "holiday" | "custom";
  organizationId?: ObjectId; // Private templates

  // Template Items
  items: {
    productId: ObjectId;
    productName: string;
    productSku: string;
    quantity: number;
    isRequired: boolean;
    allowSubstitute: boolean;
    substituteProducts?: {
      productId: ObjectId;
      productName: string;
      productSku: string;
      reason?: string;
    }[];
  }[];

  // Usage Tracking (PHASE 9.1.1)
  usageTracking: {
    timesUsed: number;
    lastUsedAt?: Date;
    lastUsedBy?: ObjectId;
    totalRevenue: number;
    averageOrderValue: number;
  };

  // Order History (PHASE 9.1.1)
  orderHistory: {
    orderId: ObjectId;
    orderNumber: string;
    organizationId: ObjectId;
    createdAt: Date;
    totalAmount: number;
    recipientCount: number;
  }[];

  // Discontinued Products (PHASE 9.1.1)
  discontinuedProducts: ObjectId[];
}
```

## Methods

### 1. Record Template Usage

```typescript
await template.recordUsage(
  orderId,
  orderNumber,
  organizationId,
  totalAmount,
  recipientCount,
  userId
);
```

**What it does:**

- Increments `timesUsed` counter
- Updates `lastUsedAt` and `lastUsedBy`
- Calculates `totalRevenue` and `averageOrderValue`
- Adds order to history (keeps last 50)

### 2. Get Suggested Substitutes

```typescript
const substitutes = await template.getSuggestedSubstitutes(productId);
```

**What it does:**

- Returns configured substitute products
- If no substitutes configured, finds similar products in same category
- Returns array of product IDs

### 3. Check Product Availability

```typescript
const result = await template.checkProductAvailability();
// {
//   allAvailable: boolean,
//   unavailableProducts: [{
//     productId: ObjectId,
//     productName: string,
//     suggestedSubstitutes: ObjectId[]
//   }]
// }
```

**What it does:**

- Checks if all products are active and published
- Returns list of unavailable products with substitutes
- Automatically adds discontinued products to tracking list

## Usage Examples

### Creating a Template

```typescript
const template = new ProductTemplate({
  name: "Welcome Kit 2024",
  type: "welcome_kit",
  organizationId: orgId,
  items: [
    {
      productId: tshirtId,
      productName: "Company T-Shirt",
      productSku: "TSH-001",
      quantity: 1,
      isRequired: true,
      allowSubstitute: true,
      substituteProducts: [
        {
          productId: altTshirtId,
          productName: "Alternative T-Shirt",
          productSku: "TSH-002",
          reason: "Similar style, same price range",
        },
      ],
    },
  ],
  defaultCustomization: {
    includeLogo: true,
    logoPosition: "front",
    includePersonalization: true,
  },
  isActive: true,
  isPublic: false,
});

await template.save();
```

### Recording Usage

```typescript
// When order is created from template
await template.recordUsage(
  order._id,
  order.orderNumber,
  order.organization,
  order.totalAmount,
  order.recipientShipments.length,
  req.user._id
);
```

### Checking Availability Before Reorder

```typescript
const availability = await template.checkProductAvailability();

if (!availability.allAvailable) {
  // Show user which products are unavailable
  for (const unavailable of availability.unavailableProducts) {
    console.log(`${unavailable.productName} is no longer available`);
    console.log(
      `Suggested substitutes: ${unavailable.suggestedSubstitutes.length}`
    );
  }
}
```

## Indexes

```typescript
// Performance indexes
{ type: 1, isActive: 1 }
{ isPublic: 1 }
{ organizationId: 1, isActive: 1 }
{ "usageTracking.timesUsed": -1 }
{ "usageTracking.lastUsedAt": -1 }
```

## Integration Points

### With Template Service (Phase 9.1.2)

```typescript
class TemplateService {
  async createFromOrder(orderId: string): Promise<ProductTemplate> {
    // Create template from existing order
  }

  async loadForReorder(templateId: string): Promise<TemplateData> {
    // Load template and check availability
    const template = await ProductTemplate.findById(templateId);
    const availability = await template.checkProductAvailability();
    return { template, availability };
  }
}
```

### With Order Service

```typescript
class OrderService {
  async createFromTemplate(templateId: string, data: any): Promise<Order> {
    const template = await ProductTemplate.findById(templateId);

    // Check availability
    const availability = await template.checkProductAvailability();
    if (!availability.allAvailable) {
      // Handle substitutions
    }

    // Create order
    const order = await this.create(data);

    // Record usage
    await template.recordUsage(
      order._id,
      order.orderNumber,
      order.organization,
      order.totalAmount,
      order.recipientShipments.length,
      userId
    );

    return order;
  }
}
```

## Best Practices

1. **Always check availability** before creating order from template
2. **Configure substitutes** for critical products
3. **Keep templates updated** - remove discontinued products
4. **Monitor usage metrics** to identify popular templates
5. **Limit order history** to last 50 to prevent document bloat

## Next Steps

- ✅ Task 9.1.1: Enhanced Product Template Model (COMPLETE)
- ⏭️ Task 9.1.2: Implement Template Service
- ⏭️ Task 9.1.3: Create Template Controller & Routes
