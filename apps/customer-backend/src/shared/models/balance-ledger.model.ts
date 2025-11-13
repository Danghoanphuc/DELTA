import mongoose, { Schema } from "mongoose";
import {
  IBalanceLedger,
  BalanceLedgerStatus,
  BalanceTransactionType,
} from "@printz/types"; // Import "Hợp đồng"

// Định nghĩa Schema
const BalanceLedgerSchema = new Schema<IBalanceLedger>(
  {
    printer: {
      type: Schema.Types.ObjectId,
      ref: "PrinterProfile",
      required: true,
      index: true,
    },
    masterOrder: {
      type: Schema.Types.ObjectId,
      ref: "MasterOrder",
      required: true,
      index: true,
    },
    subOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true, // Chúng ta sẽ dùng chỉ mục kết hợp bên dưới
    },
    amount: {
      type: Number,
      required: true,
      // Giá trị dương (SALE) hoặc âm (PAYOUT, REFUND)
    },
    transactionType: {
      type: String,
      enum: Object.values(BalanceTransactionType),
      required: true,
      default: BalanceTransactionType.SALE,
    },
    status: {
      type: String,
      enum: Object.values(BalanceLedgerStatus),
      required: true,
      default: BalanceLedgerStatus.UNPAID,
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: ["STRIPE", "VNPAY", "MANUAL"],
    },
    notes: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "balance_ledgers",
  }
);

// Tạo chỉ mục kết hợp để tối ưu truy vấn cho GĐ 6 (Kế toán)
BalanceLedgerSchema.index({ printer: 1, status: 1, transactionType: 1 });

/**
 * Phân tích chỉ mục (Index) quan trọng:
 * Chúng ta cần đảm bảo rằng một đơn hàng con (subOrder) chỉ có thể được
 * "ghi nợ" (SALE) một lần duy nhất, tránh việc trả lặp.
 * Tuy nhiên, chúng ta có thể có nhiều giao dịch khác (REFUND, ADJUSTMENT)
 * trên cùng subOrder đó.
 *
 * Giải pháp: Sử dụng partialFilterExpression.
 */
BalanceLedgerSchema.index(
  { subOrder: 1, transactionType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      // Chỉ mục unique này CHỈ áp dụng cho các documents
      // có transactionType là SALE.
      transactionType: BalanceTransactionType.SALE,
    },
  }
);
// Giải thích: "Chỉ cho phép một bút toán SALE duy nhất cho mỗi subOrder"
// Điều này cho phép chúng ta thêm các bút toán REFUND hoặc ADJUSTMENT sau này
// mà không vi phạm unique index.

const BalanceLedgerModel = mongoose.model<IBalanceLedger>(
  "BalanceLedger",
  BalanceLedgerSchema
);

export default BalanceLedgerModel;
