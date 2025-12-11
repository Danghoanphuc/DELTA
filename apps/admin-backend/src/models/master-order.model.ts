import mongoose, { Schema, Document, Model } from "mongoose";
import {
  MASTER_ORDER_STATUS,
  SUB_ORDER_STATUS,
  PAYMENT_STATUS,
  IOrder,
  IMasterOrder,
} from "@printz/types";

// Interfaces to ensure type safety
export interface IPrinterOrderSchema
  extends Omit<IOrder, "_id" | "items" | "status">,
    Document {
  items: {
    productId?: mongoose.Types.ObjectId;
    productName: string;
    thumbnailUrl?: string;
    quantity: number;
    unitPrice: number;
    designFileUrl?: string;
    options?: Map<string, string>;
    subtotal: number;
  }[];
  printerTotalPrice: number;
  printerStatus: string;
  artworkStatus: string;
  proofFiles: {
    url: string;
    version: number;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
    fileType: string;
    fileName: string;
    status: string;
  }[];
  rejectionHistory: {
    rejectedAt: Date;
    reason: string;
    rejectedBy: mongoose.Types.ObjectId;
  }[];
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  printerNotes?: string;
  shippingCode?: string;
  shippedAt?: Date;
  completedAt?: Date;
}

export interface IMasterOrderSchema
  extends Omit<IMasterOrder, "_id" | "orders" | "status">,
    Document {
  printerOrders: IPrinterOrderSchema[];
  customerName: string;
  customerNotes?: string;
  masterStatus: string;
  orderCode?: number;
  paidAt?: Date;
  // Shipper assignment
  assignedShipperId?: mongoose.Types.ObjectId;
  shipperAssignedAt?: Date;
  shipperAssignedBy?: mongoose.Types.ObjectId;
}

export type MasterOrderDocument = IMasterOrderSchema;

// === ĐƠN HÀNG CON (LỒNG GHÉP) ===
const PrinterOrderSchema = new Schema<IPrinterOrderSchema>({
  printer: {
    type: Schema.Types.ObjectId,
    ref: "PrinterProfile",
    required: true,
  },
  printerBusinessName: { type: String, required: true },
  stripeAccountId: { type: String },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
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
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
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
      rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  printerNotes: { type: String, maxlength: 2000 },
  shippingCode: { type: String },
  shippedAt: { type: Date },
  completedAt: { type: Date },
});

// === ĐƠN HÀNG CHA (MODEL CHÍNH) ===
const MasterOrderSchema = new Schema<IMasterOrderSchema>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
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
    // Shipper assignment for delivery
    assignedShipperId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    shipperAssignedAt: { type: Date },
    shipperAssignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const MasterOrder =
  (mongoose.models.MasterOrder as Model<MasterOrderDocument>) ||
  mongoose.model<MasterOrderDocument>("MasterOrder", MasterOrderSchema);
