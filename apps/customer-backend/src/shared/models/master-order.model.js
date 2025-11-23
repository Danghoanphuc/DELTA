// apps/customer-backend/src/shared/models/master-order.model.js
import mongoose from "mongoose";
import {
  MASTER_ORDER_STATUS,
  SUB_ORDER_STATUS,
  PAYMENT_STATUS,
} from "@printz/types"; // Import hằng số từ types (sẽ tạo ở file types)

// === ĐƠN HÀNG CON (LỒNG GHÉP) ===
// Thực thi IPrinterOrder và các trường hoa hồng đã thống nhất
const PrinterOrderSchema = new mongoose.Schema({
  printerProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PrinterProfile", // Ref tới PrinterProfile
    required: true,
  },
  printerBusinessName: { type: String, required: true },

  // Thông tin Stripe của nhà in (để thực hiện Transfer)
  stripeAccountId: { type: String },

  // Danh sách sản phẩm của nhà in này
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String, required: true },
      thumbnailUrl: { type: String }, // Snapshot ảnh
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true }, // Giá đã tính (bao gồm customization)
      designFileUrl: { type: String },
      options: { type: Map, of: String },
      subtotal: { type: Number, required: true },
    },
  ],

  // --- Thông tin tài chính & Chia tiền (QUAN TRỌNG) ---
  printerTotalPrice: { type: Number, required: true }, // Tổng tiền các items

  /**
   * % hoa hồng thực tế đã áp dụng (lưu vết để kiểm toán)
   * (Lấy từ standardCommissionRate hoặc commissionOverride)
   */
  appliedCommissionRate: { type: Number, required: true, min: 0, max: 1 },

  /**
   * Phí hoa hồng PrintZ nhận (tính bằng printerTotalPrice * appliedCommissionRate)
   */
  commissionFee: { type: Number, required: true, min: 0 },

  /**
   * Tiền nhà in thực nhận (tính bằng printerTotalPrice - commissionFee)
   * Đây là số tiền sẽ được Transfer
   */
  printerPayout: { type: Number, required: true, min: 0 },
  // --- Kết thúc ---

  printerStatus: {
    type: String,
    enum: Object.values(SUB_ORDER_STATUS),
    default: SUB_ORDER_STATUS.PENDING,
  },
  // ✅ NEW: Trạng thái File In (Artwork Status) - Quan trọng cho W2P
  artworkStatus: {
    type: String,
    enum: ["pending_upload", "pending_approval", "approved", "rejected"],
    default: "pending_upload",
  },
  
  // ✅ OBJECTIVE 2: Proof Files (Hỗ trợ nhiều file proof với versioning)
  proofFiles: [
    {
      url: { type: String, required: true },
      version: { type: Number, required: true }, // v1, v2, v3...
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fileType: { type: String }, // 'image/png', 'application/pdf'
      fileName: { type: String },
      status: {
        type: String,
        enum: ["current", "superseded", "rejected"],
        default: "current",
      },
    },
  ],
  
  // ✅ OBJECTIVE 2: Rejection history (audit trail)
  rejectionHistory: [
    {
      rejectedAt: { type: Date, default: Date.now },
      reason: { type: String, required: true, maxlength: 500 },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  
  // ✅ OBJECTIVE 2: Approval tracking
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // ✅ NEW: Ghi chú nội bộ của nhà in
  printerNotes: { type: String, maxlength: 2000 },
  shippingCode: { type: String },
  shippedAt: { type: Date },
  completedAt: { type: Date },
});

// === ĐƠN HÀNG CHA (MODEL CHÍNH) ===
// Thực thi IOrder
const MasterOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },

    // Mảng các đơn hàng con
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

    // --- Thông tin tài chính tổng ---
    totalAmount: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    totalPrice: { type: Number, required: true }, // Tổng tiền khách trả
    totalCommission: { type: Number, required: true }, // Tổng hoa hồng PrintZ
    totalPayout: { type: Number, required: true }, // Tổng trả cho nhà in
    // --- Kết thúc ---

    // --- Thông tin thanh toán Stripe ---
    paymentIntentId: { type: String, index: true },

    // --- PayOS Integration ---
    orderCode: { type: Number, unique: true, sparse: true }, // sparse: true để cho phép null/undefined cho các đơn hàng cũ hoặc payment method khác
    
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paidAt: { type: Date },
    // --- Kết thúc ---

    masterStatus: {
      type: String,
      enum: Object.values(MASTER_ORDER_STATUS),
      default: MASTER_ORDER_STATUS.PENDING_PAYMENT,
      index: true,
    },

    // ✅ RUSH ORDER FIELDS
    isRushOrder: {
      type: Boolean,
      default: false,
      index: true,
    },
    requiredDeadline: {
      type: Date,
    },
    rushFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export const MasterOrder = mongoose.model("MasterOrder", MasterOrderSchema);
