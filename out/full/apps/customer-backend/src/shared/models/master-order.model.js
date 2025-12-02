import mongoose from "mongoose";

// ✅ FIX: Định nghĩa Constants nội bộ
const MASTER_ORDER_STATUS = {
  PENDING: "pending",
  PENDING_PAYMENT: "pending_payment",
  PAID_WAITING_FOR_PRINTER: "paid_waiting_for_printer",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const SUB_ORDER_STATUS = {
  PENDING: "pending",
  PAID_WAITING_FOR_PRINTER: "paid_waiting_for_printer",
  CONFIRMED: "confirmed",
  DESIGNING: "designing",
  PRINTING: "printing",
  READY: "ready",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  UNPAID: "unpaid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const PrinterOrderSchema = new mongoose.Schema({
  printerProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrinterProfile",
    required: true,
  },
  printerBusinessName: { type: String, required: true },
  stripeAccountId: { type: String },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String, required: true },
      thumbnailUrl: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true },
      designFileUrl: { type: String },
      options: { type: Map, of: String },
      subtotal: { type: Number, required: true },
    },
  ],
  printerTotalPrice: { type: Number, required: true },
  appliedCommissionRate: { type: Number, required: true, min: 0, max: 1 },
  commissionFee: { type: Number, required: true, min: 0 },
  printerPayout: { type: Number, required: true, min: 0 },
  printerStatus: {
    type: String,
    enum: Object.values(SUB_ORDER_STATUS),
    default: SUB_ORDER_STATUS.PENDING,
  },
  artworkStatus: {
    type: String,
    enum: ["pending_upload", "pending_approval", "approved", "rejected"],
    default: "pending_upload",
  },
  proofFiles: [
    {
      url: { type: String, required: true },
      version: { type: Number, required: true },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fileType: { type: String },
      fileName: { type: String },
      status: {
        type: String,
        enum: ["current", "superseded", "rejected"],
        default: "current",
      },
    },
  ],
  rejectionHistory: [
    {
      rejectedAt: { type: Date, default: Date.now },
      reason: { type: String, required: true, maxlength: 500 },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  printerNotes: { type: String, maxlength: 2000 },
  shippingCode: { type: String },
  shippedAt: { type: Date },
  completedAt: { type: Date },
});

const MasterOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    printerOrders: [PrinterOrderSchema],
    shippingAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      ward: String,
      district: { type: String, required: true },
      city: { type: String, required: true },
      notes: String,
      // ✅ GPS Coordinates for delivery tracking (like Uber)
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: "2dsphere", // Enable geospatial queries
        },
      },
    },
    customerNotes: { type: String, maxlength: 1000 },
    totalAmount: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    totalCommission: { type: Number, required: true },
    totalPayout: { type: Number, required: true },
    paymentIntentId: { type: String, index: true },
    orderCode: { type: Number, unique: true, sparse: true },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paidAt: { type: Date },
    masterStatus: {
      type: String,
      enum: Object.values(MASTER_ORDER_STATUS),
      default: MASTER_ORDER_STATUS.PENDING_PAYMENT,
      index: true,
    },
    isRushOrder: { type: Boolean, default: false, index: true },
    requiredDeadline: { type: Date },
    rushFeeAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const MasterOrder = mongoose.model("MasterOrder", MasterOrderSchema);
