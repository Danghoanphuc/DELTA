// backend/src/shared/models/order.model.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // ============================================
    // ORDER IDENTIFICATION (✅ THÊM MỚI)
    // ============================================
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // Tối ưu truy vấn
    },

    // ============================================
    // CUSTOMER & PRINTER INFO (✅ BỔ SUNG)
    // ============================================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true, // ✅ THÊM MỚI
    },
    customerEmail: {
      type: String,
      required: true, // ✅ THÊM MỚI
    },

    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ============================================
    // ORDER ITEMS (✅ CẢI THIỆN)
    // ============================================
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String, required: true },
        printerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ THÊM MỚI
        quantity: { type: Number, required: true, min: 1 },
        pricePerUnit: { type: Number, required: true, min: 0 },
        specifications: Object,
        customization: {
          notes: String,
          designFiles: [{ url: String, fileName: String }],
        },
        subtotal: { type: Number, required: true, min: 0 },
        productSnapshot: {
          // ✅ THÊM MỚI - Lưu snapshot để tránh mất data khi product bị xóa
          images: [{ url: String, publicId: String }],
          specifications: Object,
        },
      },
    ],

    // ============================================
    // PRICING (✅ CẢI THIỆN)
    // ============================================
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    // ============================================
    // SHIPPING ADDRESS (✅ CẢI THIỆN)
    // ============================================
    shippingAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      ward: String,
      district: { type: String, required: true },
      city: { type: String, required: true },
      notes: String,
    },

    // ============================================
    // ORDER STATUS (✅ GIỮ NGUYÊN NHƯNG THÊM INDEX)
    // ============================================
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "designing",
        "printing",
        "ready",
        "shipping",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true, // ✅ THÊM INDEX
    },

    // Status history
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "designing",
            "printing",
            "ready",
            "shipping",
            "completed",
            "cancelled",
            "refunded",
          ],
        },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ============================================
    // PAYMENT INFORMATION (✅ BỔ SUNG)
    // ============================================
    payment: {
      method: {
        type: String,
        enum: ["cod", "bank-transfer", "momo", "zalopay"],
        default: "cod",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
      },
      paidAt: Date,
      transactionId: String,
    },

    // ============================================
    // NOTES (✅ THÊM MỚI)
    // ============================================
    customerNotes: {
      type: String,
      maxlength: 1000,
    },
    printerNotes: {
      type: String,
      maxlength: 1000,
    },

    // ============================================
    // TIMESTAMPS
    // ============================================
    estimatedDelivery: Date,
    completedAt: Date,
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// ============================================
// INDEXES FOR EFFICIENT QUERIES (✅ CẢI THIỆN)
// ============================================
OrderSchema.index({ customerId: 1, status: 1 });
OrderSchema.index({ printerId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ createdAt: -1 }); // ✅ THÊM MỚI - Sort by date
OrderSchema.index({ "payment.status": 1 }); // ✅ THÊM MỚI

// ============================================
// VIRTUAL FIELDS (✅ THÊM MỚI)
// ============================================
OrderSchema.virtual("isPaymentPending").get(function () {
  return this.payment.status === "pending";
});

OrderSchema.virtual("canBeCancelled").get(function () {
  return ["pending", "confirmed"].includes(this.status);
});

// Enable virtuals in JSON
OrderSchema.set("toJSON", { virtuals: true });
OrderSchema.set("toObject", { virtuals: true });

export const Order = mongoose.model("Order", OrderSchema);
