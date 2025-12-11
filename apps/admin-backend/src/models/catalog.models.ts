// @ts-nocheck
// apps/admin-backend/src/models/catalog.models.ts
// ✅ Product Catalog Models - SwagUp-style Product Management

import mongoose, { Schema, Document } from "mongoose";

// ============================================
// 1. PRODUCT CATEGORY - Danh mục phân cấp
// ============================================
export interface IProductCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  level: number;
  path: string; // "apparel/t-shirts/polo"
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    level: { type: Number, default: 0 },
    path: { type: String, required: true, index: true },
    icon: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ProductCategorySchema.index({ parentId: 1, sortOrder: 1 });

// ============================================
// 2. SUPPLIER - Nhà cung cấp
// ============================================
export interface ISupplier extends Document {
  name: string;
  code: string;
  type: "manufacturer" | "distributor" | "printer" | "dropshipper";
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  capabilities: string[];
  leadTime: {
    min: number;
    max: number;
    unit: "days" | "weeks";
  };
  minimumOrderQuantity: number;
  paymentTerms?: string;
  rating: number;
  isActive: boolean;
  isPreferred: boolean;
  notes?: string;

  // ✅ PHASE 8.1.1: Performance Metrics
  performanceMetrics: {
    // Delivery Performance
    totalOrders: number;
    completedOrders: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    onTimeDeliveryRate: number; // Percentage

    // Quality Performance
    totalQCChecks: number;
    passedQCChecks: number;
    failedQCChecks: number;
    qualityScore: number; // Percentage

    // Lead Time Performance
    averageLeadTime: number; // In days
    minLeadTime: number;
    maxLeadTime: number;

    // Cost Performance
    averageCost: number;
    totalSpent: number;

    // Last Updated
    lastUpdated: Date;
  };

  // ✅ PHASE 8.1.1: Lead Time History
  leadTimeHistory: {
    productionOrderId: mongoose.Types.ObjectId;
    orderedAt: Date;
    expectedCompletionDate: Date;
    actualCompletionDate: Date;
    leadTimeDays: number;
    wasOnTime: boolean;
  }[];

  createdAt: Date;
  updatedAt: Date;

  // Methods
  updatePerformanceMetrics(): Promise<void>;
  recordLeadTime(
    productionOrderId: mongoose.Types.ObjectId,
    orderedAt: Date,
    expectedDate: Date,
    actualDate: Date
  ): Promise<void>;
  calculateOnTimeRate(): number;
  calculateQualityScore(): number;
  calculateAverageLeadTime(): number;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ["manufacturer", "distributor", "printer", "dropshipper"],
      required: true,
    },
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      country: { type: String, default: "Vietnam" },
    },
    capabilities: [{ type: String }],
    leadTime: {
      min: { type: Number, default: 3 },
      max: { type: Number, default: 7 },
      unit: { type: String, enum: ["days", "weeks"], default: "days" },
    },
    minimumOrderQuantity: { type: Number, default: 1 },
    paymentTerms: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
    isPreferred: { type: Boolean, default: false },
    notes: { type: String },

    // ✅ PHASE 8.1.1: Performance Metrics
    performanceMetrics: {
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      onTimeDeliveries: { type: Number, default: 0 },
      lateDeliveries: { type: Number, default: 0 },
      onTimeDeliveryRate: { type: Number, default: 0 },

      totalQCChecks: { type: Number, default: 0 },
      passedQCChecks: { type: Number, default: 0 },
      failedQCChecks: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 0 },

      averageLeadTime: { type: Number, default: 0 },
      minLeadTime: { type: Number, default: 0 },
      maxLeadTime: { type: Number, default: 0 },

      averageCost: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },

      lastUpdated: { type: Date, default: Date.now },
    },

    // ✅ PHASE 8.1.1: Lead Time History
    leadTimeHistory: [
      {
        productionOrderId: {
          type: Schema.Types.ObjectId,
          ref: "ProductionOrder",
        },
        orderedAt: { type: Date, required: true },
        expectedCompletionDate: { type: Date, required: true },
        actualCompletionDate: { type: Date, required: true },
        leadTimeDays: { type: Number, required: true },
        wasOnTime: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

SupplierSchema.index({ type: 1, isActive: 1 });
SupplierSchema.index({ isPreferred: 1 });
SupplierSchema.index({ "performanceMetrics.onTimeDeliveryRate": -1 });
SupplierSchema.index({ "performanceMetrics.qualityScore": -1 });

// ============================================
// SUPPLIER METHODS
// ============================================

/**
 * Calculate on-time delivery rate
 */
SupplierSchema.methods.calculateOnTimeRate = function (): number {
  if (this.performanceMetrics.totalOrders === 0) return 0;
  return (
    (this.performanceMetrics.onTimeDeliveries /
      this.performanceMetrics.totalOrders) *
    100
  );
};

/**
 * Calculate quality score
 */
SupplierSchema.methods.calculateQualityScore = function (): number {
  if (this.performanceMetrics.totalQCChecks === 0) return 0;
  return (
    (this.performanceMetrics.passedQCChecks /
      this.performanceMetrics.totalQCChecks) *
    100
  );
};

/**
 * Calculate average lead time from history
 */
SupplierSchema.methods.calculateAverageLeadTime = function (): number {
  if (this.leadTimeHistory.length === 0) return 0;

  const totalLeadTime = this.leadTimeHistory.reduce(
    (sum, record) => sum + record.leadTimeDays,
    0
  );

  return totalLeadTime / this.leadTimeHistory.length;
};

/**
 * Record lead time for a production order
 */
SupplierSchema.methods.recordLeadTime = async function (
  productionOrderId: mongoose.Types.ObjectId,
  orderedAt: Date,
  expectedDate: Date,
  actualDate: Date
): Promise<void> {
  // Calculate lead time in days
  const leadTimeDays = Math.ceil(
    (actualDate.getTime() - orderedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check if on time
  const wasOnTime = actualDate <= expectedDate;

  // Add to history (keep last 100 records)
  this.leadTimeHistory.push({
    productionOrderId,
    orderedAt,
    expectedCompletionDate: expectedDate,
    actualCompletionDate: actualDate,
    leadTimeDays,
    wasOnTime,
  });

  // Keep only last 100 records
  if (this.leadTimeHistory.length > 100) {
    this.leadTimeHistory = this.leadTimeHistory.slice(-100);
  }

  // Update metrics
  await this.updatePerformanceMetrics();
};

/**
 * Update performance metrics from production orders
 */
SupplierSchema.methods.updatePerformanceMetrics =
  async function (): Promise<void> {
    const ProductionOrder = mongoose.model("ProductionOrder");

    // Get all production orders for this supplier
    const orders = await ProductionOrder.find({ supplierId: this._id });

    // Calculate metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed"
    ).length;

    // On-time delivery
    const onTimeDeliveries = orders.filter(
      (o) =>
        o.status === "completed" &&
        o.actualCompletionDate &&
        o.actualCompletionDate <= o.expectedCompletionDate
    ).length;

    const lateDeliveries = completedOrders - onTimeDeliveries;

    // QC metrics
    const ordersWithQC = orders.filter(
      (o) => o.qcChecks && o.qcChecks.length > 0
    );
    const totalQCChecks = ordersWithQC.reduce(
      (sum, o) => sum + o.qcChecks.length,
      0
    );
    const passedQCChecks = ordersWithQC.reduce(
      (sum, o) => sum + o.qcChecks.filter((qc) => qc.passed).length,
      0
    );
    const failedQCChecks = totalQCChecks - passedQCChecks;

    // Lead time metrics from history
    const averageLeadTime = this.calculateAverageLeadTime();
    const minLeadTime =
      this.leadTimeHistory.length > 0
        ? Math.min(...this.leadTimeHistory.map((h) => h.leadTimeDays))
        : 0;
    const maxLeadTime =
      this.leadTimeHistory.length > 0
        ? Math.max(...this.leadTimeHistory.map((h) => h.leadTimeDays))
        : 0;

    // Cost metrics
    const totalSpent = orders.reduce((sum, o) => sum + (o.actualCost || 0), 0);
    const averageCost = completedOrders > 0 ? totalSpent / completedOrders : 0;

    // Update metrics
    this.performanceMetrics = {
      totalOrders,
      completedOrders,
      onTimeDeliveries,
      lateDeliveries,
      onTimeDeliveryRate: this.calculateOnTimeRate(),

      totalQCChecks,
      passedQCChecks,
      failedQCChecks,
      qualityScore: this.calculateQualityScore(),

      averageLeadTime,
      minLeadTime,
      maxLeadTime,

      averageCost,
      totalSpent,

      lastUpdated: new Date(),
    };

    await this.save();
  };

// ============================================
// 3. CATALOG PRODUCT - Sản phẩm trong catalog
// ============================================
export interface ICatalogProduct extends Document {
  // Basic Info
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;

  // Categorization
  categoryId: mongoose.Types.ObjectId;
  categoryPath: string;
  tags: string[];

  // Supplier
  supplierId?: mongoose.Types.ObjectId;
  supplierSku?: string;

  // Media
  images: {
    url: string;
    alt?: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  thumbnailUrl?: string;

  // Pricing
  baseCost: number; // Giá nhập
  basePrice: number; // Giá bán cơ bản
  pricingTiers: {
    minQty: number;
    maxQty?: number;
    pricePerUnit: number;
    discount?: number;
  }[];
  currency: string;

  // Variants
  hasVariants: boolean;
  variantAttributes: string[]; // ["size", "color"]

  // Specifications
  specifications: {
    material?: string;
    weight?: number;
    weightUnit?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    };
    customFields?: Record<string, any>;
  };

  // Customization
  customization: {
    allowLogo: boolean;
    logoPositions?: string[];
    allowPersonalization: boolean;
    personalizationFields?: string[];
    printMethods?: string[];
    setupFee?: number;
  };

  // Inventory
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;

  // Status
  status: "draft" | "active" | "inactive" | "discontinued";
  isPublished: boolean;
  isFeatured: boolean;

  // Stats
  totalSold: number;
  totalOrders: number;
  averageRating: number;
  reviewCount: number;

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogProductSchema = new Schema<ICatalogProduct>(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 200 },

    // Categorization
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
      index: true,
    },
    categoryPath: { type: String, index: true },
    tags: [{ type: String, trim: true }],

    // Supplier
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", index: true },
    supplierSku: { type: String },

    // Media
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
      },
    ],
    thumbnailUrl: { type: String },

    // Pricing
    baseCost: { type: Number, default: 0 },
    basePrice: { type: Number, required: true },
    pricingTiers: [
      {
        minQty: { type: Number, required: true },
        maxQty: { type: Number },
        pricePerUnit: { type: Number, required: true },
        discount: { type: Number },
      },
    ],
    currency: { type: String, default: "VND" },

    // Variants
    hasVariants: { type: Boolean, default: false },
    variantAttributes: [{ type: String }],

    // Specifications
    specifications: {
      material: { type: String },
      weight: { type: Number },
      weightUnit: { type: String, default: "g" },
      dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
        unit: { type: String, default: "cm" },
      },
      customFields: { type: Schema.Types.Mixed },
    },

    // Customization
    customization: {
      allowLogo: { type: Boolean, default: true },
      logoPositions: [{ type: String }],
      allowPersonalization: { type: Boolean, default: false },
      personalizationFields: [{ type: String }],
      printMethods: [{ type: String }],
      setupFee: { type: Number, default: 0 },
    },

    // Inventory
    trackInventory: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    allowBackorder: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "discontinued"],
      default: "draft",
      index: true,
    },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    // Stats
    totalSold: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // SEO
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

CatalogProductSchema.index({ name: "text", description: "text", tags: "text" });
CatalogProductSchema.index({ status: 1, isPublished: 1 });
CatalogProductSchema.index({ categoryId: 1, status: 1 });
CatalogProductSchema.index({ supplierId: 1 });
CatalogProductSchema.index({ isFeatured: 1 });

// ============================================
// 4. SKU VARIANT - Biến thể sản phẩm
// ============================================
export interface ISkuVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  name: string; // "T-Shirt - Size L - Red"

  // Variant Attributes
  attributes: {
    name: string; // "size", "color"
    value: string; // "L", "Red"
    displayValue?: string;
  }[];

  // Pricing (override product pricing)
  price?: number;
  cost?: number;
  pricingTiers?: {
    minQty: number;
    maxQty?: number;
    pricePerUnit: number;
  }[];

  // Media
  imageUrl?: string;
  images?: string[];

  // Inventory
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;

  // Status
  isActive: boolean;
  isDefault: boolean;

  // Barcode
  barcode?: string;
  upc?: string;

  // Weight (for shipping)
  weight?: number;
  weightUnit?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SkuVariantSchema = new Schema<ISkuVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "CatalogProduct",
      required: true,
      index: true,
    },
    sku: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },

    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        displayValue: { type: String },
      },
    ],

    price: { type: Number },
    cost: { type: Number },
    pricingTiers: [
      {
        minQty: { type: Number, required: true },
        maxQty: { type: Number },
        pricePerUnit: { type: Number, required: true },
      },
    ],

    imageUrl: { type: String },
    images: [{ type: String }],

    stockQuantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },

    barcode: { type: String },
    upc: { type: String },

    weight: { type: Number },
    weightUnit: { type: String, default: "g" },
  },
  { timestamps: true }
);

SkuVariantSchema.index({ productId: 1, isActive: 1 });
SkuVariantSchema.index({ sku: 1 });
SkuVariantSchema.index({ barcode: 1 });

// Virtual: available quantity
SkuVariantSchema.virtual("availableQuantity").get(function () {
  return this.stockQuantity - this.reservedQuantity;
});

// ============================================
// 5. PRODUCT TEMPLATE - Template tái sử dụng
// ============================================
export interface IProductTemplate extends Document {
  name: string;
  description?: string;
  type: "welcome_kit" | "event_swag" | "client_gift" | "holiday" | "custom";

  // Organization (if template is private to an org)
  organizationId?: mongoose.Types.ObjectId;

  // Template Items
  items: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    productSku: string;
    quantity: number;
    isRequired: boolean;
    allowSubstitute: boolean;
    substituteProducts?: {
      productId: mongoose.Types.ObjectId;
      productName: string;
      productSku: string;
      reason?: string; // Why this is a good substitute
    }[];
  }[];

  // Default Customization
  defaultCustomization: {
    includeLogo: boolean;
    logoPosition?: string;
    includePersonalization: boolean;
    personalizationFields?: string[];
  };

  // Packaging
  packaging: {
    boxType: string;
    includeCard: boolean;
    defaultMessage?: string;
  };

  // Pricing
  estimatedCost: number;
  estimatedPrice: number;

  // Status
  isActive: boolean;
  isPublic: boolean; // Visible to customers

  // ✅ PHASE 9.1.1: Usage Tracking
  usageTracking: {
    timesUsed: number;
    lastUsedAt?: Date;
    lastUsedBy?: mongoose.Types.ObjectId;
    totalRevenue: number;
    averageOrderValue: number;
  };

  // ✅ PHASE 9.1.1: Order History
  orderHistory: {
    orderId: mongoose.Types.ObjectId;
    orderNumber: string;
    organizationId: mongoose.Types.ObjectId;
    createdAt: Date;
    totalAmount: number;
    recipientCount: number;
  }[];

  // ✅ PHASE 9.1.1: Substitute Product Support
  discontinuedProducts: mongoose.Types.ObjectId[]; // Track products that are no longer available

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  recordUsage(
    orderId: mongoose.Types.ObjectId,
    orderNumber: string,
    organizationId: mongoose.Types.ObjectId,
    totalAmount: number,
    recipientCount: number,
    userId?: mongoose.Types.ObjectId
  ): Promise<void>;
  getSuggestedSubstitutes(
    productId: mongoose.Types.ObjectId
  ): Promise<mongoose.Types.ObjectId[]>;
  checkProductAvailability(): Promise<{
    allAvailable: boolean;
    unavailableProducts: {
      productId: mongoose.Types.ObjectId;
      productName: string;
      suggestedSubstitutes: mongoose.Types.ObjectId[];
    }[];
  }>;
}

const ProductTemplateSchema = new Schema<IProductTemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["welcome_kit", "event_swag", "client_gift", "holiday", "custom"],
      default: "custom",
    },

    // Organization (if template is private)
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      index: true,
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "CatalogProduct",
          required: true,
        },
        productName: { type: String, required: true },
        productSku: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        isRequired: { type: Boolean, default: true },
        allowSubstitute: { type: Boolean, default: false },
        substituteProducts: [
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: "CatalogProduct",
              required: true,
            },
            productName: { type: String, required: true },
            productSku: { type: String, required: true },
            reason: { type: String },
          },
        ],
      },
    ],

    defaultCustomization: {
      includeLogo: { type: Boolean, default: true },
      logoPosition: { type: String },
      includePersonalization: { type: Boolean, default: false },
      personalizationFields: [{ type: String }],
    },

    packaging: {
      boxType: { type: String, default: "standard" },
      includeCard: { type: Boolean, default: false },
      defaultMessage: { type: String },
    },

    estimatedCost: { type: Number, default: 0 },
    estimatedPrice: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false },

    // ✅ PHASE 9.1.1: Usage Tracking
    usageTracking: {
      timesUsed: { type: Number, default: 0 },
      lastUsedAt: { type: Date },
      lastUsedBy: { type: Schema.Types.ObjectId, ref: "User" },
      totalRevenue: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
    },

    // ✅ PHASE 9.1.1: Order History (keep last 50 orders)
    orderHistory: [
      {
        orderId: { type: Schema.Types.ObjectId, ref: "SwagOrder" },
        orderNumber: { type: String, required: true },
        organizationId: {
          type: Schema.Types.ObjectId,
          ref: "OrganizationProfile",
        },
        createdAt: { type: Date, required: true },
        totalAmount: { type: Number, required: true },
        recipientCount: { type: Number, required: true },
      },
    ],

    // ✅ PHASE 9.1.1: Discontinued Products
    discontinuedProducts: [
      { type: Schema.Types.ObjectId, ref: "CatalogProduct" },
    ],

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

ProductTemplateSchema.index({ type: 1, isActive: 1 });
ProductTemplateSchema.index({ isPublic: 1 });
ProductTemplateSchema.index({ organizationId: 1, isActive: 1 });
ProductTemplateSchema.index({ "usageTracking.timesUsed": -1 });
ProductTemplateSchema.index({ "usageTracking.lastUsedAt": -1 });

// ============================================
// PRODUCT TEMPLATE METHODS
// ============================================

/**
 * Record template usage when an order is created from this template
 */
ProductTemplateSchema.methods.recordUsage = async function (
  orderId: mongoose.Types.ObjectId,
  orderNumber: string,
  organizationId: mongoose.Types.ObjectId,
  totalAmount: number,
  recipientCount: number,
  userId?: mongoose.Types.ObjectId
): Promise<void> {
  // Update usage tracking
  this.usageTracking.timesUsed += 1;
  this.usageTracking.lastUsedAt = new Date();
  if (userId) {
    this.usageTracking.lastUsedBy = userId;
  }

  // Update revenue metrics
  this.usageTracking.totalRevenue += totalAmount;
  this.usageTracking.averageOrderValue =
    this.usageTracking.totalRevenue / this.usageTracking.timesUsed;

  // Add to order history (keep last 50)
  this.orderHistory.push({
    orderId,
    orderNumber,
    organizationId,
    createdAt: new Date(),
    totalAmount,
    recipientCount,
  });

  // Keep only last 50 orders
  if (this.orderHistory.length > 50) {
    this.orderHistory = this.orderHistory.slice(-50);
  }

  await this.save();
};

/**
 * Get suggested substitutes for a discontinued product
 */
ProductTemplateSchema.methods.getSuggestedSubstitutes = async function (
  productId: mongoose.Types.ObjectId
): Promise<mongoose.Types.ObjectId[]> {
  // Find the item in template
  const item = this.items.find(
    (i: any) => i.productId.toString() === productId.toString()
  );

  if (!item || !item.allowSubstitute) {
    return [];
  }

  // Return configured substitutes
  if (item.substituteProducts && item.substituteProducts.length > 0) {
    return item.substituteProducts.map((s: any) => s.productId);
  }

  // If no substitutes configured, find similar products
  const product = await CatalogProduct.findById(productId);
  if (!product) return [];

  // Find products in same category with similar price
  const similarProducts = await CatalogProduct.find({
    categoryId: product.categoryId,
    _id: { $ne: productId },
    status: "active",
    isPublished: true,
    basePrice: {
      $gte: product.basePrice * 0.8,
      $lte: product.basePrice * 1.2,
    },
  })
    .limit(5)
    .select("_id");

  return similarProducts.map((p) => p._id);
};

/**
 * Check if all products in template are available
 */
ProductTemplateSchema.methods.checkProductAvailability =
  async function (): Promise<{
    allAvailable: boolean;
    unavailableProducts: {
      productId: mongoose.Types.ObjectId;
      productName: string;
      suggestedSubstitutes: mongoose.Types.ObjectId[];
    }[];
  }> {
    const unavailableProducts: {
      productId: mongoose.Types.ObjectId;
      productName: string;
      suggestedSubstitutes: mongoose.Types.ObjectId[];
    }[] = [];

    // Check each product
    for (const item of this.items) {
      const product = await CatalogProduct.findById(item.productId);

      // Check if product is discontinued or inactive
      if (
        !product ||
        product.status === "discontinued" ||
        product.status === "inactive" ||
        !product.isPublished
      ) {
        // Get suggested substitutes
        const substitutes = await this.getSuggestedSubstitutes(item.productId);

        unavailableProducts.push({
          productId: item.productId,
          productName: item.productName,
          suggestedSubstitutes: substitutes,
        });

        // Add to discontinued list if not already there
        if (
          !this.discontinuedProducts.some(
            (id) => id.toString() === item.productId.toString()
          )
        ) {
          this.discontinuedProducts.push(item.productId);
        }
      }
    }

    // Save if we added any discontinued products
    if (unavailableProducts.length > 0) {
      await this.save();
    }

    return {
      allAvailable: unavailableProducts.length === 0,
      unavailableProducts,
    };
  };

// ============================================
// EXPORT MODELS
// ============================================
export const ProductCategory = (mongoose.models.ProductCategory ||
  mongoose.model<IProductCategory>(
    "ProductCategory",
    ProductCategorySchema
  )) as mongoose.Model<IProductCategory>;

export const Supplier = (mongoose.models.Supplier ||
  mongoose.model<ISupplier>(
    "Supplier",
    SupplierSchema
  )) as mongoose.Model<ISupplier>;

export const CatalogProduct = (mongoose.models.CatalogProduct ||
  mongoose.model<ICatalogProduct>(
    "CatalogProduct",
    CatalogProductSchema
  )) as mongoose.Model<ICatalogProduct>;

export const SkuVariant = (mongoose.models.SkuVariant ||
  mongoose.model<ISkuVariant>(
    "SkuVariant",
    SkuVariantSchema
  )) as mongoose.Model<ISkuVariant>;

export const ProductTemplate = (mongoose.models.ProductTemplate ||
  mongoose.model<IProductTemplate>(
    "ProductTemplate",
    ProductTemplateSchema
  )) as mongoose.Model<IProductTemplate>;
