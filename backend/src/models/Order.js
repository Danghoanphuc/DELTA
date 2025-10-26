// backend/src/models/Order.js (ĐÃ SỬA LỖI)
import mongoose from "mongoose"; // <--- BƯỚC 1: THÊM IMPORT

const OrderSchema = new mongoose.Schema(
  {
    // --- Người đặt ---
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Chi tiết đơn hàng ---
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        quantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
        specifications: Object, // Lưu snapshot thông số
        customization: {
          notes: String,
          designFiles: [{ url: String, fileName: String }],
        },
        subtotal: Number,
      },
    ],

    // --- Tổng tiền ---
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // --- Địa chỉ giao hàng ---
    shippingAddress: {
      recipientName: String,
      phone: String,
      street: String,
      ward: String,
      district: String,
      city: String,
      notes: String,
    },

    // --- Trạng thái ---
    status: {
      type: String,
      enum: [
        "pending", // Chờ xác nhận
        "confirmed", // Đã xác nhận
        "designing", // Đang thiết kế
        "printing", // Đang in
        "ready", // Sẵn sàng giao
        "shipping", // Đang giao
        "completed", // Hoàn thành
        "cancelled", // Đã hủy
        "refunded", // Đã hoàn tiền
      ],
      default: "pending",
    },

    // --- Lịch sử trạng thái ---
    statusHistory: [
      {
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Thanh toán ---
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

    // --- Thời gian ---
    estimatedDelivery: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ customerId: 1, status: 1 });
OrderSchema.index({ printerId: 1, status: 1 });

// --- (BƯỚC 2 & 3: TẠO VÀ EXPORT MODEL) ---
export const Order = mongoose.model("Order", OrderSchema);

// (BƯỚC 4: ĐÃ XÓA DẤU } THỪA)
