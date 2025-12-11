/**
 * DebtLedger Model
 *
 * Model for customer debt transaction history
 * Used for tracking all debt-related transactions (orders, payments, adjustments)
 *
 * Requirements: 8.5
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Transaction type enum
 */
export const DEBT_TRANSACTION_TYPE = {
  ORDER: "order",
  PAYMENT: "payment",
  ADJUSTMENT: "adjustment",
  REFUND: "refund",
} as const;

export type DebtTransactionType =
  (typeof DEBT_TRANSACTION_TYPE)[keyof typeof DEBT_TRANSACTION_TYPE];

/**
 * DebtLedger document interface
 */
export interface IDebtLedger extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  transactionType: DebtTransactionType;
  orderId?: Types.ObjectId;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  dueDate?: Date;
  paidDate?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

/**
 * DebtLedger schema
 */
const debtLedgerSchema = new Schema<IDebtLedger>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(DEBT_TRANSACTION_TYPE),
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      // Positive for ORDER (debt increase), negative for PAYMENT/REFUND (debt decrease)
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    paidDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    collection: "debt_ledgers",
  }
);

// Compound index for customerId + createdAt (for efficient history queries)
debtLedgerSchema.index({ customerId: 1, createdAt: -1 });
debtLedgerSchema.index({ transactionType: 1, createdAt: -1 });
debtLedgerSchema.index({ dueDate: 1 });

// Unique index to prevent duplicate order transactions
debtLedgerSchema.index(
  { orderId: 1, transactionType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      transactionType: DEBT_TRANSACTION_TYPE.ORDER,
    },
  }
);

/**
 * Static method to get customer transaction history
 */
debtLedgerSchema.statics.getCustomerHistory = function (
  customerId: Types.ObjectId,
  options: {
    limit?: number;
    skip?: number;
    startDate?: Date;
    endDate?: Date;
    transactionType?: DebtTransactionType;
  } = {}
) {
  const { limit = 50, skip = 0, startDate, endDate, transactionType } = options;

  const query: Record<string, unknown> = { customerId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
    if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
  }

  if (transactionType) {
    query.transactionType = transactionType;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("orderId", "orderNumber")
    .populate("createdBy", "displayName email")
    .lean();
};

/**
 * Static method to calculate customer debt from ledger
 */
debtLedgerSchema.statics.calculateCustomerDebt = async function (
  customerId: Types.ObjectId
): Promise<number> {
  const result = await this.aggregate([
    { $match: { customerId: new mongoose.Types.ObjectId(customerId) } },
    {
      $group: {
        _id: null,
        totalDebt: { $sum: "$amount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalDebt : 0;
};

/**
 * Static method to get overdue transactions
 */
debtLedgerSchema.statics.getOverdueTransactions = function (
  customerId?: Types.ObjectId
) {
  const query: Record<string, unknown> = {
    transactionType: DEBT_TRANSACTION_TYPE.ORDER,
    dueDate: { $lt: new Date() },
    paidDate: { $exists: false },
  };

  if (customerId) {
    query.customerId = customerId;
  }

  return this.find(query)
    .sort({ dueDate: 1 })
    .populate("customerId", "name email")
    .populate("orderId", "orderNumber")
    .lean();
};

/**
 * Static method to record order transaction
 */
debtLedgerSchema.statics.recordOrderTransaction = async function (
  customerId: Types.ObjectId,
  orderId: Types.ObjectId,
  amount: number,
  currentBalance: number,
  createdBy: Types.ObjectId,
  dueDate?: Date,
  notes?: string
): Promise<IDebtLedger> {
  return this.create({
    customerId,
    transactionType: DEBT_TRANSACTION_TYPE.ORDER,
    orderId,
    amount,
    balanceBefore: currentBalance,
    balanceAfter: currentBalance + amount,
    dueDate,
    notes,
    createdBy,
  });
};

/**
 * Static method to record payment transaction
 */
debtLedgerSchema.statics.recordPaymentTransaction = async function (
  customerId: Types.ObjectId,
  amount: number,
  currentBalance: number,
  createdBy: Types.ObjectId,
  notes?: string
): Promise<IDebtLedger> {
  return this.create({
    customerId,
    transactionType: DEBT_TRANSACTION_TYPE.PAYMENT,
    amount: -Math.abs(amount), // Payments are negative (reduce debt)
    balanceBefore: currentBalance,
    balanceAfter: currentBalance - Math.abs(amount),
    paidDate: new Date(),
    notes,
    createdBy,
  });
};

export const DebtLedger =
  (mongoose.models.DebtLedger as Model<IDebtLedger>) ||
  mongoose.model<IDebtLedger>("DebtLedger", debtLedgerSchema);
