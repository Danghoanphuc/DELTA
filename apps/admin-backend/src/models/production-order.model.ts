/**
 * Production Order Model
 *
 * Model for production orders sent to suppliers
 * Includes cost tracking and QC workflow
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IProductionOrder extends Document {
  _id: mongoose.Types.ObjectId;
  swagOrderId: mongoose.Types.ObjectId;
  swagOrderNumber: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  supplierContact: {
    email: string;
    phone: string;
  };
  items: Array<{
    skuVariantId: mongoose.Types.ObjectId;
    sku: string;
    productName: string;
    quantity: number;
    printMethod?: string;
    printAreas?: Array<{
      area: string;
      artworkId: mongoose.Types.ObjectId;
      artworkUrl: string;
      colors: string[];
    }>;
    personalization?: {
      text: string;
      font: string;
      color: string;
    };
    unitCost: number;
    setupFee: number;
    totalCost: number;
  }>;
  specifications: {
    printInstructions?: string;
    qualityRequirements?: string;
    packagingInstructions?: string;
    specialNotes?: string;
  };
  orderedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate?: Date;
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy: mongoose.Types.ObjectId;
  }>;
  qcChecks: Array<{
    checkDate: Date;
    checkedBy: mongoose.Types.ObjectId;
    passed: boolean;
    photos: string[];
    notes?: string;
    issues: string[];
  }>;
  deliveryMethod?: string;
  trackingNumber?: string;
  deliveredAt?: Date;
  estimatedCost: number;
  actualCost?: number;
  costVariance?: number;
  actualCostBreakdown?: {
    materials: number;
    labor: number;
    overhead: number;
  };
  estimatedCostBreakdown?: {
    materials: number;
    labor: number;
    overhead: number;
  };
  costNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productionOrderSchema = new Schema<IProductionOrder>(
  {
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
      email: String,
      phone: String,
    },
    items: [
      {
        skuVariantId: {
          type: Schema.Types.ObjectId,
          ref: "SkuVariant",
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        printMethod: String,
        printAreas: [
          {
            area: String,
            artworkId: Schema.Types.ObjectId,
            artworkUrl: String,
            colors: [String],
          },
        ],
        personalization: {
          text: String,
          font: String,
          color: String,
        },
        unitCost: {
          type: Number,
          required: true,
        },
        setupFee: {
          type: Number,
          default: 0,
        },
        totalCost: {
          type: Number,
          required: true,
        },
      },
    ],
    specifications: {
      printInstructions: String,
      qualityRequirements: String,
      packagingInstructions: String,
      specialNotes: String,
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    expectedCompletionDate: {
      type: Date,
      required: true,
    },
    actualCompletionDate: Date,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_production",
        "qc_check",
        "completed",
        "failed",
      ],
      default: "pending",
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: Schema.Types.ObjectId,
      },
    ],
    qcChecks: [
      {
        checkDate: {
          type: Date,
          default: Date.now,
        },
        checkedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        passed: {
          type: Boolean,
          required: true,
        },
        photos: [String],
        notes: String,
        issues: [String],
      },
    ],
    deliveryMethod: String,
    trackingNumber: String,
    deliveredAt: Date,
    estimatedCost: {
      type: Number,
      required: true,
      default: 0,
    },
    actualCost: Number,
    costVariance: Number,
    actualCostBreakdown: {
      materials: Number,
      labor: Number,
      overhead: Number,
    },
    estimatedCostBreakdown: {
      materials: Number,
      labor: Number,
      overhead: Number,
    },
    costNotes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
productionOrderSchema.index({ status: 1, expectedCompletionDate: 1 });
productionOrderSchema.index({ costVariance: 1 });

// Pre-save hook to update status history
productionOrderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: undefined,
      updatedBy: undefined as any,
    });
  }
  next();
});

export const ProductionOrder = (mongoose.models.ProductionOrder ||
  mongoose.model<IProductionOrder>(
    "ProductionOrder",
    productionOrderSchema
  )) as mongoose.Model<IProductionOrder>;
