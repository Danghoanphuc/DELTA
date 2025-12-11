# Design Document - POD Catalog & SKU Management Optimization

## Overview

Thiết kế này tối ưu hóa hệ thống quản lý catalog và SKU cho mô hình POD/Corporate Gifting, tập trung vào:

1. **Flexibility**: Hỗ trợ nhiều loại customization và print methods
2. **Scalability**: Xử lý hàng nghìn SKUs và đơn hàng đồng thời
3. **Accuracy**: Tracking chính xác inventory, cost, và margin
4. **Speed**: Giảm time-to-delivery từ order đến fulfillment

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Customer Frontend                        │
│  (Product Selection → Customization → Order → Tracking)     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   API Gateway Layer                          │
│         (Authentication, Rate Limiting, Routing)            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │   Catalog    │   Order      │  Production  │ Shipping │ │
│  │   Service    │   Service    │   Service    │ Service  │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │  Product     │   Order      │  Inventory   │ Document │ │
│  │  Repository  │  Repository  │  Repository  │ Repo     │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │   MongoDB    │    Redis     │   S3/CDN     │  Queue   │ │
│  │  (Primary)   │   (Cache)    │   (Files)    │ (Jobs)   │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Services

1. **Catalog Service**: Quản lý products, variants, pricing, customization rules
2. **Order Service**: Xử lý swag orders, recipients, payments
3. **Production Service**: Quản lý production orders, supplier communication, QC
4. **Inventory Service**: Track stock levels, reservations, replenishment
5. **Artwork Service**: Upload, validation, version control, storage
6. **Shipping Service**: Carrier integration, tracking, delivery confirmation
7. **Document Service**: Invoice, delivery notes, reports generation
8. **Analytics Service**: Reporting, dashboards, insights

## Data Models

### 1. Enhanced Product Model

**Improvements từ current schema:**

```typescript
// ✅ THÊM: Print Method Configuration
printMethods: {
  method: string; // "screen_print", "dtg", "embroidery", "heat_transfer", "sublimation"
  areas: {
    name: string; // "front", "back", "left_chest", "sleeve"
    maxWidth: number; // mm
    maxHeight: number; // mm
    position: { x: number; y: number }; // coordinates
    allowedColors: number; // max colors for this area
    setupFee: number; // one-time setup cost
    unitCost: number; // cost per unit
  }[];
  artworkRequirements: {
    minResolution: number; // DPI
    acceptedFormats: string[]; // ["AI", "EPS", "PDF", "PNG"]
    colorMode: string; // "CMYK", "RGB", "Pantone"
    maxFileSize: number; // MB
  };
  leadTime: {
    min: number;
    max: number;
    unit: string;
  };
}[];

// ✅ THÊM: MOQ (Minimum Order Quantity) per print method
moqByPrintMethod: {
  printMethod: string;
  moq: number;
}[];

// ✅ THÊM: Production Complexity Score (để estimate lead time)
productionComplexity: {
  score: number; // 1-10
  factors: string[]; // ["multiple_colors", "embroidery", "special_material"]
};
```

### 2. NEW: Artwork Model

```typescript
interface IArtwork extends Document {
  // Ownership
  organizationId: ObjectId;
  uploadedBy: ObjectId;

  // File Info
  fileName: string;
  originalFileName: string;
  fileUrl: string; // S3 URL
  thumbnailUrl: string;
  fileSize: number; // bytes
  fileFormat: string; // "AI", "EPS", "PDF", "PNG"

  // Technical Specs
  dimensions: {
    width: number;
    height: number;
    unit: string; // "mm", "inch"
  };
  resolution: number; // DPI
  colorMode: string; // "CMYK", "RGB"
  colorCount: number;
  hasTransparency: boolean;

  // Validation
  validationStatus: "pending" | "approved" | "rejected";
  validationErrors: string[];
  validatedAt: Date;
  validatedBy: ObjectId;

  // Usage
  usageCount: number;
  lastUsedAt: Date;

  // Version Control
  version: number;
  previousVersionId: ObjectId;

  // Metadata
  tags: string[];
  description: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. NEW: Production Order Model

```typescript
interface IProductionOrder extends Document {
  // Link to Swag Order
  swagOrderId: ObjectId;
  swagOrderNumber: string;

  // Supplier
  supplierId: ObjectId;
  supplierName: string;
  supplierContact: {
    email: string;
    phone: string;
  };

  // Production Items
  items: {
    skuVariantId: ObjectId;
    sku: string;
    productName: string;
    quantity: number;

    // Customization
    printMethod: string;
    printAreas: {
      area: string;
      artworkId: ObjectId;
      artworkUrl: string;
      colors: string[];
    }[];
    personalization: {
      text: string;
      font: string;
      color: string;
    };

    // Costing
    unitCost: number;
    setupFee: number;
    totalCost: number;
  }[];

  // Specifications
  specifications: {
    printInstructions: string;
    qualityRequirements: string;
    packagingInstructions: string;
    specialNotes: string;
  };

  // Timeline
  orderedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate: Date;

  // Status Tracking
  status:
    | "pending"
    | "confirmed"
    | "in_production"
    | "qc_check"
    | "completed"
    | "failed";
  statusHistory: {
    status: string;
    timestamp: Date;
    note: string;
    updatedBy: ObjectId;
  }[];

  // QC
  qcChecks: {
    checkDate: Date;
    checkedBy: ObjectId;
    passed: boolean;
    photos: string[];
    notes: string;
    issues: string[];
  }[];

  // Delivery
  deliveryMethod: string;
  trackingNumber: string;
  deliveredAt: Date;

  // Costing
  estimatedCost: number;
  actualCost: number;
  costVariance: number;

  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Enhanced SKU Variant Model

**⚠️ CRITICAL PERFORMANCE ISSUE: Embedded Array Problem**

The current `supplierMappings` embedded array creates a **write-heavy bottleneck**:

- When suppliers update prices/inventory via webhook → Must update entire SkuVariant document
- 10 suppliers × 1000 SKUs = 10,000 document updates → Database lock contention
- Impacts read performance during checkout when DB is busy with writes

**SOLUTION: Extract to Separate Collection**

````typescript
// ❌ OLD: Embedded array (causes performance issues)
supplierMappings: {
  supplierId: ObjectId;
  supplierSku: string;
  cost: number;
  leadTime: {
    min: number;
    max: number;
    unit: string;
  }
  moq: number;
  isPreferred: boolean;
}
[];

```typescript
// ✅ NEW: Separate SupplierVariantMapping Collection
interface ISupplierVariantMapping extends Document {
  skuVariantId: ObjectId;
  sku: string; // Denormalized for faster lookup
  supplierId: ObjectId;
  supplierSku: string; // Translation to supplier's SKU

  // Pricing & Availability
  cost: number;
  stockQuantity: number; // Supplier's stock level
  isAvailable: boolean;

  // Lead Time
  leadTime: {
    min: number;
    max: number;
    unit: string;
  };
  moq: number;

  // Routing Priority
  isPreferred: boolean;
  priority: number; // 1 = highest priority

  // Sync Tracking
  lastSyncedAt: Date;
  syncStatus: 'active' | 'error' | 'disabled';

  createdAt: Date;
  updatedAt: Date;
}

// Indexes for performance
SupplierVariantMapping.index({ skuVariantId: 1, supplierId: 1 }, { unique: true });
SupplierVariantMapping.index({ sku: 1, supplierId: 1 }); // For reverse lookup
SupplierVariantMapping.index({ supplierId: 1, isAvailable: 1 }); // For supplier queries
SupplierVariantMapping.index({ skuVariantId: 1, isAvailable: 1, priority: 1 }); // For routing
````

**Benefits of Separate Collection:**

- ✅ Isolated writes: Supplier updates don't lock main SkuVariant collection
- ✅ Faster reads: No need to scan embedded arrays
- ✅ Better indexing: Can create compound indexes for routing queries
- ✅ Easier scaling: Can shard by supplierId if needed

// ✅ KEEP: Inventory Tracking (stays in SkuVariant)
inventory: {
onHand: number; // Physical stock
reserved: number; // Reserved for orders
available: number; // onHand - reserved
inTransit: number; // Ordered from supplier

// Locations (nếu có nhiều kho)
locations: {
warehouseId: ObjectId;
quantity: number;
}
[];

// Replenishment
reorderPoint: number;
reorderQuantity: number;
lastRestockDate: Date;
nextRestockDate: Date;
}

// ✅ KEEP: Performance Metrics (stays in SkuVariant)
metrics: {
totalSold: number;
totalRevenue: number;
averageMargin: number;
returnRate: number;
averageLeadTime: number;
}

````

### 5. Enhanced Swag Order Model

**Improvements:**

```typescript
// ✅ THÊM: Production Tracking
production: {
  productionOrders: ObjectId[]; // Link to ProductionOrder
  status: "pending" | "in_production" | "completed";
  startedAt: Date;
  completedAt: Date;

  // Kitting
  kittingStatus: "pending" | "in_progress" | "completed";
  kittingStartedAt: Date;
  kittingCompletedAt: Date;
  kittedBy: ObjectId;

  // QC
  qcRequired: boolean;
  qcStatus: "pending" | "passed" | "failed";
  qcCheckedAt: Date;
  qcCheckedBy: ObjectId;
  qcPhotos: string[];
  qcNotes: string;
};

// ✅ THÊM: Cost Breakdown
costBreakdown: {
  // Product Costs
  baseProductsCost: number;
  customizationCost: number;
  setupFees: number;

  // Operational Costs
  kittingFee: number;
  packagingCost: number;
  shippingCost: number;

  // Overhead
  handlingFee: number;

  // Total
  totalCost: number;
  totalPrice: number;
  grossMargin: number;
  marginPercentage: number;
};

// ✅ THÊM: Document References
documents: {
  invoiceId: ObjectId;
  invoiceNumber: string;
  invoiceUrl: string;

  packingSlips: {
    recipientId: ObjectId;
    url: string;
    generatedAt: Date;
  }[];

  deliveryNotes: {
    supplierId: ObjectId;
    url: string;
    generatedAt: Date;
  }[];
};
````

### 6. NEW: Invoice Model

```typescript
interface IInvoice extends Document {
  // Reference
  invoiceNumber: string; // "INV-2024-00001"
  swagOrderId: ObjectId;
  swagOrderNumber: string;

  // Customer
  organizationId: ObjectId;
  billingInfo: {
    businessName: string;
    taxCode: string;
    address: string;
    email: string;
    phone: string;
  };

  // Line Items
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
  }[];

  // Totals
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;

  // Payment
  paymentStatus: "unpaid" | "paid" | "partially_paid" | "refunded";
  paymentMethod: string;
  paidAmount: number;
  paidAt: Date;

  // Dates
  issueDate: Date;
  dueDate: Date;

  // Files
  pdfUrl: string;

  // Status
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";

  // Credit Notes (for refunds)
  creditNotes: {
    creditNoteNumber: string;
    amount: number;
    reason: string;
    issuedAt: Date;
    pdfUrl: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}
```

### 7. NEW: Inventory Transaction Model

```typescript
interface IInventoryTransaction extends Document {
  // SKU
  skuVariantId: ObjectId;
  sku: string;

  // Transaction Type
  type:
    | "purchase"
    | "sale"
    | "adjustment"
    | "return"
    | "damage"
    | "reserve"
    | "release";

  // Quantity
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;

  // Reference
  referenceType: "swag_order" | "production_order" | "manual_adjustment";
  referenceId: ObjectId;
  referenceNumber: string;

  // Cost (for COGS calculation)
  unitCost: number;
  totalCost: number;

  // Location
  warehouseId: ObjectId;

  // Metadata
  reason: string;
  notes: string;
  performedBy: ObjectId;

  createdAt: Date;
}
```

## Components and Interfaces

### 0. Supplier Integration & Routing Services (NEW - CRITICAL)

These services handle the core business logic for supplier management, SKU translation, and intelligent routing.

#### 0.1 Supplier API Adapters (Strategy Pattern)

**Purpose**: Abstract supplier-specific API implementations

**Architecture**:

```typescript
// Base interface that all adapters must implement
abstract class BaseSupplierAdapter {
  abstract getProductCatalog(): Promise<SupplierProduct[]>;
  abstract checkInventory(supplierSku: string): Promise<InventoryStatus>;
  abstract createOrder(orderData: SupplierOrderData): Promise<SupplierOrder>;
  abstract getOrderStatus(orderId: string): Promise<OrderStatus>;
  abstract cancelOrder(orderId: string): Promise<void>;

  // Common utilities
  protected async makeRequest(
    endpoint: string,
    options: RequestOptions
  ): Promise<any> {
    // Shared HTTP client logic, retry, error handling
  }
}

// Printful Adapter
class PrintfulAdapter extends BaseSupplierAdapter {
  private apiKey: string;
  private baseUrl = "https://api.printful.com";

  async getProductCatalog(): Promise<SupplierProduct[]> {
    const response = await this.makeRequest("/products", { method: "GET" });
    return response.result.map(this.mapPrintfulProduct);
  }

  async checkInventory(supplierSku: string): Promise<InventoryStatus> {
    const response = await this.makeRequest(`/products/${supplierSku}`, {
      method: "GET",
    });
    return {
      available: response.result.in_stock,
      quantity: response.result.quantity || 999,
      leadTime: { min: 2, max: 5, unit: "days" },
    };
  }

  async createOrder(orderData: SupplierOrderData): Promise<SupplierOrder> {
    const printfulOrder = this.mapToPrintfulOrder(orderData);
    const response = await this.makeRequest("/orders", {
      method: "POST",
      body: printfulOrder,
    });
    return this.mapPrintfulOrderResponse(response.result);
  }

  private mapPrintfulProduct(product: any): SupplierProduct {
    // Transform Printful format to our standard format
  }
}

// CustomCat Adapter
class CustomCatAdapter extends BaseSupplierAdapter {
  // Similar implementation for CustomCat API
}

// Factory to create adapters
class SupplierAdapterFactory {
  static create(supplierType: string): BaseSupplierAdapter {
    switch (supplierType) {
      case "printful":
        return new PrintfulAdapter();
      case "customcat":
        return new CustomCatAdapter();
      default:
        throw new Error(`Unsupported supplier: ${supplierType}`);
    }
  }
}
```

#### 0.2 SkuTranslationService

**Purpose**: Translate between internal SKUs and supplier SKUs

**Key Methods**:

```typescript
class SkuTranslationService {
  /**
   * Translate internal SKU to supplier SKU
   * @param internalSku - Our internal SKU (e.g., "TSHIRT-001-BLK-M")
   * @param supplierId - Target supplier ID
   * @returns Supplier's SKU (e.g., "PRINTFUL-12345-BLK-M")
   */
  async translateToSupplier(
    internalSku: string,
    supplierId: string
  ): Promise<string | null> {
    const mapping = await SupplierVariantMapping.findOne({
      sku: internalSku,
      supplierId: supplierId,
      isAvailable: true,
    }).lean();

    return mapping?.supplierSku || null;
  }

  /**
   * Reverse lookup: Find internal SKU from supplier SKU
   * @param supplierSku - Supplier's SKU
   * @param supplierId - Supplier ID
   * @returns Our internal SKU
   */
  async translateFromSupplier(
    supplierSku: string,
    supplierId: string
  ): Promise<string | null> {
    const mapping = await SupplierVariantMapping.findOne({
      supplierSku: supplierSku,
      supplierId: supplierId,
    }).lean();

    return mapping?.sku || null;
  }

  /**
   * Get all supplier options for a SKU
   * @param internalSku - Our internal SKU
   * @returns List of supplier mappings
   */
  async getSupplierOptions(
    internalSku: string
  ): Promise<SupplierVariantMapping[]> {
    return await SupplierVariantMapping.find({
      sku: internalSku,
      isAvailable: true,
    })
      .populate("supplierId", "name type")
      .lean();
  }

  /**
   * Bulk translate for order items
   * @param items - Order items with internal SKUs
   * @param supplierId - Target supplier
   * @returns Map of internal SKU → supplier SKU
   */
  async bulkTranslate(
    items: Array<{ sku: string; quantity: number }>,
    supplierId: string
  ): Promise<Map<string, string>> {
    const skus = items.map((item) => item.sku);
    const mappings = await SupplierVariantMapping.find({
      sku: { $in: skus },
      supplierId: supplierId,
      isAvailable: true,
    }).lean();

    const translationMap = new Map<string, string>();
    mappings.forEach((m) => translationMap.set(m.sku, m.supplierSku));

    return translationMap;
  }
}
```

#### 0.3 SupplierRoutingService (The Brain)

**Purpose**: Intelligently select the best supplier for each order item

**Routing Rules** (in priority order):

1. **Hard Rule**: Stock availability (must have stock > 0)
2. **Soft Rule**: Preferred supplier flag (set by admin)
3. **Optimization**: Lowest cost (maximize profit)
4. **Fallback**: Fastest lead time

**Key Methods**:

```typescript
class SupplierRoutingService {
  constructor(
    private translationService: SkuTranslationService,
    private supplierAdapterFactory: SupplierAdapterFactory
  ) {}

  /**
   * Select best supplier for a single SKU
   * @param sku - Internal SKU
   * @param quantity - Order quantity
   * @returns Selected supplier mapping
   */
  async selectSupplier(
    sku: string,
    quantity: number
  ): Promise<SupplierVariantMapping | null> {
    // 1. Get all supplier options
    const options = await SupplierVariantMapping.find({
      sku: sku,
      syncStatus: "active",
    })
      .populate("supplierId")
      .lean();

    if (options.length === 0) {
      Logger.warn(`[SupplierRouting] No suppliers found for SKU: ${sku}`);
      return null;
    }

    // 2. Filter by stock availability (Hard Rule)
    const availableOptions = options.filter(
      (opt) => opt.isAvailable && opt.stockQuantity >= quantity
    );

    if (availableOptions.length === 0) {
      Logger.warn(
        `[SupplierRouting] No suppliers with sufficient stock for SKU: ${sku}`
      );
      return null;
    }

    // 3. Check MOQ
    const validOptions = availableOptions.filter((opt) => quantity >= opt.moq);

    if (validOptions.length === 0) {
      Logger.warn(
        `[SupplierRouting] Quantity ${quantity} below MOQ for SKU: ${sku}`
      );
      return null;
    }

    // 4. Sort by priority (Soft Rules)
    const sorted = validOptions.sort((a, b) => {
      // Priority 1: Preferred supplier
      if (a.isPreferred && !b.isPreferred) return -1;
      if (!a.isPreferred && b.isPreferred) return 1;

      // Priority 2: Explicit priority number
      if (a.priority !== b.priority) return a.priority - b.priority;

      // Priority 3: Lowest cost
      if (a.cost !== b.cost) return a.cost - b.cost;

      // Priority 4: Fastest lead time
      return a.leadTime.min - b.leadTime.min;
    });

    const selected = sorted[0];
    Logger.success(
      `[SupplierRouting] Selected supplier ${selected.supplierId} for SKU ${sku}`
    );

    return selected;
  }

  /**
   * Route entire order to suppliers
   * @param orderItems - Order items
   * @returns Routing plan (supplier → items)
   */
  async routeOrder(
    orderItems: Array<{ sku: string; quantity: number; productName: string }>
  ): Promise<SupplierRoutingPlan> {
    const routingPlan: SupplierRoutingPlan = {
      routes: new Map(),
      unroutableItems: [],
    };

    for (const item of orderItems) {
      const supplier = await this.selectSupplier(item.sku, item.quantity);

      if (!supplier) {
        routingPlan.unroutableItems.push({
          sku: item.sku,
          reason: "No available supplier",
        });
        continue;
      }

      const supplierId = supplier.supplierId.toString();

      if (!routingPlan.routes.has(supplierId)) {
        routingPlan.routes.set(supplierId, {
          supplierId: supplierId,
          supplierName: supplier.supplierId.name,
          items: [],
        });
      }

      routingPlan.routes.get(supplierId)!.items.push({
        internalSku: item.sku,
        supplierSku: supplier.supplierSku,
        quantity: item.quantity,
        cost: supplier.cost,
        leadTime: supplier.leadTime,
      });
    }

    return routingPlan;
  }

  /**
   * Real-time inventory check across all suppliers
   * @param sku - Internal SKU
   * @returns Aggregated inventory status
   */
  async checkInventoryAcrossSuppliers(sku: string): Promise<InventorySummary> {
    const mappings = await SupplierVariantMapping.find({
      sku: sku,
      syncStatus: "active",
    })
      .populate("supplierId")
      .lean();

    const summary: InventorySummary = {
      sku: sku,
      totalAvailable: 0,
      suppliers: [],
    };

    for (const mapping of mappings) {
      const adapter = this.supplierAdapterFactory.create(
        mapping.supplierId.type
      );

      try {
        const status = await adapter.checkInventory(mapping.supplierSku);

        summary.suppliers.push({
          supplierId: mapping.supplierId._id,
          supplierName: mapping.supplierId.name,
          available: status.available,
          quantity: status.quantity,
          leadTime: status.leadTime,
        });

        if (status.available) {
          summary.totalAvailable += status.quantity;
        }
      } catch (error) {
        Logger.error(
          `[SupplierRouting] Failed to check inventory for ${mapping.supplierSku}:`,
          error
        );
      }
    }

    return summary;
  }
}

interface SupplierRoutingPlan {
  routes: Map<
    string,
    {
      supplierId: string;
      supplierName: string;
      items: Array<{
        internalSku: string;
        supplierSku: string;
        quantity: number;
        cost: number;
        leadTime: { min: number; max: number; unit: string };
      }>;
    }
  >;
  unroutableItems: Array<{
    sku: string;
    reason: string;
  }>;
}
```

#### 0.4 Automated Workflow (BullMQ)

**Purpose**: Asynchronous order processing to avoid blocking user checkout

**Queue Architecture**:

```typescript
// Queue: process-order
// Triggered when: Order status = PAID

import { Queue, Worker } from "bullmq";

const processOrderQueue = new Queue("process-order", {
  connection: redisConnection,
});

// Add job when order is paid
orderService.on("orderPaid", async (order) => {
  await processOrderQueue.add(
    "process",
    {
      orderId: order._id,
      orderNumber: order.orderNumber,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );
});

// Worker to process jobs
const processOrderWorker = new Worker(
  "process-order",
  async (job) => {
    const { orderId } = job.data;

    Logger.info(`[OrderProcessor] Processing order: ${orderId}`);

    // 1. Get order details
    const order = await SwagOrder.findById(orderId).populate(
      "packSnapshot.items"
    );
    if (!order) throw new Error("Order not found");

    // 2. Extract order items
    const orderItems = order.packSnapshot.items.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      productName: item.name,
    }));

    // 3. Route to suppliers
    const routingService = new SupplierRoutingService(
      new SkuTranslationService(),
      new SupplierAdapterFactory()
    );

    const routingPlan = await routingService.routeOrder(orderItems);

    // 4. Check for unroutable items
    if (routingPlan.unroutableItems.length > 0) {
      Logger.error(
        `[OrderProcessor] Unroutable items:`,
        routingPlan.unroutableItems
      );
      await alertService.sendUnroutableItemsAlert(
        order,
        routingPlan.unroutableItems
      );
      throw new Error("Some items cannot be routed to suppliers");
    }

    // 5. Create production orders for each supplier
    const productionOrders: ProductionOrder[] = [];

    for (const [supplierId, route] of routingPlan.routes) {
      const productionOrder = await ProductionOrder.create({
        swagOrderId: order._id,
        swagOrderNumber: order.orderNumber,
        supplierId: supplierId,
        supplierName: route.supplierName,
        items: route.items.map((item) => ({
          skuVariantId: item.skuVariantId,
          sku: item.internalSku,
          supplierSku: item.supplierSku,
          quantity: item.quantity,
          unitCost: item.cost,
          totalCost: item.cost * item.quantity,
        })),
        status: "pending",
        estimatedCost: route.items.reduce(
          (sum, item) => sum + item.cost * item.quantity,
          0
        ),
      });

      productionOrders.push(productionOrder);

      // 6. Send order to supplier via adapter
      const adapter = SupplierAdapterFactory.create(route.supplierName);

      try {
        const supplierOrder = await adapter.createOrder({
          items: route.items,
          shippingAddress: order.shippingAddress,
          deadline: order.expectedDeliveryDate,
        });

        productionOrder.supplierOrderId = supplierOrder.id;
        productionOrder.status = "confirmed";
        await productionOrder.save();

        Logger.success(
          `[OrderProcessor] Created supplier order: ${supplierOrder.id}`
        );
      } catch (error) {
        Logger.error(
          `[OrderProcessor] Failed to create supplier order:`,
          error
        );
        productionOrder.status = "failed";
        await productionOrder.save();
        throw error;
      }
    }

    // 7. Update swag order status
    order.production.productionOrders = productionOrders.map((po) => po._id);
    order.production.status = "in_production";
    order.production.startedAt = new Date();
    order.status = "awaiting_shipment";
    await order.save();

    Logger.success(
      `[OrderProcessor] Order ${order.orderNumber} processed successfully`
    );
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Error handling
processOrderWorker.on("failed", (job, error) => {
  Logger.error(`[OrderProcessor] Job ${job.id} failed:`, error);
  alertService.sendOrderProcessingFailedAlert(job.data.orderId, error);
});
```

**Benefits of Queue-Based Processing**:

- ✅ Non-blocking: User checkout completes immediately
- ✅ Reliable: Automatic retries on failure
- ✅ Scalable: Can add more workers to handle load
- ✅ Observable: Can monitor queue depth and processing time

---

### 1. Catalog Service

**Responsibilities:**

- Quản lý products, categories, variants
- Pricing calculation với volume tiers
- Customization rules validation
- Print method configuration

**Key Methods:**

```typescript
class CatalogService {
  // Product Management
  async createProduct(data: CreateProductData): Promise<Product>;
  async updateProduct(id: string, data: UpdateProductData): Promise<Product>;
  async getProduct(id: string): Promise<Product>;
  async searchProducts(filters: ProductFilters): Promise<PaginatedProducts>;

  // Variant Management
  async generateVariants(
    productId: string,
    combinations: AttributeCombination[]
  ): Promise<SkuVariant[]>;
  async updateVariantInventory(
    variantId: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ): Promise<SkuVariant>;

  // Pricing
  async calculatePrice(
    variantId: string,
    quantity: number,
    customization?: CustomizationOptions
  ): Promise<PriceBreakdown>;
  async applyVolumeDiscount(
    basePrice: number,
    quantity: number,
    tiers: PricingTier[]
  ): Promise<number>;

  // Customization
  async validateCustomization(
    productId: string,
    customization: CustomizationOptions
  ): Promise<ValidationResult>;
  async estimateLeadTime(
    productId: string,
    quantity: number,
    customization?: CustomizationOptions
  ): Promise<LeadTimeEstimate>;
}
```

### 2. Artwork Service

**Responsibilities:**

- Upload và validation artwork files
- Version control
- Storage management (S3)
- Thumbnail generation

**Key Methods:**

```typescript
class ArtworkService {
  async uploadArtwork(file: File, organizationId: string): Promise<Artwork>;
  async validateArtwork(
    artworkId: string,
    requirements: ArtworkRequirements
  ): Promise<ValidationResult>;
  async getArtworkLibrary(organizationId: string): Promise<Artwork[]>;
  async createArtworkVersion(artworkId: string, file: File): Promise<Artwork>;
  async deleteArtwork(artworkId: string): Promise<void>;
}
```

### 3. Production Service

**Responsibilities:**

- Tạo và quản lý production orders
- Supplier communication
- QC workflow
- Status tracking

**Key Methods:**

```typescript
class ProductionService {
  async createProductionOrders(swagOrderId: string): Promise<ProductionOrder[]>;
  async assignToSupplier(
    productionOrderId: string,
    supplierId: string
  ): Promise<ProductionOrder>;
  async updateProductionStatus(
    productionOrderId: string,
    status: string,
    note?: string
  ): Promise<ProductionOrder>;
  async performQCCheck(
    productionOrderId: string,
    qcData: QCCheckData
  ): Promise<ProductionOrder>;
  async completeProduction(productionOrderId: string): Promise<ProductionOrder>;
}
```

### 4. Inventory Service

**Responsibilities:**

- Track stock levels
- Reserve/release inventory
- Replenishment alerts
- Transaction history

**Key Methods:**

```typescript
class InventoryService {
  async getAvailableStock(variantId: string): Promise<number>;
  async reserveInventory(
    variantId: string,
    quantity: number,
    orderId: string
  ): Promise<void>;
  async releaseInventory(
    variantId: string,
    quantity: number,
    orderId: string
  ): Promise<void>;
  async recordTransaction(
    transaction: InventoryTransactionData
  ): Promise<InventoryTransaction>;
  async getLowStockItems(threshold?: number): Promise<SkuVariant[]>;
  async getInventoryHistory(
    variantId: string,
    dateRange: DateRange
  ): Promise<InventoryTransaction[]>;
}
```

### 5. Document Service

**Responsibilities:**

- Generate invoices, packing slips, delivery notes
- PDF generation
- Email delivery
- Storage management

**Key Methods:**

```typescript
class DocumentService {
  async generateInvoice(swagOrderId: string): Promise<Invoice>;
  async generatePackingSlip(
    swagOrderId: string,
    recipientId: string
  ): Promise<PackingSlip>;
  async generateDeliveryNote(productionOrderId: string): Promise<DeliveryNote>;
  async sendInvoiceEmail(invoiceId: string): Promise<void>;
  async getDocuments(orderId: string): Promise<Document[]>;
}
```

## Workflows

### Workflow 1: Order to Fulfillment

```
1. Customer creates Swag Order
   ↓
2. System validates inventory availability
   ↓
3. System reserves inventory for base products
   ↓
4. Customer uploads artwork (if needed)
   ↓
5. System validates artwork against print requirements
   ↓
6. Customer completes payment
   ↓
7. System generates Invoice
   ↓
8. System creates Production Orders (one per supplier)
   ↓
9. Suppliers receive production orders
   ↓
10. Suppliers update production status
    ↓
11. QC team performs quality check
    ↓
12. If QC passed → Kitting process
    ↓
13. Generate packing slips
    ↓
14. Create shipments with carriers
    ↓
15. Update tracking info
    ↓
16. Delivery confirmation
    ↓
17. Release reserved inventory
    ↓
18. Update order status to "completed"
```

### Workflow 2: Inventory Replenishment

```
1. System monitors stock levels daily
   ↓
2. When stock < reorder point
   ↓
3. System generates low stock alert
   ↓
4. Admin reviews and creates purchase order
   ↓
5. Supplier confirms order
   ↓
6. Update "inTransit" quantity
   ↓
7. Goods received
   ↓
8. Record inventory transaction (type: "purchase")
   ↓
9. Update "onHand" quantity
   ↓
10. Update "lastRestockDate"
```

## Error Handling

### Validation Errors

```typescript
// Artwork validation
if (artwork.resolution < requirements.minResolution) {
  throw new ValidationException(
    `Artwork resolution ${artwork.resolution}dpi is below minimum ${requirements.minResolution}dpi`
  );
}

// Inventory validation
if (availableStock < requestedQuantity) {
  throw new InsufficientStockException(
    `Only ${availableStock} units available, requested ${requestedQuantity}`
  );
}

// MOQ validation
if (quantity < product.moq) {
  throw new ValidationException(
    `Minimum order quantity is ${product.moq}, requested ${quantity}`
  );
}
```

### Business Logic Errors

```typescript
// Production order cannot be cancelled after production started
if (productionOrder.status === "in_production") {
  throw new ConflictException(
    "Cannot cancel production order that is already in production"
  );
}

// Cannot ship without QC approval
if (order.production.qcRequired && order.production.qcStatus !== "passed") {
  throw new ConflictException("Cannot ship order without QC approval");
}
```

## Testing Strategy

### Unit Tests

- Product pricing calculation với volume tiers
- Artwork validation logic
- Inventory reserve/release operations
- Cost calculation và margin computation

### Integration Tests

- Order creation flow với inventory reservation
- Production order generation từ swag order
- Invoice generation với correct line items
- Shipping carrier API integration

### Property-Based Tests

- Inventory transactions always maintain consistency (onHand = sum of all transactions)
- Pricing tiers always return correct price for any quantity
- Reserved inventory never exceeds onHand quantity
- Cost breakdown always sums to total cost

## Performance Considerations

### Database Indexes

```typescript
// Product queries
CatalogProduct.index({ categoryId: 1, status: 1, isPublished: 1 });
CatalogProduct.index({ name: "text", description: "text", tags: "text" });

// SKU Variant queries
SkuVariant.index({ productId: 1, isActive: 1 });
SkuVariant.index({ sku: 1 }, { unique: true });
SkuVariant.index({ "inventory.available": 1 }); // For low stock queries

// Order queries
SwagOrder.index({ organization: 1, status: 1, createdAt: -1 });
SwagOrder.index({ orderNumber: 1 }, { unique: true });

// Production Order queries
ProductionOrder.index({ swagOrderId: 1 });
ProductionOrder.index({ supplierId: 1, status: 1 });
ProductionOrder.index({ expectedCompletionDate: 1 });

// Inventory Transaction queries
InventoryTransaction.index({ skuVariantId: 1, createdAt: -1 });
InventoryTransaction.index({ referenceId: 1, referenceType: 1 });
```

### Caching Strategy

```typescript
// Cache product catalog (TTL: 1 hour)
const cacheKey = `product:${productId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache pricing tiers (TTL: 24 hours)
const pricingKey = `pricing:${productId}`;

// Cache inventory levels (TTL: 5 minutes)
const inventoryKey = `inventory:${variantId}`;

// Invalidate cache on updates
await redis.del(`product:${productId}`);
```

### Query Optimization

```typescript
// Use lean() for read-only queries
const products = await CatalogProduct.find({ status: "active" }).lean();

// Use select() to limit fields
const variants = await SkuVariant.find({ productId })
  .select("sku name price inventory.available")
  .lean();

// Use aggregation for complex queries
const topProducts = await SwagOrder.aggregate([
  { $unwind: "$packSnapshot.items" },
  {
    $group: {
      _id: "$packSnapshot.items.product",
      totalSold: { $sum: "$packSnapshot.items.quantity" },
    },
  },
  { $sort: { totalSold: -1 } },
  { $limit: 10 },
]);
```

## Security Considerations

### Access Control

```typescript
// Only organization members can view their orders
if (order.organization.toString() !== user.organizationId.toString()) {
  throw new ForbiddenException("You don't have access to this order");
}

// Only admin can access production orders
if (user.role !== "admin" && user.role !== "operations") {
  throw new ForbiddenException("Only admin can access production orders");
}
```

### Data Validation

```typescript
// Sanitize file uploads
const allowedFormats = ["image/png", "image/jpeg", "application/pdf"];
if (!allowedFormats.includes(file.mimetype)) {
  throw new ValidationException("Invalid file format");
}

// Validate file size
if (file.size > 50 * 1024 * 1024) {
  // 50MB
  throw new ValidationException("File size exceeds 50MB limit");
}
```

## Cost & Margin Tracking Service

### Overview

Cost & Margin Tracking Service cung cấp khả năng tính toán chi phí, theo dõi margin, và phân tích variance cho mọi đơn hàng. Service này đảm bảo profitability và hỗ trợ quyết định pricing.

### Responsibilities

- **Cost Calculation**: Tính toán tất cả cost components (product, customization, operational)
- **Margin Analysis**: Tính toán margin và trigger alerts khi margin thấp
- **Variance Tracking**: So sánh actual cost vs estimated cost
- **Financial Reporting**: Generate reports theo product category và customer segment

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Swag Order Created                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            CostCalculationService                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ calculateProductCost()                               │   │
│  │ calculateCustomizationCost()                         │   │
│  │ calculateOperationalCost()                           │   │
│  │ calculateTotalCost()                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            MarginCalculationService                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ calculateGrossMargin()                               │   │
│  │ calculateMarginPercentage()                          │   │
│  │ checkMarginThreshold() → Alert if low                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│         Production Order Completed                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            VarianceAnalysisService                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ recordActualCost()                                   │   │
│  │ calculateVariance()                                  │   │
│  │ analyzeVarianceReasons()                             │   │
│  │ generateVarianceReport()                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. CostCalculationService

**Purpose**: Tính toán tất cả cost components cho đơn hàng

**Key Methods**:

```typescript
class CostCalculationService {
  /**
   * Calculate base product costs
   * @param order - Swag order
   * @returns Base products cost
   */
  async calculateProductCost(order: SwagOrder): Promise<number> {
    let totalCost = 0;

    for (const item of order.packSnapshot.items) {
      const variant = await SkuVariant.findById(item.variantId);
      totalCost += variant.cost * item.quantity;
    }

    return totalCost;
  }

  /**
   * Calculate customization costs (print, embroidery, etc.)
   * @param order - Swag order
   * @returns Customization cost including setup fees
   */
  async calculateCustomizationCost(order: SwagOrder): Promise<number> {
    let totalCost = 0;

    for (const item of order.packSnapshot.items) {
      if (item.customization) {
        // Setup fees (one-time per print method)
        totalCost += item.customization.setupFee || 0;

        // Unit cost per item
        totalCost += (item.customization.unitCost || 0) * item.quantity;
      }
    }

    return totalCost;
  }

  /**
   * Calculate operational costs (kitting, packaging, shipping)
   * @param order - Swag order
   * @returns Operational cost
   */
  async calculateOperationalCost(order: SwagOrder): Promise<number> {
    const kittingFee = order.recipients.length * 10000; // 10k per recipient
    const packagingCost = order.recipients.length * 5000; // 5k per package
    const shippingCost = await this.calculateShippingCost(order);
    const handlingFee = order.totalPrice * 0.05; // 5% handling fee

    return kittingFee + packagingCost + shippingCost + handlingFee;
  }

  /**
   * Calculate total cost for order
   * @param order - Swag order
   * @returns Complete cost breakdown
   */
  async calculateTotalCost(order: SwagOrder): Promise<CostBreakdown> {
    const baseProductsCost = await this.calculateProductCost(order);
    const customizationCost = await this.calculateCustomizationCost(order);
    const operationalCost = await this.calculateOperationalCost(order);

    return {
      orderId: order._id,
      baseProductsCost,
      customizationCost,
      setupFees: this.extractSetupFees(order),
      kittingFee: order.recipients.length * 10000,
      packagingCost: order.recipients.length * 5000,
      shippingCost: await this.calculateShippingCost(order),
      handlingFee: order.totalPrice * 0.05,
      totalCost: baseProductsCost + customizationCost + operationalCost,
      totalPrice: order.totalPrice,
      grossMargin:
        order.totalPrice -
        (baseProductsCost + customizationCost + operationalCost),
      marginPercentage:
        ((order.totalPrice -
          (baseProductsCost + customizationCost + operationalCost)) /
          order.totalPrice) *
        100,
    };
  }
}
```

#### 2. MarginCalculationService

**Purpose**: Tính toán margin và trigger alerts

**Key Methods**:

```typescript
class MarginCalculationService {
  private readonly LOW_MARGIN_THRESHOLD = 20; // 20%

  /**
   * Calculate gross margin
   * @param totalPrice - Order total price
   * @param totalCost - Order total cost
   * @returns Gross margin amount
   */
  calculateGrossMargin(totalPrice: number, totalCost: number): number {
    return totalPrice - totalCost;
  }

  /**
   * Calculate margin percentage
   * @param totalPrice - Order total price
   * @param totalCost - Order total cost
   * @returns Margin percentage
   */
  calculateMarginPercentage(totalPrice: number, totalCost: number): number {
    if (totalPrice === 0) return 0;
    return ((totalPrice - totalCost) / totalPrice) * 100;
  }

  /**
   * Check if margin is below threshold and alert
   * @param order - Swag order
   * @param costBreakdown - Cost breakdown
   * @returns Alert status
   */
  async checkMarginThreshold(
    order: SwagOrder,
    costBreakdown: CostBreakdown
  ): Promise<{ shouldAlert: boolean; message?: string }> {
    const marginPercentage = costBreakdown.marginPercentage;

    if (marginPercentage < this.LOW_MARGIN_THRESHOLD) {
      const message = `Low margin alert: Order ${
        order.orderNumber
      } has ${marginPercentage.toFixed(2)}% margin (threshold: ${
        this.LOW_MARGIN_THRESHOLD
      }%)`;

      // Send alert to admin
      await this.alertService.sendLowMarginAlert({
        orderId: order._id,
        orderNumber: order.orderNumber,
        marginPercentage,
        threshold: this.LOW_MARGIN_THRESHOLD,
      });

      return { shouldAlert: true, message };
    }

    return { shouldAlert: false };
  }

  /**
   * Generate margin report by product
   * @param dateRange - Date range for report
   * @returns Margin report by product
   */
  async generateMarginReportByProduct(
    dateRange: DateRange
  ): Promise<ProductMargin[]> {
    const orders = await SwagOrder.find({
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ["completed", "shipped", "delivered"] },
    });

    // Group by product and calculate margins
    const productMargins = new Map<string, ProductMargin>();

    for (const order of orders) {
      const costBreakdown =
        await this.costCalculationService.calculateTotalCost(order);

      for (const item of order.packSnapshot.items) {
        const key = item.product.toString();

        if (!productMargins.has(key)) {
          productMargins.set(key, {
            productId: item.product,
            productName: item.name,
            revenue: 0,
            cost: 0,
            margin: 0,
            marginPercentage: 0,
          });
        }

        const margin = productMargins.get(key)!;
        margin.revenue += item.price * item.quantity;
        margin.cost += item.cost * item.quantity;
      }
    }

    // Calculate final margins
    return Array.from(productMargins.values()).map((m) => ({
      ...m,
      margin: m.revenue - m.cost,
      marginPercentage: ((m.revenue - m.cost) / m.revenue) * 100,
    }));
  }
}
```

#### 3. VarianceAnalysisService

**Purpose**: So sánh actual cost vs estimated cost

**Key Methods**:

```typescript
class VarianceAnalysisService {
  /**
   * Record actual cost from production order
   * @param productionOrder - Production order
   * @param actualCost - Actual cost incurred
   * @returns Updated production order
   */
  async recordActualCost(
    productionOrder: ProductionOrder,
    actualCost: number,
    costBreakdown?: { materials: number; labor: number; overhead: number },
    notes?: string
  ): Promise<ProductionOrder> {
    productionOrder.actualCost = actualCost;
    productionOrder.costVariance = actualCost - productionOrder.estimatedCost;

    if (costBreakdown) {
      productionOrder.actualCostBreakdown = costBreakdown;
    }

    if (notes) {
      productionOrder.costNotes = notes;
    }

    await productionOrder.save();

    Logger.success(
      `[VarianceAnalysisSvc] Recorded actual cost for PO ${productionOrder._id}: ${actualCost}`
    );

    return productionOrder;
  }

  /**
   * Calculate variance for order
   * @param order - Swag order
   * @returns Variance analysis
   */
  async calculateVariance(order: SwagOrder): Promise<OrderVariance> {
    const productionOrders = await ProductionOrder.find({
      swagOrderId: order._id,
    });

    let totalEstimated = 0;
    let totalActual = 0;

    for (const po of productionOrders) {
      totalEstimated += po.estimatedCost;
      totalActual += po.actualCost || po.estimatedCost; // Use estimated if actual not recorded
    }

    const variance = totalActual - totalEstimated;
    const variancePercentage = (variance / totalEstimated) * 100;

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      estimatedCost: totalEstimated,
      actualCost: totalActual,
      variance,
      variancePercentage,
      reasons: await this.analyzeVarianceReasons(productionOrders),
    };
  }

  /**
   * Analyze reasons for cost variance
   * @param productionOrders - Production orders
   * @returns List of variance reasons
   */
  async analyzeVarianceReasons(
    productionOrders: ProductionOrder[]
  ): Promise<string[]> {
    const reasons: string[] = [];

    for (const po of productionOrders) {
      if (!po.actualCost) continue;

      const variance = po.actualCost - po.estimatedCost;
      const variancePercentage = (variance / po.estimatedCost) * 100;

      if (Math.abs(variancePercentage) > 10) {
        if (variance > 0) {
          reasons.push(
            `PO ${po._id}: Cost overrun of ${variancePercentage.toFixed(2)}%`
          );

          // Analyze specific reasons
          if (po.costNotes) {
            reasons.push(`  - ${po.costNotes}`);
          }
        } else {
          reasons.push(
            `PO ${po._id}: Cost savings of ${Math.abs(
              variancePercentage
            ).toFixed(2)}%`
          );
        }
      }
    }

    return reasons;
  }

  /**
   * Generate variance report
   * @param dateRange - Date range for report
   * @returns Variance analysis report
   */
  async generateVarianceReport(
    dateRange: DateRange
  ): Promise<VarianceAnalysis> {
    const orders = await SwagOrder.find({
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ["completed", "shipped", "delivered"] },
    });

    const variances: OrderVariance[] = [];
    let totalEstimated = 0;
    let totalActual = 0;

    for (const order of orders) {
      const variance = await this.calculateVariance(order);
      variances.push(variance);
      totalEstimated += variance.estimatedCost;
      totalActual += variance.actualCost;
    }

    return {
      summary: {
        totalEstimated,
        totalActual,
        totalVariance: totalActual - totalEstimated,
        variancePercentage:
          ((totalActual - totalEstimated) / totalEstimated) * 100,
      },
      byOrder: variances,
      reasons: variances.flatMap((v) => v.reasons),
    };
  }
}
```

### API Endpoints

#### GET /api/admin/costs/:orderId

**Purpose**: Get cost breakdown for specific order

**Request**:

```typescript
GET /api/admin/costs/507f1f77bcf86cd799439011
Authorization: Bearer {token}
```

**Response**:

```typescript
{
  success: true,
  data: {
    breakdown: {
      orderId: "507f1f77bcf86cd799439011",
      baseProductsCost: 500000,
      customizationCost: 150000,
      setupFees: 50000,
      kittingFee: 30000,
      packagingCost: 15000,
      shippingCost: 80000,
      handlingFee: 40000,
      totalCost: 865000,
      totalPrice: 1200000,
      grossMargin: 335000,
      marginPercentage: 27.92
    }
  }
}
```

#### GET /api/admin/costs/margin-report

**Purpose**: Get margin report by product and customer

**Request**:

```typescript
GET /api/admin/costs/margin-report?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Response**:

```typescript
{
  success: true,
  data: {
    summary: {
      totalRevenue: 50000000,
      totalCost: 35000000,
      totalMargin: 15000000,
      averageMarginPercentage: 30.0
    },
    byProduct: [
      {
        productId: "...",
        productName: "T-Shirt Cotton",
        revenue: 10000000,
        cost: 6500000,
        margin: 3500000,
        marginPercentage: 35.0
      }
    ],
    byCustomer: [
      {
        organizationId: "...",
        organizationName: "ABC Corp",
        revenue: 15000000,
        cost: 10000000,
        margin: 5000000,
        marginPercentage: 33.33
      }
    ]
  }
}
```

#### PUT /api/admin/costs/:productionOrderId/actual

**Purpose**: Update actual costs for production order

**Request**:

```typescript
PUT /api/admin/costs/507f1f77bcf86cd799439011/actual
Authorization: Bearer {token}
Content-Type: application/json

{
  actualCost: 180000,
  costBreakdown: {
    materials: 120000,
    labor: 40000,
    overhead: 20000
  },
  notes: "Material cost higher due to supplier price increase"
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    productionOrder: {
      _id: "507f1f77bcf86cd799439011",
      estimatedCost: 150000,
      actualCost: 180000,
      costVariance: 30000,
      variancePercentage: 20.0
    }
  },
  message: "Đã cập nhật actual cost"
}
```

#### GET /api/admin/costs/variance

**Purpose**: Get variance analysis report

**Request**:

```typescript
GET /api/admin/costs/variance?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Response**:

```typescript
{
  success: true,
  data: {
    summary: {
      totalEstimated: 30000000,
      totalActual: 32500000,
      totalVariance: 2500000,
      variancePercentage: 8.33
    },
    byOrder: [
      {
        orderId: "...",
        orderNumber: "SO-2024-00001",
        estimatedCost: 500000,
        actualCost: 550000,
        variance: 50000,
        variancePercentage: 10.0,
        reasons: [
          "PO xxx: Cost overrun of 12.5%",
          "  - Material cost higher due to supplier price increase"
        ]
      }
    ]
  }
}
```

### Data Models

#### CostBreakdown Interface

```typescript
interface CostBreakdown {
  orderId: string;
  baseProductsCost: number;
  customizationCost: number;
  setupFees: number;
  kittingFee: number;
  packagingCost: number;
  shippingCost: number;
  handlingFee: number;
  totalCost: number;
  totalPrice: number;
  grossMargin: number;
  marginPercentage: number;
}
```

#### MarginReport Interface

```typescript
interface MarginReport {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    averageMarginPercentage: number;
  };
  byProduct: ProductMargin[];
  byCustomer: CustomerMargin[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

interface ProductMargin {
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
}

interface CustomerMargin {
  organizationId: string;
  organizationName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
}
```

#### VarianceAnalysis Interface

```typescript
interface VarianceAnalysis {
  summary: {
    totalEstimated: number;
    totalActual: number;
    totalVariance: number;
    variancePercentage: number;
  };
  byOrder: OrderVariance[];
  reasons: string[];
}

interface OrderVariance {
  orderId: string;
  orderNumber: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  reasons: string[];
}
```

### Error Handling

```typescript
// Order not found
if (!order) {
  throw new NotFoundException("Swag Order", orderId);
}

// Unauthorized access
if (order.organization.toString() !== user.organizationId.toString()) {
  throw new ForbiddenException(
    "Bạn không có quyền xem cost breakdown của đơn hàng này"
  );
}

// Invalid actual cost
if (actualCost < 0) {
  throw new ValidationException("Actual cost không thể âm");
}

// Production order not completed
if (productionOrder.status !== "completed") {
  throw new ConflictException(
    "Chỉ có thể update actual cost cho production order đã completed"
  );
}
```

### Performance Considerations

```typescript
// Cache margin reports (TTL: 1 hour)
const cacheKey = `margin-report:${startDate}:${endDate}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Use aggregation for large datasets
const marginByProduct = await SwagOrder.aggregate([
  { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
  { $unwind: "$packSnapshot.items" },
  {
    $group: {
      _id: "$packSnapshot.items.product",
      revenue: {
        $sum: {
          $multiply: [
            "$packSnapshot.items.price",
            "$packSnapshot.items.quantity",
          ],
        },
      },
      cost: {
        $sum: {
          $multiply: [
            "$packSnapshot.items.cost",
            "$packSnapshot.items.quantity",
          ],
        },
      },
    },
  },
]);

// Index for cost queries
SwagOrder.index({ createdAt: -1, status: 1 });
ProductionOrder.index({ swagOrderId: 1, status: 1 });
```

### Integration Points

```typescript
// Integrate with Order Service
orderService.on("orderCreated", async (order) => {
  const costBreakdown = await costCalculationService.calculateTotalCost(order);
  await marginCalculationService.checkMarginThreshold(order, costBreakdown);
});

// Integrate with Production Service
productionService.on("productionCompleted", async (productionOrder) => {
  // Prompt admin to record actual cost
  await notificationService.sendActualCostReminder(productionOrder);
});

// Integrate with Analytics Service
analyticsService.registerMetric("margin", async (dateRange) => {
  return await marginCalculationService.generateMarginReportByProduct(
    dateRange
  );
});
```

---

## Deployment Considerations

### Database Migrations

```typescript
// Migration: Add printMethods to existing products
db.catalogproducts.updateMany(
  { printMethods: { $exists: false } },
  { $set: { printMethods: [] } }
);

// Migration: Add inventory tracking to variants
db.skuvariants.updateMany(
  { inventory: { $exists: false } },
  {
    $set: {
      "inventory.onHand": "$stockQuantity",
      "inventory.reserved": 0,
      "inventory.available": "$stockQuantity",
      "inventory.inTransit": 0,
    },
  }
);
```

### Monitoring

```typescript
// Monitor inventory levels
setInterval(async () => {
  const lowStockItems = await inventoryService.getLowStockItems(10);
  if (lowStockItems.length > 0) {
    await alertService.sendLowStockAlert(lowStockItems);
  }
}, 3600000); // Every hour

// Monitor production delays
setInterval(async () => {
  const delayedOrders = await ProductionOrder.find({
    status: { $in: ["pending", "in_production"] },
    expectedCompletionDate: { $lt: new Date() },
  });
  if (delayedOrders.length > 0) {
    await alertService.sendProductionDelayAlert(delayedOrders);
  }
}, 3600000); // Every hour
```

## Summary

Thiết kế này cung cấp:

1. **Flexible Product Management**: Hỗ trợ nhiều variants, print methods, customization options
2. **Accurate Inventory Tracking**: Real-time stock levels, reservations, transactions
3. **Streamlined Production**: Automated production order generation, supplier communication, QC workflow
4. **Complete Document Trail**: Invoices, packing slips, delivery notes tự động
5. **Cost Transparency**: Chi tiết cost breakdown, margin tracking
6. **Scalable Architecture**: Services tách biệt, caching, optimized queries

Các improvements chính so với schema hiện tại:

- ✅ Thêm Artwork Model với version control
- ✅ Thêm Production Order Model để track manufacturing
- ✅ Thêm Invoice Model cho accounting
- ✅ Thêm Inventory Transaction Model cho audit trail
- ✅ Enhanced Product Model với print methods configuration
- ✅ Enhanced SKU Variant với supplier mappings và inventory tracking
- ✅ Enhanced Swag Order với production tracking và cost breakdown
