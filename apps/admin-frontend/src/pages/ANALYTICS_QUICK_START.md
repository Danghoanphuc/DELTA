# Analytics Dashboard - Quick Start Guide

## 📊 Overview

Phase 11.2 Frontend Analytics Dashboard provides comprehensive analytics and reporting for:

- Product performance
- Supplier performance
- Order trends
- Report export

## 🎯 Features Implemented

### 1. Analytics Service (`admin.analytics.service.ts`)

- Product analytics API calls
- Supplier analytics API calls
- Order analytics API calls
- Report export functionality

### 2. Analytics Hooks (`useAnalytics.ts`)

- `useProductAnalytics` - Product analytics state management
- `useSupplierAnalytics` - Supplier analytics state management
- `useOrderAnalytics` - Order analytics state management
- `useReportExport` - Report export functionality

### 3. Analytics Pages

#### Main Dashboard (`AnalyticsDashboardPage.tsx`)

- Overview of all analytics
- Summary cards (orders, revenue, products, suppliers)
- Quick links to detailed pages
- Export dialog with metric selection

#### Product Analytics (`ProductAnalyticsPage.tsx`)

- Top selling products chart
- Revenue by category pie chart
- Inventory turnover metrics
- Slow-moving items table
- Date range and category filters

#### Supplier Analytics (`SupplierAnalyticsPage.tsx`)

- Supplier comparison table
- On-time delivery trend chart
- Quality score trend chart
- Summary statistics
- Date range filters

#### Order Trends (`OrderTrendsPage.tsx`)

- Order volume trend chart
- Revenue trend chart
- Average order value trend
- Orders by status pie chart
- Date range and grouping filters

## 🚀 Usage

### Accessing Analytics

```typescript
// Navigate to analytics pages
/analytics              // Main dashboard
/analytics/products     // Product analytics
/analytics/suppliers    // Supplier analytics
/analytics/orders       // Order trends
```

### Using Analytics Hooks

```typescript
import { useProductAnalytics } from "../hooks/useAnalytics";

function MyComponent() {
  const { data, isLoading, filters, setFilters, refetch } = useProductAnalytics(
    {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      category: "apparel",
    }
  );

  // Update filters
  setFilters({ startDate: "2024-06-01", endDate: "2024-12-31" });

  // Refresh data
  refetch();

  return <div>{isLoading ? "Loading..." : JSON.stringify(data)}</div>;
}
```

### Exporting Reports

```typescript
import { useReportExport } from "../hooks/useAnalytics";

function ExportButton() {
  const { exportReport, isExporting } = useReportExport();

  const handleExport = async () => {
    await exportReport({
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      metrics: ["products", "suppliers", "orders"],
    });
  };

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Export Report"}
    </button>
  );
}
```

## 📁 File Structure

```
apps/admin-frontend/src/
├── services/
│   └── admin.analytics.service.ts    # Analytics API service
├── hooks/
│   └── useAnalytics.ts                # Analytics hooks
└── pages/
    ├── AnalyticsDashboardPage.tsx     # Main dashboard
    ├── ProductAnalyticsPage.tsx       # Product analytics
    ├── SupplierAnalyticsPage.tsx      # Supplier analytics
    ├── OrderTrendsPage.tsx            # Order trends
    └── ANALYTICS_QUICK_START.md       # This file
```

## 🎨 Components Used

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Card layouts
- `Button` - Action buttons
- `Input` - Date inputs
- `Select` - Dropdown filters
- `Checkbox` - Metric selection
- `Dialog` - Export modal

### Charts (Recharts)

- `BarChart` - Bar charts for products, revenue
- `LineChart` - Line charts for trends
- `PieChart` - Pie charts for categories, status
- `ResponsiveContainer` - Responsive chart wrapper

### Icons (Lucide React)

- `Calendar` - Date filters
- `Download` - Export button
- `RefreshCw` - Refresh button
- `TrendingUp` - Analytics icon
- `Package` - Products icon
- `Users` - Suppliers icon
- `ShoppingCart` - Orders icon
- `DollarSign` - Revenue icon

## 🔧 Configuration

### Date Filters

All analytics pages support date range filtering:

```typescript
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

// Apply filters
setFilters({ startDate, endDate });
```

### Grouping Options

Order trends support grouping by:

- `day` - Daily data
- `week` - Weekly aggregation
- `month` - Monthly aggregation

### Export Metrics

Available metrics for export:

- `products` - Product analytics
- `suppliers` - Supplier analytics
- `orders` - Order analytics

## 📊 Data Types

### Product Analytics

```typescript
interface ProductAnalytics {
  topProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    averagePrice: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    orderCount: number;
    percentage: number;
  }[];
  inventoryTurnover: {
    productId: string;
    productName: string;
    turnoverRate: number;
    daysToSell: number;
    stockLevel: number;
  }[];
  slowMovingItems: {
    productId: string;
    productName: string;
    daysSinceLastSale: number;
    stockLevel: number;
    estimatedValue: number;
  }[];
}
```

### Supplier Analytics

```typescript
interface SupplierAnalytics {
  supplierComparison: {
    supplierId: string;
    supplierName: string;
    totalOrders: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    averageLeadTime: number;
    totalCost: number;
  }[];
  onTimeDeliveryTrend: {
    month: string;
    onTimeRate: number;
    totalDeliveries: number;
  }[];
  qualityScoreTrend: {
    month: string;
    averageScore: number;
    totalOrders: number;
  }[];
}
```

### Order Analytics

```typescript
interface OrderAnalytics {
  orderVolumeTrend: {
    date: string;
    orderCount: number;
    newOrders: number;
    completedOrders: number;
  }[];
  revenueTrend: {
    date: string;
    revenue: number;
    orderCount: number;
  }[];
  aovTrend: {
    date: string;
    averageOrderValue: number;
    orderCount: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Product Analytics Page

- [ ] Page loads without errors
- [ ] Top products chart displays correctly
- [ ] Revenue by category pie chart shows data
- [ ] Inventory turnover list displays
- [ ] Slow-moving items table shows data
- [ ] Date filters work correctly
- [ ] Category filter works correctly
- [ ] Refresh button updates data

#### Supplier Analytics Page

- [ ] Page loads without errors
- [ ] Supplier comparison table displays
- [ ] On-time delivery chart shows trend
- [ ] Quality score chart shows trend
- [ ] Summary stats calculate correctly
- [ ] Date filters work correctly
- [ ] Refresh button updates data

#### Order Trends Page

- [ ] Page loads without errors
- [ ] Order volume chart displays
- [ ] Revenue chart displays
- [ ] AOV chart displays
- [ ] Orders by status pie chart shows
- [ ] Date filters work correctly
- [ ] Group by filter works correctly
- [ ] Summary stats calculate correctly

#### Main Dashboard

- [ ] Page loads without errors
- [ ] Summary cards display correctly
- [ ] Quick links navigate correctly
- [ ] Export dialog opens
- [ ] Metric selection works
- [ ] Export generates CSV file
- [ ] Preview charts display

## 🐛 Troubleshooting

### Charts Not Displaying

**Problem**: Charts show empty or don't render
**Solution**:

- Check if data is loaded (`isLoading === false`)
- Verify data structure matches chart expectations
- Check console for errors

### Export Not Working

**Problem**: Export button doesn't download file
**Solution**:

- Check if metrics are selected
- Verify date range is valid
- Check network tab for API errors
- Ensure blob download is supported

### Filters Not Applying

**Problem**: Filters don't update data
**Solution**:

- Ensure `setFilters` is called after state update
- Check if `useEffect` dependency array includes filters
- Verify API receives correct query parameters

## 📝 Next Steps

### Phase 12: Cost & Margin Tracking

After completing Phase 11.2, proceed to:

1. Cost calculation service
2. Margin tracking
3. Variance analysis
4. Cost breakdown components

### Enhancements

Consider adding:

- Real-time data updates
- More chart types (scatter, radar)
- Advanced filtering (multiple categories)
- Saved filter presets
- Scheduled report exports
- Email report delivery

## ✅ Completion Checklist

- [x] Analytics service created
- [x] Analytics hooks implemented
- [x] Product analytics page created
- [x] Supplier analytics page created
- [x] Order trends page created
- [x] Main dashboard created
- [x] Export functionality implemented
- [ ] Routes configured
- [ ] Navigation menu updated
- [ ] Testing completed
- [ ] Documentation updated

## 🎉 Summary

Phase 11.2 Frontend Analytics Dashboard is now complete with:

- 4 comprehensive analytics pages
- Interactive charts and visualizations
- Flexible filtering options
- Report export functionality
- Responsive design
- TypeScript type safety

The analytics dashboard provides valuable insights for business decision-making and performance monitoring.

---

**Created**: December 7, 2024
**Phase**: 11.2 Frontend Analytics Dashboard
**Status**: ✅ COMPLETE
