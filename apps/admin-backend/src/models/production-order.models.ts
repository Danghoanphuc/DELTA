// apps/admin-backend/src/models/production-order.models.ts
// ✅ Production Order Management Models
// Phase 1.1.2 & Phase 5: Production Order Management

import mongoose, { Schema, Document } from "mongoose";

// ============================================
// PRODUCTION ORDER STATUS
// ============================================

export const PRODUCTION_ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PRODUCTION: "IN_PRODUCTION",
  QC_CHECK: "QC_CHECK",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

// ============================================
// PRODUCTION ORDER INTERFACE
// ============================================

export interface IProductionOrder extends Document {
  // Link to Swag Order
  swagOrderId: mongoose.Types.ObjectId;
  swagOrderNumber: string;

  // Supplier
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  supplierContact: {
    email: string;
    phone: string;
  };

  // Production Items
  items: {
    skuVariantId: mongoose.Types.ObjectId;
    sku: string;
    productName: string;
    quantity: number;

    // Customization
    printMethod: string;
    printAreas: {
      area: string;
      artworkId: mongoose.Types.ObjectId;
      artworkUrl: string;
      colors: string[];
    }[];
    personalization?: {
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
    specialNotes?: string;
  };

  // Timeline
  orderedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate?: Date;

  // Status Tracking
  status: (typeof PRODUCTION_ORDER_STATUS)[keyof typeof PRODUCTION_ORDER_STATUS];
  statusHistory: {
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy: mongoose.Types.ObjectId;
  }[];

  // QC
  qcChecks: {
    checkDate: Date;
    checkedBy: mongoose.Types.ObjectId;
    passed: boolean;
    photos: string[];
    notes: string;
    issues: string[];
  }[];

  // Delivery
  deliveryMethod?: string;
  trackingNumber?: string;
  deliveredAt?: Date;

  // Costing
  estimatedCost: number;
  actualCost?: number;
  costVariance?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PRODUCTION ORDER SCHEMA
// ============================================

const productionOrderSchema = new Schema<IProductionOrder>(
  {
    // Link to Swag Order
    swagOrderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    swagOrderNumber: {
      type: String,
      required: true,
    },

    // Supplier
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: true,
    },
    supplierContact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // Production Items
    items: [
      {
        skuVariantId: {
          type: Schema.Types.ObjectId,
          ref: "SkuVariant",
          required: true,
        },
        sku: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },

        // Customization
        printMethod: { type: String },
        printAreas: [
          {
            area: { type: String, required: true },
            artworkId: { type: Schema.Types.ObjectId, ref: "Artwork" },
            artworkUrl: { type: String, required: true },
            colors: [{ type: String }],
          },
        ],
        personalization: {
          text: { type: String },
          font: { type: String },
          color: { type: String },
        },

        // Costing
        unitCost: { type: Number, required: true, min: 0 },
        setupFee: { type: Number, default: 0, min: 0 },
        totalCost: { type: Number, required: true, min: 0 },
      },
    ],

    // Specifications
    specifications: {
      printInstructions: { type: String, default: "" },
      qualityRequirements: { type: String, default: "" },
      packagingInstructions: { type: String, default: "" },
      specialNotes: { type: String },
    },

    // Timeline
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    expectedCompletionDate: {
      type: Date,
      required: true,
      index: true,
    },
    actualCompletionDate: {
      type: Date,
    },

    // Status Tracking
    status: {
      type: String,
      enum: Object.values(PRODUCTION_ORDER_STATUS),
      default: PRODUCTION_ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    // QC
    qcChecks: [
      {
        checkDate: { type: Date, required: true },
        checkedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        passed: { type: Boolean, required: true },
        photos: [{ type: String }],
        notes: { type: String, default: "" },
        issues: [{ type: String }],
      },
    ],

    // Delivery
    deliveryMethod: { type: String },
    trackingNumber: { type: String },
    deliveredAt: { type: Date },

    // Costing
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
    },
    costVariance: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================

productionOrderSchema.index({ swagOrderId: 1, supplierId: 1 });
productionOrderSchema.index({ status: 1, expectedCompletionDate: 1 });
productionOrderSchema.index({ createdAt: -1 });

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Add status history entry
 */
productionOrderSchema.methods.addStatusHistory = function (
  status: string,
  updatedBy: mongoose.Types.ObjectId,
  note?: string
) {
  this.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy,
  });
  this.status =
    status as (typeof PRODUCTION_ORDER_STATUS)[keyof typeof PRODUCTION_ORDER_STATUS];
};

/**
 * Add QC check
 */
productionOrderSchema.methods.addQCCheck = function (qcData: {
  checkedBy: mongoose.Types.ObjectId;
  passed: boolean;
  photos?: string[];
  notes?: string;
  issues?: string[];
}) {
  this.qcChecks.push({
    checkDate: new Date(),
    checkedBy: qcData.checkedBy,
    passed: qcData.passed,
    photos: qcData.photos || [],
    notes: qcData.notes || "",
    issues: qcData.issues || [],
  });
};

/**
 * Calculate cost variance
 */
productionOrderSchema.methods.calculateCostVariance = function () {
  if (this.actualCost !== undefined) {
    this.costVariance = this.actualCost - this.estimatedCost;
  }
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find production orders by supplier
 */
productionOrderSchema.statics.findBySupplier = function (
  supplierId: mongoose.Types.ObjectId,
  status?: string
) {
  const query: any = { supplierId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Find delayed production orders
 */
productionOrderSchema.statics.findDelayed = function () {
  return this.find({
    status: {
      $in: [
        PRODUCTION_ORDER_STATUS.PENDING,
        PRODUCTION_ORDER_STATUS.IN_PRODUCTION,
      ],
    },
    expectedCompletionDate: { $lt: new Date() },
  }).sort({ expectedCompletionDate: 1 });
};

// ============================================
// EXPORT MODEL
// ============================================

export const ProductionOrder = mongoose.model<IProductionOrder>(
  "ProductionOrder",
  productionOrderSchema
);
