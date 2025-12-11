// src/modules/catalog/sku-variant.model.js
// ✅ SKU Variant Model - Biến thể sản phẩm với inventory tracking

import mongoose from "mongoose";

const SKU_VARIANT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DISCONTINUED: "discontinued",
};

const SkuVariantSchema = new mongoose.Schema(
  {
    // === PRODUCT LINK ===
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: { type: String, required: true },

    // === SKU INFO ===
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true }, // "T-Shirt - Red - L"

    // === VARIANT ATTRIBUTES ===
    attributes: {
      size: { type: String }, // "S", "M", "L", "XL"
      color: { type: String }, // "Red", "Blue", "Black"
      material: { type: String }, // "Cotton", "Polyester"
      style: { type: String }, // "V-Neck", "Crew Neck"
    },

    // === PRICING ===
    basePrice: { type: Number, required: true },
    cost: { type: Number, required: true }, // Cost from supplier
    margin: { type: Number }, // basePrice - cost
    marginPercentage: { type: Number }, // (margin / basePrice) * 100

    // === PHYSICAL SPECS ===
    weight: { type: Number }, // grams
    dimensions: {
      length: { type: Number }, // cm
      width: { type: Number }, // cm
      height: { type: Number }, // cm
    },

    // === IMAGES ===
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // === 🎨 POD CATALOG OPTIMIZATION: SUPPLIER MAPPINGS ===
    supplierMappings: [
      {
        supplier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplier",
          required: true,
        },
        supplierSku: { type: String, required: true },
        cost: { type: Number, required: true },
        leadTime: {
          min: { type: Number, required: true }, // days
          max: { type: Number, required: true }, // days
          unit: { type: String, default: "days" },
        },
        moq: { type: Number, default: 1 }, // Minimum Order Quantity
        isPreferred: { type: Boolean, default: false },
      },
    ],

    // === 🎨 POD CATALOG OPTIMIZATION: INVENTORY TRACKING ===
    inventory: {
      onHand: { type: Number, default: 0 }, // Physical stock
      reserved: { type: Number, default: 0 }, // Reserved for orders
      available: { type: Number, default: 0 }, // onHand - reserved
      inTransit: { type: Number, default: 0 }, // Ordered from supplier

      // Locations (nếu có nhiều kho)
      locations: [
        {
          warehouse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
          },
          warehouseName: { type: String },
          quantity: { type: Number, default: 0 },
        },
      ],

      // Replenishment
      reorderPoint: { type: Number, default: 10 },
      reorderQuantity: { type: Number, default: 50 },
      lastRestockDate: { type: Date },
      nextRestockDate: { type: Date },
    },

    // === 🎨 POD CATALOG OPTIMIZATION: PERFORMANCE METRICS ===
    metrics: {
      totalSold: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageMargin: { type: Number, default: 0 },
      returnRate: { type: Number, default: 0 }, // Percentage
      averageLeadTime: { type: Number, default: 0 }, // days
      lastSoldAt: { type: Date },
    },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(SKU_VARIANT_STATUS),
      default: SKU_VARIANT_STATUS.ACTIVE,
      index: true,
    },
    isActive: { type: Boolean, default: true },

    // === METADATA ===
    barcode: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
SkuVariantSchema.index({ product: 1, isActive: 1 });
SkuVariantSchema.index({ sku: 1 }, { unique: true });
SkuVariantSchema.index({ "inventory.available": 1 }); // For low stock queries
SkuVariantSchema.index({ status: 1, isActive: 1 });

// === VIRTUALS ===
SkuVariantSchema.virtual("isLowStock").get(function () {
  return (
    this.inventory.available > 0 &&
    this.inventory.available <= this.inventory.reorderPoint
  );
});

SkuVariantSchema.virtual("isOutOfStock").get(function () {
  return this.inventory.available === 0;
});

SkuVariantSchema.virtual("needsReorder").get(function () {
  return this.inventory.onHand <= this.inventory.reorderPoint;
});

SkuVariantSchema.virtual("preferredSupplier").get(function () {
  if (!this.supplierMappings || this.supplierMappings.length === 0) return null;
  return (
    this.supplierMappings.find((m) => m.isPreferred) || this.supplierMappings[0]
  );
});

// === METHODS ===
SkuVariantSchema.methods.reserveInventory = function (quantity) {
  if (this.inventory.available < quantity) {
    throw new Error(
      `Insufficient stock. Available: ${this.inventory.available}, Requested: ${quantity}`
    );
  }

  this.inventory.reserved += quantity;
  this.inventory.available = this.inventory.onHand - this.inventory.reserved;

  return this.save();
};

SkuVariantSchema.methods.releaseInventory = function (quantity) {
  this.inventory.reserved = Math.max(0, this.inventory.reserved - quantity);
  this.inventory.available = this.inventory.onHand - this.inventory.reserved;

  return this.save();
};

SkuVariantSchema.methods.adjustInventory = function (quantity, reason) {
  this.inventory.onHand += quantity;
  this.inventory.available = this.inventory.onHand - this.inventory.reserved;

  if (quantity > 0) {
    this.inventory.lastRestockDate = new Date();
  }

  return this.save();
};

SkuVariantSchema.methods.recordSale = function (quantity, revenue) {
  this.metrics.totalSold += quantity;
  this.metrics.totalRevenue += revenue;
  this.metrics.lastSoldAt = new Date();

  // Recalculate average margin
  if (this.metrics.totalSold > 0) {
    this.metrics.averageMargin =
      this.metrics.totalRevenue / this.metrics.totalSold - this.cost;
  }

  return this.save();
};

SkuVariantSchema.methods.calculateMargin = function () {
  this.margin = this.basePrice - this.cost;
  this.marginPercentage =
    this.basePrice > 0 ? (this.margin / this.basePrice) * 100 : 0;
  return this.margin;
};

// === PRE-SAVE ===
SkuVariantSchema.pre("save", function (next) {
  // Auto-calculate available inventory
  this.inventory.available = this.inventory.onHand - this.inventory.reserved;

  // Auto-calculate margin
  this.margin = this.basePrice - this.cost;
  this.marginPercentage =
    this.basePrice > 0 ? (this.margin / this.basePrice) * 100 : 0;

  next();
});

// === STATICS ===
SkuVariantSchema.statics.generateSku = async function (productId, attributes) {
  const product = await mongoose.model("Product").findById(productId);
  if (!product) throw new Error("Product not found");

  // Generate SKU: PRODUCT-COLOR-SIZE
  const parts = [
    product.name.substring(0, 3).toUpperCase(),
    attributes.color?.substring(0, 3).toUpperCase() || "DEF",
    attributes.size?.toUpperCase() || "OS",
  ];

  let sku = parts.join("-");
  let counter = 1;

  // Ensure uniqueness
  while (await this.findOne({ sku })) {
    sku = `${parts.join("-")}-${counter}`;
    counter++;
  }

  return sku;
};

SkuVariantSchema.statics.findLowStock = function (threshold) {
  return this.find({
    isActive: true,
    "inventory.available": {
      $gt: 0,
      $lte: threshold || 10,
    },
  })
    .populate("product", "name category")
    .sort({ "inventory.available": 1 });
};

SkuVariantSchema.statics.findOutOfStock = function () {
  return this.find({
    isActive: true,
    "inventory.available": 0,
  })
    .populate("product", "name category")
    .sort({ "metrics.totalSold": -1 });
};

SkuVariantSchema.statics.findByProduct = function (productId) {
  return this.find({
    product: productId,
    isActive: true,
  }).sort({ name: 1 });
};

export const SkuVariant =
  mongoose.models.SkuVariant || mongoose.model("SkuVariant", SkuVariantSchema);
export { SKU_VARIANT_STATUS };
