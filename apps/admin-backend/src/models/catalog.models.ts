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
  createdAt: Date;
  updatedAt: Date;
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
  },
  { timestamps: true }
);

SupplierSchema.index({ type: 1, isActive: 1 });
SupplierSchema.index({ isPreferred: 1 });

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

  // Template Items
  items: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    isRequired: boolean;
    allowSubstitute: boolean;
    substituteProducts?: mongoose.Types.ObjectId[];
  }[];

  // Default Customization
  defaultCustomization: {
    includeLogo: boolean;
    logoPosition?: string;
    includePersonalization: boolean;
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

  // Stats
  timesUsed: number;

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "CatalogProduct",
          required: true,
        },
        productName: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        isRequired: { type: Boolean, default: true },
        allowSubstitute: { type: Boolean, default: false },
        substituteProducts: [
          { type: Schema.Types.ObjectId, ref: "CatalogProduct" },
        ],
      },
    ],

    defaultCustomization: {
      includeLogo: { type: Boolean, default: true },
      logoPosition: { type: String },
      includePersonalization: { type: Boolean, default: false },
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

    timesUsed: { type: Number, default: 0 },

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

ProductTemplateSchema.index({ type: 1, isActive: 1 });
ProductTemplateSchema.index({ isPublic: 1 });

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
