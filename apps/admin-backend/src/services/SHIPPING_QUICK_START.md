# Shipping Service - Quick Start Guide

## Overview

Shipping Service quản lý việc tạo vận đơn, tracking, và tích hợp với các đơn vị vận chuyển (GHN, Viettel Post, GHTK, JT Express, Ninja Van).

## Architecture

```
ShippingService
  ├── Uses: CarrierIntegrationService (facade)
  ├── Uses: SwagOrderRepository
  └── Uses: ProductionOrderRepository
```

## Key Features

1. **Create Shipments**: Tạo vận đơn cho recipients
2. **Bulk Shipments**: Tạo nhiều vận đơn cùng lúc
3. **Tracking**: Lấy thông tin tracking từ carrier
4. **Webhooks**: Xử lý status updates từ carriers
5. **Label Generation**: Tạo shipping labels

## API Endpoints

### Create Shipment

```
POST /api/admin/shipments
Body: {
  orderId: string,
  recipientId: string,
  carrierId: string,
  packageDetails: {
    weight: number,
    dimensions: { length, width, height },
    value: number
  }
}
```

### Get Tracking

```
GET /api/admin/shipments/:id/tracking
Response: {
  trackingNumber: string,
  status: string,
  events: [...],
  estimatedDelivery: Date
}
```

### Bulk Create

```
POST /api/admin/shipments/bulk
Body: {
  orderId: string,
  carrierId: string,
  recipientIds: string[]
}
```

### Carrier Webhook

```
POST /api/webhooks/carriers/:carrier
Body: carrier-specific webhook payload
```

## Usage Example

```typescript
// Create shipment for a recipient
const shipment = await shippingService.createShipment(
  orderId,
  recipientId,
  "ghn",
  {
    weight: 500, // grams
    dimensions: { length: 20, width: 15, height: 10 }, // cm
    value: 500000, // VND
  }
);

// Get tracking info
const tracking = await shippingService.getTracking(shipmentId);

// Bulk create for all recipients
const shipments = await shippingService.createBulkShipments(
  orderId,
  "viettel-post"
);
```

## Status Flow

```
pending → created → picked_up → in_transit → out_for_delivery → delivered
                                           → failed → returned
```

## Integration Points

1. **Swag Order**: Link shipments to order recipients
2. **Production Order**: Trigger shipment after kitting complete
3. **Carrier APIs**: GHN, Viettel Post, GHTK, etc.
4. **Notification**: Send tracking updates to customers

## Error Handling

```typescript
// Carrier API errors
if (!shipmentResponse.success) {
  throw new CarrierException(
    `Failed to create shipment: ${shipmentResponse.error}`
  );
}

// Invalid order status
if (order.status !== "ready_to_ship") {
  throw new ConflictException("Order must be in ready_to_ship status");
}
```

## Testing

```bash
# Test shipment creation
npm test -- shipping.service.test.ts

# Test carrier integration
npm test -- carrier-integration.test.ts
```

## Related Files

- `services/shipping.service.ts` - Main service
- `services/carrier-integration.service.ts` - Carrier facade
- `services/carriers/*.adapter.ts` - Carrier adapters
- `controllers/admin.shipping.controller.ts` - HTTP handlers
- `routes/admin.shipping.routes.ts` - Route definitions
