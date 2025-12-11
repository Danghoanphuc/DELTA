# Shipping Components - Quick Start Guide

## Overview

Shipping components cung cấp UI để quản lý vận đơn, tracking, và tích hợp với carriers.

## Components

### 1. CreateShipmentModal

Modal để tạo vận đơn cho một recipient.

```tsx
import { CreateShipmentModal } from "@/components/shipping/CreateShipmentModal";

<CreateShipmentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  orderId="order_id"
  recipient={{
    _id: "recipient_id",
    name: "Nguyễn Văn A",
    phone: "0123456789",
    address: {
      fullAddress: "123 Đường ABC, Quận 1, TP.HCM",
      district: "Quận 1",
      city: "TP.HCM",
    },
  }}
  onSuccess={() => {
    // Refresh data
    fetchOrder();
  }}
/>;
```

**Features:**

- Chọn carrier (GHN, Viettel Post, GHTK, etc.)
- Nhập thông tin kiện hàng (weight, dimensions, value)
- Tính phí vận chuyển tự động
- Hiển thị thông tin người nhận

### 2. BulkShipmentModal

Modal để tạo nhiều vận đơn cùng lúc.

```tsx
import { BulkShipmentModal } from "@/components/shipping/BulkShipmentModal";

<BulkShipmentModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  orderId="order_id"
  recipients={order.recipients}
  onSuccess={() => {
    // Refresh data
    fetchOrder();
  }}
/>;
```

**Features:**

- Chọn nhiều recipients
- Select all / Deselect all
- Thông tin kiện hàng mặc định cho tất cả
- Hiển thị số lượng vận đơn sẽ tạo
- Filter recipients chưa có vận đơn

### 3. TrackingDisplay

Component hiển thị thông tin tracking và timeline.

```tsx
import { TrackingDisplay } from "@/components/shipping/TrackingDisplay";

<TrackingDisplay
  orderId="order_id"
  recipientId="recipient_id"
  autoRefresh={true}
  refreshInterval={60000} // 1 minute
/>;
```

**Features:**

- Hiển thị tracking number và status
- Timeline với events
- Estimated delivery date
- Link đến carrier website
- Auto-refresh (optional)
- Status badges với colors

## Hook: useShipping

```tsx
import { useShipping } from '@/hooks/useShipping';

function MyComponent() {
  const {
    isLoading,
    carriers,
    trackingInfo,
    fetchCarriers,
    createShipment,
    createBulkShipments,
    getTracking,
    cancelShipment,
    calculateFee,
  } = useShipping();

  // Fetch carriers on mount
  useEffect(() => {
    fetchCarriers();
  }, []);

  // Create single shipment
  const handleCreate = async () => {
    await createShipment({
      orderId: "order_id",
      recipientId: "recipient_id",
      carrierId: "ghn",
      packageDetails: {
        weight: 500,
        dimensions: { length: 30, width: 20, height: 10 },
        value: 500000
      }
    });
  };

  // Create bulk shipments
  const handleBulk = async () => {
    const result = await createBulkShipments({
      orderId: "order_id",
      carrierId: "viettel-post",
      recipientIds: ["id1", "id2"], // optional
      packageDetails: { ... } // optional
    });

    console.log(`Created ${result.success}, Failed ${result.failed}`);
  };

  // Get tracking
  const handleTracking = async () => {
    const tracking = await getTracking("order_id", "recipient_id");
    console.log(tracking);
  };

  // Calculate fee
  const handleCalculate = async () => {
    const fee = await calculateFee("ghn", "Quận 1", 500);
    console.log(`Fee: ${fee.fee} VND, Days: ${fee.estimatedDays}`);
  };
}
```

## Service: shippingService

```tsx
import { shippingService } from "@/services/admin.shipping.service";

// Create shipment
const result = await shippingService.createShipment({
  orderId: "order_id",
  recipientId: "recipient_id",
  carrierId: "ghn",
  packageDetails: {
    weight: 500,
    dimensions: { length: 30, width: 20, height: 10 },
    value: 500000,
    notes: "Handle with care",
  },
});

// Get carriers
const carriers = await shippingService.getCarriers();

// Get tracking
const tracking = await shippingService.getTracking("order_id", "recipient_id");

// Cancel shipment
await shippingService.cancelShipment(
  "order_id",
  "recipient_id",
  "Customer request"
);
```

## Integration Example

### Order Detail Page

```tsx
import { useState } from "react";
import { CreateShipmentModal } from "@/components/shipping/CreateShipmentModal";
import { BulkShipmentModal } from "@/components/shipping/BulkShipmentModal";
import { TrackingDisplay } from "@/components/shipping/TrackingDisplay";

function OrderDetailPage({ order }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  return (
    <div>
      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowBulkModal(true)}>
          Tạo Vận Đơn Hàng Loạt
        </button>
      </div>

      {/* Recipients List */}
      {order.recipients.map((recipient) => (
        <div key={recipient._id}>
          <h3>{recipient.name}</h3>

          {recipient.shipment?.trackingNumber ? (
            // Show tracking
            <TrackingDisplay
              orderId={order._id}
              recipientId={recipient._id}
              autoRefresh={true}
            />
          ) : (
            // Show create button
            <button
              onClick={() => {
                setSelectedRecipient(recipient);
                setShowCreateModal(true);
              }}
            >
              Tạo Vận Đơn
            </button>
          )}
        </div>
      ))}

      {/* Modals */}
      {selectedRecipient && (
        <CreateShipmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          orderId={order._id}
          recipient={selectedRecipient}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh order
          }}
        />
      )}

      <BulkShipmentModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        orderId={order._id}
        recipients={order.recipients}
        onSuccess={() => {
          setShowBulkModal(false);
          // Refresh order
        }}
      />
    </div>
  );
}
```

## Status Colors

```tsx
const statusColors = {
  created: "bg-blue-100 text-blue-800",
  picked_up: "bg-yellow-100 text-yellow-800",
  in_transit: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
  cancelled: "bg-gray-100 text-gray-800",
};
```

## Status Text (Vietnamese)

```tsx
const statusText = {
  created: "Đã tạo đơn",
  picked_up: "Đã lấy hàng",
  in_transit: "Đang vận chuyển",
  out_for_delivery: "Đang giao hàng",
  delivered: "Đã giao hàng",
  failed: "Giao thất bại",
  returned: "Đã hoàn trả",
  cancelled: "Đã hủy",
};
```

## Carriers

Available carriers:

- **GHN** (Giao Hàng Nhanh)
- **Viettel Post**
- **GHTK** (Giao Hàng Tiết Kiệm)
- **JT Express**
- **Ninja Van**

## Error Handling

All errors are handled by the hook and displayed via toast notifications:

```tsx
// Success
toast.success("Đã tạo vận đơn thành công!");

// Error
toast.error("Không thể tạo vận đơn");

// Bulk result
toast.success(`Đã tạo ${success} vận đơn, ${failed} lỗi`);
```

## TypeScript Types

```tsx
interface PackageDetails {
  weight: number; // grams
  dimensions: {
    length: number; // cm
    width: number; // cm
    height: number; // cm
  };
  value: number; // VND
  notes?: string;
}

interface Shipment {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  fee?: number;
}

interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}
```

## Related Files

- `services/admin.shipping.service.ts` - API service
- `hooks/useShipping.ts` - State management hook
- `components/shipping/CreateShipmentModal.tsx` - Single shipment
- `components/shipping/BulkShipmentModal.tsx` - Bulk shipments
- `components/shipping/TrackingDisplay.tsx` - Tracking display
