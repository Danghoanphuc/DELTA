/**
 * Swag Order Model
 *
 * Model for swag orders (corporate gifting orders)
 * Includes cost breakdown and production tracking
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ISwagOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  organization: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: string;
  totalPrice: number;
  recipients: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }>;
  packSnapshot: {
    items: Array<{
      variantId: mongoose.Types.ObjectId;
      product: mongoose.Types.ObjectId;
      name: string;
      quantity: number;
      price: number;
      cost: number;
      customization?: {
        printMethod?: string;
        setupFee?: number;
        unitCost?: number;
        printAreas?: Array<{
          area: string;
          artworkId: mongoose.Types.ObjectId;
          colors: string[];
          cost?: number;
        }>;
      };
    }>;
  };
  production?: {
    productionOrders: mongoose.Types.ObjectId[];
    status: string;
    startedAt?: Date;
    completedAt?: Date;
    kittingStatus?: string;
    kittingStartedAt?: Date;
    kittingCompletedAt?: Date;
    kittedBy?: mongoose.Types.ObjectId;
    qcRequired?: boolean;
    qcStatus?: string;
    qcCheckedAt?: Date;
    qcCheckedBy?: mongoose.Types.ObjectId;
    qcPhotos?: string[];
    qcNotes?: string;
  };
  costBreakdown?: {
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
  };
  documents?: {
    invoiceId?: mongoose.Types.ObjectId;
    invoiceNumber?: string;
    invoiceUrl?: string;
    packingSlips?: Array<{
      recipientId: mongoose.Types.ObjectId;
      url: string;
      generatedAt: Date;
    }>;
    deliveryNotes?: Array<{
      supplierId: mongoose.Types.ObjectId;
      url: string;
      generatedAt: Date;
    }>;
  };
  // Dynamic fields from customer-backend
  recipientShipments?: any[];
  totalRecipients?: number;
  shippedCount?: number;
  deliveredCount?: number;
  shippedAt?: Date;
  completedAt?: Date;
  activityLog?: any[];
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  recalculateStats(): void;
}

const swagOrderSchema = new Schema<ISwagOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_info",
        "pending_payment",
        "paid",
        "processing",
        "in_production",
        "kitting",
        "ready_to_ship",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "draft",
      index: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    recipients: [
      {
        name: { type: String, required: true },
        email: String,
        phone: String,
        address: String,
      },
    ],
    recipientShipments: [
      {
        // ✅ Không có recipient reference - data đã có trong recipientInfo snapshot
        recipientInfo: {
          firstName: String,
          lastName: String,
          email: String,
          phone: String,
        },
        shippingAddress: Schema.Types.Mixed,
        selfServiceToken: String,
        selfServiceExpiry: Date,
        selfServiceCompleted: Boolean,
        personalization: Schema.Types.Mixed,
        status: String,
        trackingNumber: String,
        carrier: String,
        shippedAt: Date,
        deliveredAt: Date,
      },
    ],
    packSnapshot: {
      type: Schema.Types.Mixed, // Flexible schema to match customer-backend data
      default: { items: [] },
    },
    production: {
      productionOrders: [
        {
          type: Schema.Types.ObjectId,
          ref: "ProductionOrder",
        },
      ],
      status: {
        type: String,
        enum: ["pending", "in_production", "completed"],
      },
      startedAt: Date,
      completedAt: Date,
      kittingStatus: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
      },
      kittingStartedAt: Date,
      kittingCompletedAt: Date,
      kittedBy: Schema.Types.ObjectId,
      qcRequired: Boolean,
      qcStatus: {
        type: String,
        enum: ["pending", "passed", "failed"],
      },
      qcCheckedAt: Date,
      qcCheckedBy: Schema.Types.ObjectId,
      qcPhotos: [String],
      qcNotes: String,
    },
    costBreakdown: {
      baseProductsCost: Number,
      customizationCost: Number,
      setupFees: Number,
      kittingFee: Number,
      packagingCost: Number,
      shippingCost: Number,
      handlingFee: Number,
      totalCost: Number,
      totalPrice: Number,
      grossMargin: Number,
      marginPercentage: Number,
    },
    documents: {
      invoiceId: Schema.Types.ObjectId,
      invoiceNumber: String,
      invoiceUrl: String,
      packingSlips: [
        {
          recipientId: Schema.Types.ObjectId,
          url: String,
          generatedAt: Date,
        },
      ],
      deliveryNotes: [
        {
          supplierId: Schema.Types.ObjectId,
          url: String,
          generatedAt: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
    strict: false, // Allow fields not in schema (data from customer-backend)
  }
);

// Indexes
swagOrderSchema.index({ createdAt: -1, status: 1 });
swagOrderSchema.index({ organization: 1, createdAt: -1 });
swagOrderSchema.index({ "costBreakdown.marginPercentage": 1 });

// Instance Methods
swagOrderSchema.methods.recalculateStats = function () {
  const shipments = this.recipientShipments || [];
  const total = shipments.length;

  if (total === 0) {
    this.totalRecipients = 0;
    this.shippedCount = 0;
    this.deliveredCount = 0;
    return;
  }

  this.totalRecipients = total;
  this.shippedCount = shipments.filter(
    (s: any) =>
      s.shipmentStatus === "shipped" || s.shipmentStatus === "delivered"
  ).length;
  this.deliveredCount = shipments.filter(
    (s: any) => s.shipmentStatus === "delivered"
  ).length;

  // Update order status based on shipments
  if (this.deliveredCount === total) {
    this.status = "delivered";
    this.completedAt = new Date();
  } else if (this.shippedCount === total) {
    this.status = "shipped";
    this.shippedAt = this.shippedAt || new Date();
  }
};

export const SwagOrder = mongoose.model<ISwagOrder>(
  "SwagOrder",
  swagOrderSchema
);
