# Kitting UI - Quick Start Guide

## Overview

Kitting UI cung cấp giao diện để quản lý quy trình đóng gói swag packs.

## Components

### 1. KittingQueuePage

**Location:** `src/pages/KittingQueuePage.tsx`

**Purpose:** Hiển thị danh sách đơn hàng sẵn sàng để kitting

**Features:**

- Display orders ready for kitting
- Filter by status (pending, in_progress)
- Sort by priority or date
- Navigate to kitting detail

**Usage:**

```tsx
import { KittingQueuePage } from "./pages/KittingQueuePage";

// In router
<Route path="/kitting" element={<KittingQueuePage />} />;
```

### 2. KittingDetailPage

**Location:** `src/pages/KittingDetailPage.tsx`

**Purpose:** Thực hiện quy trình kitting cho một đơn hàng

**Features:**

- Display kitting checklist
- Validate inventory
- Start kitting process
- Scan items
- Complete kitting

**Usage:**

```tsx
import { KittingDetailPage } from "./pages/KittingDetailPage";

// In router
<Route path="/kitting/:orderId" element={<KittingDetailPage />} />;
```

### 3. KittingChecklist

**Location:** `src/components/kitting/KittingChecklist.tsx`

**Purpose:** Hiển thị checklist items và scan functionality

**Props:**

```typescript
interface Props {
  checklist: KittingChecklistType;
  onScanItem: (sku: string, quantity?: number) => Promise<void>;
  isScanning: boolean;
}
```

**Features:**

- Progress bar
- Scan input form
- Item list with status
- Quick scan buttons

**Usage:**

```tsx
<KittingChecklist
  checklist={checklist}
  onScanItem={handleScanItem}
  isScanning={isScanning}
/>
```

## Hook: useKitting

**Location:** `src/hooks/useKitting.ts`

**Purpose:** State management cho kitting operations

**API:**

```typescript
const {
  // State
  orders,
  checklist,
  validation,
  isLoading,
  error,

  // Actions
  fetchKittingQueue,
  fetchKittingChecklist,
  validateInventory,
  startKitting,
  scanItem,
  completeKitting,
} = useKitting();
```

**Example:**

```typescript
// Fetch kitting queue
await fetchKittingQueue({ status: "pending", sortBy: "priority" });

// Get checklist
await fetchKittingChecklist(orderId);

// Validate inventory
const validation = await validateInventory(orderId);

// Start kitting
await startKitting(orderId);

// Scan item
await scanItem(orderId, "TSH-BLK-M", 50);

// Complete kitting
await completeKitting(orderId);
```

## Service: kittingService

**Location:** `src/services/admin.kitting.service.ts`

**Purpose:** API calls cho kitting operations

**Methods:**

```typescript
class KittingService {
  async getKittingQueue(filters): Promise<SwagOrderKitting[]>;
  async getKittingChecklist(orderId): Promise<KittingChecklist>;
  async getKittingProgress(orderId): Promise<KittingProgress>;
  async validateInventory(orderId): Promise<InventoryValidation>;
  async startKitting(orderId): Promise<void>;
  async scanItem(orderId, sku, quantity?): Promise<ScanResult>;
  async completeKitting(orderId): Promise<void>;
}
```

## Workflow

### Complete Kitting Flow

```
1. User visits /kitting
   ↓
2. KittingQueuePage displays orders
   ↓
3. User clicks "Bắt đầu" on an order
   ↓
4. Navigate to /kitting/:orderId
   ↓
5. KittingDetailPage loads checklist
   ↓
6. System validates inventory
   ↓
7. User clicks "Bắt đầu kitting"
   ↓
8. User scans each item
   ↓
9. Progress updates in real-time
   ↓
10. When 100% complete, user clicks "Hoàn tất kitting"
    ↓
11. Navigate back to /kitting
```

## Routing

Add these routes to your router:

```tsx
import { KittingQueuePage } from "./pages/KittingQueuePage";
import { KittingDetailPage } from "./pages/KittingDetailPage";

<Routes>
  <Route path="/kitting" element={<KittingQueuePage />} />
  <Route path="/kitting/:orderId" element={<KittingDetailPage />} />
</Routes>;
```

## Navigation

Add to sidebar:

```tsx
<NavLink to="/kitting">
  <BoxIcon className="w-5 h-5" />
  <span>Kitting</span>
</NavLink>
```

## Styling

Uses Tailwind CSS classes. Key colors:

- Primary: `blue-600`
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`

## Icons

Uses Heroicons:

```tsx
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
```

## Error Handling

All errors are handled by the `useKitting` hook and displayed via toast notifications:

```typescript
try {
  await scanItem(orderId, sku);
  toast.success("Đã scan thành công");
} catch (error) {
  toast.error("Không thể scan item");
}
```

## Testing

### Manual Testing

1. **Kitting Queue:**

   - Visit `/kitting`
   - Verify orders are displayed
   - Test filters and sorting

2. **Start Kitting:**

   - Click "Bắt đầu" on an order
   - Verify navigation to detail page
   - Verify inventory validation

3. **Scan Items:**

   - Enter SKU manually
   - Click "Scan"
   - Verify item is marked as packed
   - Test "Quick Scan" button

4. **Complete Kitting:**
   - Scan all items
   - Click "Hoàn tất kitting"
   - Verify navigation back to queue

## Requirements Covered

- ✅ 8.1: Kitting queue display
- ✅ 8.2: Kitting checklist with scan functionality
- ✅ 8.3: Item scanning and validation
- ✅ 8.4: Kitting completion

## Next Steps

1. Add packing slip generation (Phase 7)
2. Add barcode scanner integration
3. Add print labels functionality
4. Add bulk operations

## Summary

Kitting UI provides:

- ✅ Queue management interface
- ✅ Checklist with progress tracking
- ✅ Item scanning functionality
- ✅ Inventory validation alerts
- ✅ Complete workflow from start to finish
