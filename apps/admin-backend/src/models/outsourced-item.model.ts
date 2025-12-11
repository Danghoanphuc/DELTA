/**
 * OutsourcedItem Model
 *
 * Model for tracking outsourced production items to vendors
 * Used for managing vendor relationships and costs
 *
 * Requirements: 10.1, 10.4
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Outsourced item status enum
 */
export const OUTSOURCED_ITEM_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  RECEIVED: "received",
} as const;

export type OutsourcedItemStatus =
  (typeof OUTSOURCED_ITEM_STATUS)[keyof typeof OUTSOURCED_ITEM_STATUS];

/**
 * Quality check result interface
 */
export interface IQualityCheck {
  passed: boolean;
  checkedBy: Types.ObjectId;
  checkedAt: Date;
  notes?: string;
  issues?: string[];
}

/**
 * OutsourcedItem document interface
 */
export interface IOutsourcedItem extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  lineItemId: Types.ObjectId;
  processType: string;
  vendorId: Types.ObjectId;
  vendorName: string;
  cost: number;
  status: OutsourcedItemStatus;
  sentAt?: Date;
  expectedAt?: Date;
  receivedAt?: Date;
  qualityCheck?: IQualityCheck;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quality check schema
 */
const qualityCheckSchema = new Schema<IQualityCheck>(
  {
    passed: {
      type: Boolean,
      required: true,
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    checkedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    issues: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/**
 * OutsourcedItem schema
 */
const outsourcedItemSchema = new Schema<IOutsourcedItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    lineItemId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    processType: {
      type: String,
      required: true,
      trim: true,
      // e.g., 'printing', 'lamination', 'binding', 'embossing', 'foiling'
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OUTSOURCED_ITEM_STATUS),
      default: OUTSOURCED_ITEM_STATUS.PENDING,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    expectedAt: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    qualityCheck: {
      type: qualityCheckSchema,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "outsourced_items",
  }
);

// Indexes
outsourcedItemSchema.index({ orderId: 1, status: 1 });
outsourcedItemSchema.index({ vendorId: 1, status: 1 });
outsourcedItemSchema.index({ expectedAt: 1 });
outsourcedItemSchema.index({ createdAt: -1 });

/**
 * Static method to find by order
 */
outsourcedItemSchema.statics.findByOrder = function (orderId: Types.ObjectId) {
  return this.find({ orderId })
    .populate("vendorId", "name contactInfo")
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Static method to find by vendor
 */
outsourcedItemSchema.statics.findByVendor = function (
  vendorId: Types.ObjectId,
  status?: OutsourcedItemStatus
) {
  const query: Record<string, unknown> = { vendorId };
  if (status) query.status = status;

  return this.find(query)
    .populate("orderId", "orderNumber")
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Static method to get pending items for a vendor
 */
outsourcedItemSchema.statics.getPendingByVendor = function (
  vendorId: Types.ObjectId
) {
  return this.find({
    vendorId,
    status: {
      $in: [
        OUTSOURCED_ITEM_STATUS.PENDING,
        OUTSOURCED_ITEM_STATUS.SENT,
        OUTSOURCED_ITEM_STATUS.IN_PROGRESS,
      ],
    },
  })
    .populate("orderId", "orderNumber")
    .sort({ expectedAt: 1 })
    .lean();
};

/**
 * Static method to calculate total vendor cost for an order
 */
outsourcedItemSchema.statics.calculateOrderVendorCost = async function (
  orderId: Types.ObjectId
): Promise<number> {
  const result = await this.aggregate([
    { $match: { orderId: new mongoose.Types.ObjectId(orderId) } },
    {
      $group: {
        _id: null,
        totalCost: { $sum: "$cost" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalCost : 0;
};

/**
 * Instance method to mark as sent
 */
outsourcedItemSchema.methods.markAsSent = async function (
  expectedAt?: Date
): Promise<IOutsourcedItem> {
  this.status = OUTSOURCED_ITEM_STATUS.SENT;
  this.sentAt = new Date();
  if (expectedAt) this.expectedAt = expectedAt;
  return this.save();
};

/**
 * Instance method to record receipt
 */
outsourcedItemSchema.methods.recordReceipt =
  async function (): Promise<IOutsourcedItem> {
    this.status = OUTSOURCED_ITEM_STATUS.RECEIVED;
    this.receivedAt = new Date();
    return this.save();
  };

/**
 * Instance method to record quality check
 */
outsourcedItemSchema.methods.recordQualityCheck = async function (
  qcResult: Omit<IQualityCheck, "checkedAt">
): Promise<IOutsourcedItem> {
  this.qualityCheck = {
    ...qcResult,
    checkedAt: new Date(),
  };
  return this.save();
};

export const OutsourcedItem =
  (mongoose.models.OutsourcedItem as Model<IOutsourcedItem>) ||
  mongoose.model<IOutsourcedItem>("OutsourcedItem", outsourcedItemSchema);
