// src/modules/inventory/inventory.model.js
// ✅ Inventory Model - Quản lý tồn kho ảo cho Organization

import mongoose from "mongoose";

const INVENTORY_ITEM_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  RESERVED: "reserved",
};

// Schema cho từng item trong kho
const InventoryItemSchema = new mongoose.Schema(
  {
    // === PRODUCT INFO ===
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    productSku: { type: String },
    productImage: { type: String },

    // === QUANTITY ===
    quantity: { type: Number, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 }, // Đã đặt nhưng chưa ship
    availableQuantity: { type: Number, default: 0, min: 0 }, // quantity - reserved

    // === THRESHOLDS ===
    lowStockThreshold: { type: Number, default: 10 },
    reorderPoint: { type: Number, default: 20 },

    // === PRICING ===
    unitCost: { type: Number, default: 0 }, // Giá nhập
    totalValue: { type: Number, default: 0 }, // quantity * unitCost

    // === CUSTOMIZATION (for branded items) ===
    customization: {
      hasLogo: { type: Boolean, default: false },
      logoUrl: { type: String },
      printColor: { type: String },
    },

    // === SIZE BREAKDOWN (for apparel) ===
    sizeBreakdown: {
      XS: { type: Number, default: 0 },
      S: { type: Number, default: 0 },
      M: { type: Number, default: 0 },
      L: { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
      XXL: { type: Number, default: 0 },
      XXXL: { type: Number, default: 0 },
    },

    // === LOCATION ===
    warehouseLocation: { type: String, default: "Printz HQ" },
    binLocation: { type: String }, // Vị trí trong kho

    // === DATES ===
    lastRestockedAt: { type: Date },
    lastShippedAt: { type: Date },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(INVENTORY_ITEM_STATUS),
      default: INVENTORY_ITEM_STATUS.IN_STOCK,
    },
  },
  { timestamps: true }
);

// Main Inventory Schema (per Organization)
const InventorySchema = new mongoose.Schema(
  {
    // === ORGANIZATION LINK ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      unique: true,
    },

    // === ITEMS ===
    items: [InventoryItemSchema],

    // === STATS ===
    stats: {
      totalSkus: { type: Number, default: 0 },
      totalQuantity: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 },
      lowStockCount: { type: Number, default: 0 },
      outOfStockCount: { type: Number, default: 0 },
    },

    // === SETTINGS ===
    settings: {
      autoReorder: { type: Boolean, default: false },
      lowStockAlerts: { type: Boolean, default: true },
      alertEmail: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
InventorySchema.index({ organization: 1 });
InventorySchema.index({ "items.product": 1 });
InventorySchema.index({ "items.status": 1 });

// === METHODS ===
InventorySchema.methods.recalculateStats = function () {
  const items = this.items || [];

  this.stats = {
    totalSkus: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockCount: items.filter((item) => item.status === "low_stock").length,
    outOfStockCount: items.filter((item) => item.status === "out_of_stock")
      .length,
  };

  return this.stats;
};

InventorySchema.methods.updateItemStatus = function (itemId) {
  const item = this.items.id(itemId);
  if (!item) return;

  item.availableQuantity = item.quantity - item.reservedQuantity;

  if (item.quantity === 0) {
    item.status = INVENTORY_ITEM_STATUS.OUT_OF_STOCK;
  } else if (item.quantity <= item.lowStockThreshold) {
    item.status = INVENTORY_ITEM_STATUS.LOW_STOCK;
  } else {
    item.status = INVENTORY_ITEM_STATUS.IN_STOCK;
  }

  item.totalValue = item.quantity * item.unitCost;
};

// === PRE-SAVE ===
InventorySchema.pre("save", function (next) {
  // Update all item statuses
  this.items.forEach((item) => {
    item.availableQuantity = item.quantity - item.reservedQuantity;
    item.totalValue = item.quantity * item.unitCost;

    if (item.quantity === 0) {
      item.status = INVENTORY_ITEM_STATUS.OUT_OF_STOCK;
    } else if (item.quantity <= item.lowStockThreshold) {
      item.status = INVENTORY_ITEM_STATUS.LOW_STOCK;
    } else {
      item.status = INVENTORY_ITEM_STATUS.IN_STOCK;
    }
  });

  // Recalculate stats
  this.recalculateStats();

  next();
});

export const Inventory =
  mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);

export { INVENTORY_ITEM_STATUS };
