# Inventory Management UI - Quick Start Guide

## Overview

Frontend UI cho Inventory Management System, tích hợp với backend APIs để quản lý tồn kho real-time.

## Features

✅ **Inventory Dashboard**

- Overview cards với stats tổng quan
- Low stock alerts
- Manual adjustment
- Record purchase

✅ **Transaction History**

- Paginated transaction log
- Filter by type
- Export to CSV (coming soon)

✅ **Real-time Updates**

- Automatic refresh after operations
- Loading states
- Error handling với toast notifications

## File Structure

```
src/
├── services/
│   └── admin.inventory.service.ts      # API service
├── hooks/
│   └── useInventoryManagement.ts       # State management hooks
├── pages/
│   ├── InventoryDashboardPage.tsx      # Main dashboard
│   └── InventoryTransactionHistoryPage.tsx  # Transaction history
└── components/inventory/
    ├── InventoryOverviewCards.tsx      # Stats cards
    ├── LowStockTable.tsx               # Low stock items table
    ├── ManualAdjustmentModal.tsx       # Adjust inventory modal
    ├── RecordPurchaseModal.tsx         # Record purchase modal
    ├── VariantInventoryCard.tsx        # Variant info card
    └── TransactionHistoryTable.tsx     # Transaction history table
```

## Usage

### 1. Inventory Dashboard

```tsx
import InventoryDashboardPage from "@/pages/InventoryDashboardPage";

// Route: /inventory
<Route path="/inventory" element={<InventoryDashboardPage />} />;
```

**Features:**

- View inventory overview (total variants, available stock, value, low stock count)
- See low stock items table
- Manual adjustment via modal
- Record purchase via modal

### 2. Transaction History

```tsx
import InventoryTransactionHistoryPage from "@/pages/InventoryTransactionHistoryPage";

// Route: /inventory/:variantId/transactions
<Route
  path="/inventory/:variantId/transactions"
  element={<InventoryTransactionHistoryPage />}
/>;
```

**Features:**

- View variant inventory details
- See transaction history with pagination
- Filter by transaction type
- Export to CSV

### 3. Using Hooks

```tsx
import { useInventoryManagement } from "@/hooks/useInventoryManagement";

function MyComponent() {
  const {
    overview,
    lowStockItems,
    isLoading,
    adjustInventory,
    recordPurchase,
  } = useInventoryManagement();

  // Adjust inventory
  await adjustInventory(variantId, quantityChange, reason, notes);

  // Record purchase
  await recordPurchase(variantId, quantity, unitCost, poNumber, notes);
}
```

### 4. Using Service Directly

```tsx
import { adminInventoryService } from "@/services/admin.inventory.service";

// Get overview
const overview = await adminInventoryService.getInventoryOverview();

// Get low stock items
const lowStock = await adminInventoryService.getLowStockItems(10);

// Get variant inventory
const variant = await adminInventoryService.getVariantInventory(variantId);

// Get transaction history
const { transactions, pagination } =
  await adminInventoryService.getTransactionHistory(variantId, {
    page: 1,
    limit: 20,
  });

// Adjust inventory
await adminInventoryService.adjustInventory(variantId, {
  quantityChange: 50,
  reason: "Physical count adjustment",
  notes: "Found extra stock",
});

// Record purchase
await adminInventoryService.recordPurchase(variantId, {
  quantity: 100,
  unitCost: 50000,
  purchaseOrderNumber: "PO-2024-001",
});
```

## API Endpoints Used

```
GET    /api/admin/inventory                    - Overview
GET    /api/admin/inventory/low-stock          - Low stock items
GET    /api/admin/inventory/:variantId         - Variant inventory
GET    /api/admin/inventory/:variantId/transactions  - Transaction history
POST   /api/admin/inventory/:variantId/adjust  - Adjust inventory
POST   /api/admin/inventory/:variantId/purchase - Record purchase
```

## Components

### InventoryOverviewCards

Display overview statistics in card format.

```tsx
<InventoryOverviewCards overview={overview} />
```

### LowStockTable

Display low stock items with actions.

```tsx
<LowStockTable
  items={lowStockItems}
  onAdjust={handleAdjust}
  onPurchase={handlePurchase}
/>
```

### ManualAdjustmentModal

Modal for manual inventory adjustment.

```tsx
<ManualAdjustmentModal
  isOpen={isOpen}
  onClose={onClose}
  variantId={variantId}
  onSubmit={adjustInventory}
  isSubmitting={isSubmitting}
/>
```

### RecordPurchaseModal

Modal for recording purchase/receiving stock.

```tsx
<RecordPurchaseModal
  isOpen={isOpen}
  onClose={onClose}
  variantId={variantId}
  onSubmit={recordPurchase}
  isSubmitting={isSubmitting}
/>
```

### TransactionHistoryTable

Display transaction history with pagination.

```tsx
<TransactionHistoryTable
  transactions={transactions}
  pagination={pagination}
  onPageChange={handlePageChange}
  isLoading={isLoading}
/>
```

## Integration with Swag Order Service

### Reserve Inventory on Order Creation

```tsx
import { adminInventoryService } from "@/services/admin.inventory.service";

// When creating swag order
const handleCreateOrder = async (orderData) => {
  // 1. Check if can fulfill
  const check = await adminInventoryService.checkFulfillment(
    orderData.items.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    }))
  );

  if (!check.canFulfill) {
    toast.error("Không đủ hàng để thực hiện đơn hàng");
    return;
  }

  // 2. Create order
  const order = await swagOrderService.createOrder(orderData);

  // 3. Reserve inventory for each item
  for (const item of orderData.items) {
    await adminInventoryService.reserveInventory(item.variantId, {
      quantity: item.quantity,
      orderId: order._id,
      orderNumber: order.orderNumber,
      reason: "Reserved for swag order",
    });
  }
};
```

### Release Inventory on Order Cancellation

```tsx
// When cancelling order
const handleCancelOrder = async (order) => {
  // 1. Cancel order
  await swagOrderService.cancelOrder(order._id);

  // 2. Release reserved inventory
  for (const item of order.items) {
    await adminInventoryService.releaseInventory(item.variantId, {
      quantity: item.quantity,
      orderId: order._id,
      orderNumber: order.orderNumber,
      reason: "Order cancelled",
    });
  }
};
```

## Error Handling

All operations use toast notifications for user feedback:

```tsx
try {
  await adjustInventory(variantId, quantityChange, reason);
  toast.success("Đã điều chỉnh tồn kho");
} catch (error) {
  toast.error(error.response?.data?.message || "Không thể điều chỉnh tồn kho");
}
```

## Styling

Uses Tailwind CSS with consistent color scheme:

- Primary: Orange (#F97316)
- Success: Green
- Warning: Yellow
- Error: Red
- Info: Blue

## Next Steps

1. Add routing to admin app
2. Integrate with Swag Order Service
3. Add CSV export functionality
4. Add date range filters for transactions
5. Add bulk operations support

## Testing

```bash
# Run dev server
npm run dev

# Navigate to
http://localhost:5173/inventory
```

## Requirements Validated

✅ **Requirement 5.1**: Track stock quantity, reserved quantity, available quantity
✅ **Requirement 5.4**: Low stock alerts when below threshold
✅ **Requirement 5.1**: Transaction history with audit trail

---

**Status**: ✅ Phase 4.2 Complete
**Date**: December 7, 2024
