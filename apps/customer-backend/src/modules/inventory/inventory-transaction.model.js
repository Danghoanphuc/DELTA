// src/modules/inventory/inventory-transaction.model.js
// ✅ Inventory Transaction Model - Tracking mọi thay đổi inventory

import mongoose from "mongoose";

const TRANSACTION_TYPES = {
  PURCHASE: "purchase", // Nhập hàng từ supplier
  SALE: "sale", // Bán hàng
  ADJUSTMENT: "adjustment", // Điều chỉnh thủ công
  RETURN: "return", // Trả hàng
  DAMAGE: "damage", // Hàng hỏng
  RESERVE: "reserve", // Đặt trước cho đơn hàng
  RELEASE: "release", // Giải phóng đặt trước
  TRANSFER: "transfer", // Chuyển kho
};

const REFERENCE_TYPES = {
  SWAG_ORDER: "swag_order",
  PRODUCTION_ORDER: "production_order",
  MANUAL_ADJUSTMENT: "manual_adjustment",
  PURCHASE_ORDER: "purchase_order",
  RETURN_ORDER: "return_order",
};

const InventoryTransactionSchema = new mongoose.Schema(
  {
    // === SKU INFO ===
    skuVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkuVariant",
      required: true,
      index: true,
    },
    sku: { type: String, required: true, index: true },
    productName: { type: String, required: true },

    // === TRANSACTION TYPE ===
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
      index: true,
    },

    // === QUANTITY ===
    quantityBefore: { type: Number, required: true },
    quantityChange: { type: Number, required: true }, // Positive or negative
    quantityAfter: { type: Number, required: true },

    // === REFERENCE ===
    referenceType: {
      type: String,
      enum: Object.values(REFERENCE_TYPES),
      required: true,
      index: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    referenceNumber: { type: String }, // Order number, PO number, etc.

    // === COST (for COGS calculation) ===
    unitCost: { type: Number }, // Cost per unit
    totalCost: { type: Number }, // unitCost * abs(quantityChange)

    // === LOCATION ===
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    warehouseName: { type: String },

    // === METADATA ===
    reason: { type: String }, // Lý do điều chỉnh
    notes: { type: String },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === BATCH/LOT TRACKING (optional) ===
    batchNumber: { type: String },
    lotNumber: { type: String },
    expiryDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
InventoryTransactionSchema.index({ skuVariant: 1, createdAt: -1 });
InventoryTransactionSchema.index({ referenceId: 1, referenceType: 1 });
InventoryTransactionSchema.index({ type: 1, createdAt: -1 });
InventoryTransactionSchema.index({ sku: 1, createdAt: -1 });

// === VIRTUALS ===
InventoryTransactionSchema.virtual("isIncrease").get(function () {
  return this.quantityChange > 0;
});

InventoryTransactionSchema.virtual("isDecrease").get(function () {
  return this.quantityChange < 0;
});

InventoryTransactionSchema.virtual("absoluteChange").get(function () {
  return Math.abs(this.quantityChange);
});

// === METHODS ===
InventoryTransactionSchema.methods.calculateCost = function () {
  if (this.unitCost) {
    this.totalCost = this.unitCost * Math.abs(this.quantityChange);
  }
  return this.totalCost;
};

// === PRE-SAVE ===
InventoryTransactionSchema.pre("save", function (next) {
  // Auto-calculate total cost if unit cost is provided
  if (this.unitCost && !this.totalCost) {
    this.totalCost = this.unitCost * Math.abs(this.quantityChange);
  }

  next();
});

// === STATICS ===
InventoryTransactionSchema.statics.recordTransaction = async function (data) {
  const transaction = new this({
    skuVariant: data.skuVariantId,
    sku: data.sku,
    productName: data.productName,
    type: data.type,
    quantityBefore: data.quantityBefore,
    quantityChange: data.quantityChange,
    quantityAfter: data.quantityBefore + data.quantityChange,
    referenceType: data.referenceType,
    referenceId: data.referenceId,
    referenceNumber: data.referenceNumber,
    unitCost: data.unitCost,
    warehouse: data.warehouseId,
    warehouseName: data.warehouseName,
    reason: data.reason,
    notes: data.notes,
    performedBy: data.performedBy,
    batchNumber: data.batchNumber,
    lotNumber: data.lotNumber,
    expiryDate: data.expiryDate,
  });

  return await transaction.save();
};

InventoryTransactionSchema.statics.findBySkuVariant = function (
  skuVariantId,
  options = {}
) {
  const query = { skuVariant: skuVariantId };

  if (options.type) {
    query.type = options.type;
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      query.createdAt.$gte = options.startDate;
    }
    if (options.endDate) {
      query.createdAt.$lte = options.endDate;
    }
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate("performedBy", "displayName email");
};

InventoryTransactionSchema.statics.findByReference = function (
  referenceId,
  referenceType
) {
  return this.find({
    referenceId,
    referenceType,
  })
    .sort({ createdAt: -1 })
    .populate("skuVariant", "sku name")
    .populate("performedBy", "displayName email");
};

InventoryTransactionSchema.statics.calculateCOGS = async function (
  skuVariantId,
  startDate,
  endDate
) {
  const transactions = await this.find({
    skuVariant: skuVariantId,
    type: TRANSACTION_TYPES.SALE,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return transactions.reduce((sum, t) => sum + (t.totalCost || 0), 0);
};

InventoryTransactionSchema.statics.getInventoryMovement = async function (
  skuVariantId,
  startDate,
  endDate
) {
  const transactions = await this.find({
    skuVariant: skuVariantId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ createdAt: 1 });

  const movement = {
    startingQuantity: transactions[0]?.quantityBefore || 0,
    endingQuantity:
      transactions[transactions.length - 1]?.quantityAfter ||
      transactions[0]?.quantityBefore ||
      0,
    totalIn: 0,
    totalOut: 0,
    transactions: [],
  };

  transactions.forEach((t) => {
    if (t.quantityChange > 0) {
      movement.totalIn += t.quantityChange;
    } else {
      movement.totalOut += Math.abs(t.quantityChange);
    }

    movement.transactions.push({
      date: t.createdAt,
      type: t.type,
      change: t.quantityChange,
      balance: t.quantityAfter,
      reference: t.referenceNumber,
    });
  });

  return movement;
};

export const InventoryTransaction =
  mongoose.models.InventoryTransaction ||
  mongoose.model("InventoryTransaction", InventoryTransactionSchema);
export { TRANSACTION_TYPES, REFERENCE_TYPES };
