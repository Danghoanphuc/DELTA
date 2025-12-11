// src/modules/swag-orders/swag-order.model.js
// ✅ Swag Order Model - Đơn hàng gửi quà (SwagUp-style)

import mongoose from "mongoose";

const SWAG_ORDER_STATUS = {
  DRAFT: "draft",
  PENDING_INFO: "pending_info", // Chờ người nhận điền thông tin
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  PROCESSING: "processing",
  KITTING: "kitting", // Đang đóng gói
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  FAILED: "failed",
};

const SHIPMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  FAILED: "failed",
  RETURNED: "returned",
};

// Schema cho từng người nhận trong order
const RecipientShipmentSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipient",
      required: true,
    },
    // Snapshot thông tin người nhận
    recipientInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },

    // Địa chỉ giao hàng
    shippingAddress: {
      street: { type: String },
      ward: { type: String },
      district: { type: String },
      city: { type: String },
      country: { type: String, default: "Vietnam" },
      postalCode: { type: String },
      isVerified: { type: Boolean, default: false },
    },

    // Size selections (cho apparel)
    sizeSelections: {
      type: Map,
      of: String, // productId -> size
    },

    // Personalization
    personalization: {
      name: { type: String }, // Tên in trên sản phẩm
      customText: { type: String },
    },

    // Self-service token (để người nhận tự điền thông tin)
    // ✅ FIX: Remove index here to avoid duplicate index warning
    selfServiceToken: { type: String },
    selfServiceExpiry: { type: Date },
    selfServiceCompleted: { type: Boolean, default: false },
    selfServiceCompletedAt: { type: Date },

    // Shipment tracking
    shipmentStatus: {
      type: String,
      enum: Object.values(SHIPMENT_STATUS),
      default: SHIPMENT_STATUS.PENDING,
    },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    carrier: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },

    // Delivery confirmation
    deliveryPhoto: { type: String },
    deliverySignature: { type: String },

    // Notes
    notes: { type: String },
    failureReason: { type: String },
  },
  { timestamps: true }
);

// Main Swag Order Schema
const SwagOrderSchema = new mongoose.Schema(
  {
    // === ORGANIZATION LINK ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === ORDER INFO ===
    orderNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true }, // Tên đợt gửi quà
    description: { type: String },

    // === SWAG PACK ===
    swagPack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwagPack",
      required: true,
    },
    // Snapshot pack info
    packSnapshot: {
      name: { type: String },
      items: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          productName: { type: String },
          productImage: { type: String },
          quantity: { type: Number },
          unitPrice: { type: Number },
          hasSize: { type: Boolean, default: false },
          personalized: { type: Boolean, default: false },
        },
      ],
      unitPrice: { type: Number },
    },

    // === RECIPIENTS ===
    recipientShipments: [RecipientShipmentSchema],
    totalRecipients: { type: Number, default: 0 },

    // === SHIPPING OPTIONS ===
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "overnight"],
      default: "standard",
    },
    shippingCost: { type: Number, default: 0 },

    // === SCHEDULING ===
    scheduledSendDate: { type: Date },
    sendImmediately: { type: Boolean, default: true },

    // === PRICING ===
    pricing: {
      packPrice: { type: Number, default: 0 }, // Giá mỗi pack
      totalPacksCost: { type: Number, default: 0 }, // packPrice * totalRecipients
      shippingCost: { type: Number, default: 0 },
      kittingFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    // === PAYMENT ===
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String },
    paymentIntentId: { type: String },
    paidAt: { type: Date },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(SWAG_ORDER_STATUS),
      default: SWAG_ORDER_STATUS.DRAFT,
    },

    // === STATS ===
    stats: {
      pendingInfo: { type: Number, default: 0 },
      processing: { type: Number, default: 0 },
      shipped: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },

    // === NOTIFICATIONS ===
    notifyRecipients: { type: Boolean, default: true },
    customMessage: { type: String }, // Message gửi kèm email

    // === APPROVAL (nếu cần) ===
    requiresApproval: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    // === TIMESTAMPS ===
    submittedAt: { type: Date },
    processedAt: { type: Date },
    completedAt: { type: Date },

    // === 🎨 POD CATALOG OPTIMIZATION: PRODUCTION TRACKING ===
    production: {
      productionOrders: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductionOrder",
        },
      ],
      status: {
        type: String,
        enum: ["pending", "in_production", "completed"],
        default: "pending",
      },
      startedAt: { type: Date },
      completedAt: { type: Date },

      // Kitting
      kittingStatus: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending",
      },
      kittingStartedAt: { type: Date },
      kittingCompletedAt: { type: Date },
      kittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      // QC
      qcRequired: { type: Boolean, default: false },
      qcStatus: {
        type: String,
        enum: ["pending", "passed", "failed"],
        default: "pending",
      },
      qcCheckedAt: { type: Date },
      qcCheckedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      qcPhotos: [{ type: String }],
      qcNotes: { type: String },
    },

    // === 🎨 POD CATALOG OPTIMIZATION: COST BREAKDOWN ===
    costBreakdown: {
      // Product Costs
      baseProductsCost: { type: Number, default: 0 },
      customizationCost: { type: Number, default: 0 },
      setupFees: { type: Number, default: 0 },

      // Operational Costs
      kittingFee: { type: Number, default: 0 },
      packagingCost: { type: Number, default: 0 },
      shippingCost: { type: Number, default: 0 },

      // Overhead
      handlingFee: { type: Number, default: 0 },

      // Total
      totalCost: { type: Number, default: 0 },
      totalPrice: { type: Number, default: 0 },
      grossMargin: { type: Number, default: 0 },
      marginPercentage: { type: Number, default: 0 },
    },

    // === 🎨 POD CATALOG OPTIMIZATION: DOCUMENT REFERENCES ===
    documents: {
      invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
      invoiceNumber: { type: String },
      invoiceUrl: { type: String },

      packingSlips: [
        {
          recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipient",
          },
          url: { type: String },
          generatedAt: { type: Date },
        },
      ],

      deliveryNotes: [
        {
          supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
          },
          url: { type: String },
          generatedAt: { type: Date },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
SwagOrderSchema.index({ organization: 1, status: 1 });
SwagOrderSchema.index({ organization: 1, createdAt: -1 });
SwagOrderSchema.index({ "recipientShipments.selfServiceToken": 1 });

// === VIRTUALS ===
SwagOrderSchema.virtual("completionRate").get(function () {
  if (this.totalRecipients === 0) return 0;
  return Math.round((this.stats.delivered / this.totalRecipients) * 100);
});

// === METHODS ===
SwagOrderSchema.methods.recalculateStats = function () {
  const shipments = this.recipientShipments || [];

  this.stats = {
    pendingInfo: shipments.filter(
      (s) => !s.selfServiceCompleted && s.selfServiceToken
    ).length,
    processing: shipments.filter((s) => s.shipmentStatus === "processing")
      .length,
    shipped: shipments.filter((s) =>
      ["shipped", "in_transit", "out_for_delivery"].includes(s.shipmentStatus)
    ).length,
    delivered: shipments.filter((s) => s.shipmentStatus === "delivered").length,
    failed: shipments.filter((s) => s.shipmentStatus === "failed").length,
  };

  return this.stats;
};

SwagOrderSchema.methods.calculatePricing = function () {
  const packPrice = this.packSnapshot?.unitPrice || 0;
  const totalPacksCost = packPrice * this.totalRecipients;
  const shippingCost = this.shippingCost || 0;
  const kittingFee = this.totalRecipients * 5000; // 5k/pack

  this.pricing = {
    packPrice,
    totalPacksCost,
    shippingCost,
    kittingFee,
    tax: 0,
    discount: 0,
    total: totalPacksCost + shippingCost + kittingFee,
  };

  return this.pricing;
};

// === PRE-SAVE ===
SwagOrderSchema.pre("save", function (next) {
  this.totalRecipients = this.recipientShipments?.length || 0;
  this.recalculateStats();
  next();
});

// === STATICS ===
SwagOrderSchema.statics.generateOrderNumber = async function () {
  const date = new Date();
  const prefix = `SW${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const count = await this.countDocuments({
    orderNumber: new RegExp(`^${prefix}`),
  });
  return `${prefix}${String(count + 1).padStart(5, "0")}`;
};

export const SwagOrder =
  mongoose.models.SwagOrder || mongoose.model("SwagOrder", SwagOrderSchema);
export { SWAG_ORDER_STATUS, SHIPMENT_STATUS };

// === 🎨 THREADED CHAT INTEGRATION ===
// Register order-thread integration hooks
// Note: Hooks are registered in a separate file to avoid circular dependencies
// Import and call registerOrderThreadHooks(SwagOrder) in server.ts after models are loaded
