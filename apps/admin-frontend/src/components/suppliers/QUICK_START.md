# Supplier Management UI - Quick Start Guide

## Overview

Phase 8.2 implements the frontend UI for supplier management with performance tracking and comparison features.

## Components Created

### 1. Pages

#### SupplierDetailPage (`/catalog/suppliers/:id`)

**Purpose**: Display detailed supplier information with performance metrics

**Features**:

- Contact information display
- Performance metrics cards (on-time delivery, quality score, lead time, cost)
- Interactive rating system (1-5 stars)
- Lead time history table
- Real-time data from backend API

**Key Metrics Displayed**:

- On-Time Delivery Rate (%)
- Quality Score (%)
- Average Lead Time (days)
- Average Cost (VND)

#### SupplierPerformancePage (`/catalog/suppliers-performance`)

**Purpose**: Compare all suppliers by performance metrics

**Features**:

- Summary cards (total suppliers, good performers, average rating, need improvement)
- Sortable comparison table
- Top performers list
- Suppliers needing improvement list
- Color-coded performance indicators

**Sorting Options**:

- On-time delivery rate
- Quality score
- Average lead time
- Average cost
- Rating

### 2. Enhanced Components

#### SuppliersPage

**New Features**:

- "So sánh hiệu suất" button → links to performance dashboard
- "Chi tiết" button on each supplier card → links to detail page

#### SupplierCard

**New Features**:

- "Chi tiết" button → links to supplier detail page

## API Integration

### New Service Methods

```typescript
// Get supplier performance metrics
supplierApi.getPerformance(id: string): Promise<SupplierPerformanceMetrics>

// Get lead time history
supplierApi.getLeadTimeHistory(id: string): Promise<LeadTimeRecord[]>

// Update supplier rating
supplierApi.updateRating(id: string, rating: number): Promise<Supplier>

// Compare suppliers
supplierApi.compareSuppliers(supplierIds?: string[]): Promise<SupplierComparison[]>
```

### Data Types

```typescript
interface SupplierPerformanceMetrics {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  totalOrders: number;
  completedOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeDeliveryRate: number;
  totalQCChecks: number;
  passedQCChecks: number;
  failedQCChecks: number;
  qualityScore: number;
  averageLeadTime: number;
  minLeadTime: number;
  maxLeadTime: number;
  averageCost: number;
  totalSpent: number;
  lastUpdated: Date;
}

interface LeadTimeRecord {
  productionOrderId: string;
  productionOrderNumber: string;
  orderedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate: Date;
  leadTimeDays: number;
  wasOnTime: boolean;
}

interface SupplierComparison {
  supplierId: string;
  supplierName: string;
  onTimeRate: number;
  qualityScore: number;
  averageLeadTime: number;
  averageCost: number;
  totalOrders: number;
  rating: number;
}
```

## Routes

```typescript
// Supplier list
/catalog/suppliers

// Supplier detail with performance
/catalog/suppliers/:id

// Supplier performance comparison
/catalog/suppliers-performance
```

## Usage Examples

### 1. View Supplier Performance

```typescript
// Navigate to supplier detail
navigate(`/catalog/suppliers/${supplierId}`);

// Data is automatically fetched on mount
useEffect(() => {
  fetchSupplierData(); // Fetches supplier, performance, and lead time history
}, [id]);
```

### 2. Update Supplier Rating

```typescript
const handleUpdateRating = async (newRating: number) => {
  await supplierApi.updateRating(supplierId, newRating);
  toast.success("Đã cập nhật đánh giá");
};
```

### 3. Compare Suppliers

```typescript
// Fetch all suppliers for comparison
const suppliers = await supplierApi.compareSuppliers();

// Sort by performance metric
const sorted = suppliers.sort((a, b) => b.onTimeRate - a.onTimeRate);
```

## Performance Indicators

### Color Coding

**On-Time Delivery Rate**:

- Green: ≥ 95%
- Yellow: 90-94%
- Red: < 90%

**Quality Score**:

- Green: ≥ 95%
- Yellow: 90-94%
- Red: < 90%

**Lead Time**:

- Green: ≤ 5 days
- Yellow: 6-7 days
- Red: > 7 days

## Testing

### Manual Testing Steps

1. **Supplier Detail Page**:

   - Navigate to `/catalog/suppliers/:id`
   - Verify all metrics display correctly
   - Test rating update (click stars)
   - Check lead time history table

2. **Performance Dashboard**:

   - Navigate to `/catalog/suppliers-performance`
   - Verify summary cards
   - Test sorting by different columns
   - Check top performers list
   - Verify "need improvement" list

3. **Navigation**:
   - From suppliers list → click "So sánh hiệu suất"
   - From suppliers list → click "Chi tiết" on card
   - From detail page → click "Quay lại"
   - From performance page → click "Chi tiết" on row

## Architecture

### SOLID Principles

✅ **Single Responsibility**:

- Pages: UI rendering only
- Services: API calls only
- Components: Focused UI elements

✅ **Dependency Inversion**:

- Pages depend on service abstractions
- Easy to mock for testing

### Error Handling

```typescript
try {
  const data = await supplierApi.getPerformance(id);
  setPerformance(data);
} catch (error: any) {
  toast.error(error.response?.data?.message || "Không thể tải dữ liệu");
  console.error("Error:", error);
}
```

## Next Steps

After Phase 8.2, the next phase is:

**Phase 9: Product Templates & Quick Reorder**

- Template library page
- Save as template modal
- Reorder from template flow

## Requirements Validated

✅ **4.3**: Display performance metrics, lead time history, quality score
✅ **4.4**: Compare suppliers by metrics
✅ **13.2**: Display on-time delivery rates, cost comparisons

## Files Modified/Created

### Created:

- `apps/admin-frontend/src/pages/SupplierDetailPage.tsx`
- `apps/admin-frontend/src/pages/SupplierPerformancePage.tsx`
- `apps/admin-frontend/src/components/suppliers/QUICK_START.md`

### Modified:

- `apps/admin-frontend/src/services/catalog.service.ts` (added performance APIs)
- `apps/admin-frontend/src/pages/SuppliersPage.tsx` (added performance button)
- `apps/admin-frontend/src/components/suppliers/SupplierCard.tsx` (added detail button)
- `apps/admin-frontend/src/App.tsx` (added routes)

## Summary

Phase 8.2 completes the supplier management UI with:

1. Detailed supplier performance view
2. Supplier comparison dashboard
3. Interactive rating system
4. Lead time history tracking
5. Performance indicators and insights

The UI integrates seamlessly with the backend APIs from Phase 8.1 and provides admins with comprehensive tools to evaluate and manage supplier performance.
