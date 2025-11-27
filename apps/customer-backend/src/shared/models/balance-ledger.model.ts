// apps/customer-backend/src/shared/models/balance-ledger.model.js
import mongoose, { Schema } from "mongoose";

// ✅ FIX: Định nghĩa Constants nội bộ
const BalanceLedgerStatus = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

const BalanceTransactionType = {
  SALE: "SALE",
  PAYOUT: "PAYOUT",
  REFUND: "REFUND",
  ADJUSTMENT: "ADJUSTMENT",
};

const BalanceLedgerSchema = new Schema({
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
        index: true,
    },
    amount: {
        type: Number,
        required: true,
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
        enum: ["STRIPE", "VNPAY", "MANUAL", "MOMO"],
    },
    notes: {
        type: String,
        trim: true,
    },
    paidAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
    collection: "balance_ledgers",
});

BalanceLedgerSchema.index({ printer: 1, status: 1, transactionType: 1 });

BalanceLedgerSchema.index({ subOrder: 1, transactionType: 1 }, {
    unique: true,
    partialFilterExpression: {
        transactionType: BalanceTransactionType.SALE,
    },
});

const BalanceLedgerModel = mongoose.model("BalanceLedger", BalanceLedgerSchema);
export default BalanceLedgerModel;