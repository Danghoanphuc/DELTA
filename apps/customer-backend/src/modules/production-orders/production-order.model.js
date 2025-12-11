// src/modules/production-orders/production-order.model.js
// ✅ Production Order Model - Đơn hàng sản xuất gửi cho suppliers

import mongoose from "mongoose";

const PRODUCTION_ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PRODUCTION: "in_production",
  QC_CHECK: "qc_check",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Schema cho từng item trong production order
const ProductionItemSchema = new mongoose.Schema({
  skuVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SkuVariant",
    required: true,
  },
  sku: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },

  // === CUSTOMIZATION ===
  printMethod: { type: String }, // "screen_print", "dtg", "embroidery", etc.
  printAreas: [
    {
      area: { type: String }, // "front", "back", "left_chest"
      artworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artwork",
      },
      artworkUrl: { type: String },
      colors: [{ type: String }],
    },
  ],
  personalization: {
    text: { type: String },
    font: { type: String },
    color: { type: String },
  },

  // === COSTING ===
  unitCost: { type: Number, required: true },
  setupFee: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
});

// Schema cho QC checks
const QCCheckSchema = new mongoose.Schema({
  checkDate: { type: Date, required: true, default: Date.now },
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  passed: { type: Boolean, required: true },
  photos: [{ type: String }], // URLs to QC photos
  notes: { type: String },
  issues: [{ type: String }],
});

// Schema cho status history
const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(PRODUCTION_ORDER_STATUS),
    required: true,
  },
  timestamp: { type: Date, required: true, default: Date.now },
  note: { type: String },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const ProductionOrderSchema = new mongoose.Schema(
  {
    // === LINK TO SWAG ORDER ===
    swagOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    swagOrderNumber: { type: String, required: true },

    // === PRODUCTION ORDER INFO ===
    productionOrderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // === SUPPLIER ===
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    supplierName: { type: String, required: true },
    supplierContact: {
      email: { type: String },
      phone: { type: String },
    },

    // === PRODUCTION ITEMS ===
    items: [ProductionItemSchema],

    // === SPECIFICATIONS ===
    specifications: {
      printInstructions: { type: String },
      qualityRequirements: { type: String },
      packagingInstructions: { type: String },
      specialNotes: { type: String },
    },

    // === TIMELINE ===
    orderedAt: { type: Date, default: Date.now },
    expectedCompletionDate: { type: Date },
    actualCompletionDate: { type: Date },

    // === STATUS TRACKING ===
    status: {
      type: String,
      enum: Object.values(PRODUCTION_ORDER_STATUS),
      default: PRODUCTION_ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: [StatusHistorySchema],

    // === QC ===
    qcChecks: [QCCheckSchema],
    qcRequired: { type: Boolean, default: true },

    // === DELIVERY ===
    deliveryMethod: { type: String },
    trackingNumber: { type: String },
    deliveredAt: { type: Date },

    // === COSTING ===
    estimatedCost: { type: Number, required: true },
    actualCost: { type: Number },
    costVariance: { type: Number, default: 0 },

    // === NOTES ===
    internalNotes: { type: String },
    supplierNotes: { type: String },

    // === CANCELLATION ===
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
ProductionOrderSchema.index({ swagOrder: 1 });
ProductionOrderSchema.index({ supplier: 1, status: 1 });
ProductionOrderSchema.index({ expectedCompletionDate: 1 });
ProductionOrderSchema.index({ status: 1, expectedCompletionDate: 1 });

// === VIRTUALS ===
ProductionOrderSchema.virtual("isDelayed").get(function () {
  if (
    this.status === PRODUCTION_ORDER_STATUS.COMPLETED ||
    this.status === PRODUCTION_ORDER_STATUS.CANCELLED
  ) {
    return false;
  }
  return (
    this.expectedCompletionDate && new Date() > this.expectedCompletionDate
  );
});

ProductionOrderSchema.virtual("daysUntilDue").get(function () {
  if (!this.expectedCompletionDate) return null;
  const diff = this.expectedCompletionDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

ProductionOrderSchema.virtual("latestQCCheck").get(function () {
  if (!this.qcChecks || this.qcChecks.length === 0) return null;
  return this.qcChecks[this.qcChecks.length - 1];
});

// === METHODS ===
ProductionOrderSchema.methods.updateStatus = function (
  newStatus,
  note,
  userId
) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy: userId,
  });

  // Update completion date if completed
  if (newStatus === PRODUCTION_ORDER_STATUS.COMPLETED) {
    this.actualCompletionDate = new Date();
  }

  return this.save();
};

ProductionOrderSchema.methods.addQCCheck = function (qcData) {
  this.qcChecks.push(qcData);

  // Update status based on QC result
  if (qcData.passed) {
    this.status = PRODUCTION_ORDER_STATUS.COMPLETED;
    this.actualCompletionDate = new Date();
  } else {
    this.status = PRODUCTION_ORDER_STATUS.FAILED;
  }

  return this.save();
};

ProductionOrderSchema.methods.calculateCostVariance = function () {
  if (this.actualCost) {
    this.costVariance = this.actualCost - this.estimatedCost;
  }
  return this.costVariance;
};

ProductionOrderSchema.methods.cancel = function (reason, userId) {
  this.status = PRODUCTION_ORDER_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.statusHistory.push({
    status: PRODUCTION_ORDER_STATUS.CANCELLED,
    timestamp: new Date(),
    note: reason,
    updatedBy: userId,
  });
  return this.save();
};

// === PRE-SAVE ===
ProductionOrderSchema.pre("save", function (next) {
  // Calculate cost variance if actual cost is set
  if (this.actualCost && this.estimatedCost) {
    this.costVariance = this.actualCost - this.estimatedCost;
  }
  next();
});

// === STATICS ===
ProductionOrderSchema.statics.generateProductionOrderNumber =
  async function () {
    const date = new Date();
    const prefix = `PO${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const count = await this.countDocuments({
      productionOrderNumber: new RegExp(`^${prefix}`),
    });
    return `${prefix}${String(count + 1).padStart(5, "0")}`;
  };

ProductionOrderSchema.statics.findBySupplier = function (
  supplierId,
  options = {}
) {
  const query = { supplier: supplierId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .sort({ expectedCompletionDate: 1 })
    .populate("swagOrder", "orderNumber name")
    .populate("supplier", "name contact");
};

ProductionOrderSchema.statics.findDelayed = function () {
  return this.find({
    status: {
      $in: [
        PRODUCTION_ORDER_STATUS.PENDING,
        PRODUCTION_ORDER_STATUS.CONFIRMED,
        PRODUCTION_ORDER_STATUS.IN_PRODUCTION,
      ],
    },
    expectedCompletionDate: { $lt: new Date() },
  })
    .sort({ expectedCompletionDate: 1 })
    .populate("swagOrder", "orderNumber name")
    .populate("supplier", "name contact");
};

export const ProductionOrder =
  mongoose.models.ProductionOrder ||
  mongoose.model("ProductionOrder", ProductionOrderSchema);
export { PRODUCTION_ORDER_STATUS };
