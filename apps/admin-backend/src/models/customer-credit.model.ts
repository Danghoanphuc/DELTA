/**
 * CustomerCredit Model
 *
 * Model for customer credit limit and debt tracking
 * Used for credit limit enforcement and debt management
 *
 * Requirements: 8.1, 11.1
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Payment pattern enum
 */
export const PAYMENT_PATTERN = {
  GOOD: "good",
  AVERAGE: "average",
  POOR: "poor",
} as const;

export type PaymentPattern =
  (typeof PAYMENT_PATTERN)[keyof typeof PAYMENT_PATTERN];

/**
 * Credit limit change interface
 */
export interface ICreditLimitChange {
  previousLimit: number;
  newLimit: number;
  changedBy: Types.ObjectId;
  changedAt: Date;
  reason?: string;
}

/**
 * CustomerCredit document interface
 */
export interface ICustomerCredit extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  creditLimit: number;
  currentDebt: number;
  overdueAmount: number;
  lastPaymentDate?: Date;
  paymentPattern: PaymentPattern;
  isBlocked: boolean;
  blockReason?: string;
  creditHistory: ICreditLimitChange[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Credit limit change schema
 */
const creditLimitChangeSchema = new Schema<ICreditLimitChange>(
  {
    previousLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    newLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

/**
 * CustomerCredit schema
 */
const customerCreditSchema = new Schema<ICustomerCredit>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
      unique: true,
      index: true,
    },
    creditLimit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currentDebt: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    overdueAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lastPaymentDate: {
      type: Date,
    },
    paymentPattern: {
      type: String,
      enum: Object.values(PAYMENT_PATTERN),
      default: PAYMENT_PATTERN.GOOD,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      trim: true,
    },
    creditHistory: {
      type: [creditLimitChangeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "customer_credits",
  }
);

// Indexes
customerCreditSchema.index({ currentDebt: -1 });
customerCreditSchema.index({ overdueAmount: -1 });
customerCreditSchema.index({ paymentPattern: 1 });
customerCreditSchema.index({ isBlocked: 1 });

/**
 * Virtual for available credit
 */
customerCreditSchema.virtual("availableCredit").get(function () {
  return Math.max(0, this.creditLimit - this.currentDebt);
});

/**
 * Instance method to check if credit is available for an order
 */
customerCreditSchema.methods.checkCreditAvailability = function (
  orderAmount: number
): {
  allowed: boolean;
  currentDebt: number;
  creditLimit: number;
  orderAmount: number;
  shortfall?: number;
  message: string;
} {
  const totalDebtAfterOrder = this.currentDebt + orderAmount;
  const allowed = totalDebtAfterOrder <= this.creditLimit;

  return {
    allowed,
    currentDebt: this.currentDebt,
    creditLimit: this.creditLimit,
    orderAmount,
    shortfall: allowed ? undefined : totalDebtAfterOrder - this.creditLimit,
    message: allowed
      ? "Đủ hạn mức tín dụng"
      : `Vượt hạn mức tín dụng. Công nợ hiện tại: ${this.currentDebt.toLocaleString()}đ, Hạn mức: ${this.creditLimit.toLocaleString()}đ, Thiếu: ${(
          totalDebtAfterOrder - this.creditLimit
        ).toLocaleString()}đ`,
  };
};

/**
 * Instance method to update credit limit with audit trail
 */
customerCreditSchema.methods.updateCreditLimit = async function (
  newLimit: number,
  changedBy: Types.ObjectId,
  reason?: string
): Promise<ICustomerCredit> {
  const previousLimit = this.creditLimit;

  this.creditHistory.push({
    previousLimit,
    newLimit,
    changedBy,
    changedAt: new Date(),
    reason,
  });

  this.creditLimit = newLimit;

  // Unblock if new limit covers current debt
  if (this.isBlocked && newLimit >= this.currentDebt) {
    this.isBlocked = false;
    this.blockReason = undefined;
  }

  return this.save();
};

/**
 * Instance method to add debt
 */
customerCreditSchema.methods.addDebt = async function (
  amount: number
): Promise<ICustomerCredit> {
  this.currentDebt += amount;

  // Check if should be blocked
  if (this.currentDebt > this.creditLimit) {
    this.isBlocked = true;
    this.blockReason = "Vượt hạn mức tín dụng";
  }

  return this.save();
};

/**
 * Instance method to record payment
 */
customerCreditSchema.methods.recordPayment = async function (
  amount: number
): Promise<ICustomerCredit> {
  this.currentDebt = Math.max(0, this.currentDebt - amount);
  this.overdueAmount = Math.max(0, this.overdueAmount - amount);
  this.lastPaymentDate = new Date();

  // Unblock if debt is now within limit
  if (this.isBlocked && this.currentDebt <= this.creditLimit) {
    this.isBlocked = false;
    this.blockReason = undefined;
  }

  return this.save();
};

/**
 * Static method to find or create credit record for customer
 */
customerCreditSchema.statics.findOrCreateByCustomer = async function (
  customerId: Types.ObjectId,
  defaultCreditLimit: number = 0
): Promise<ICustomerCredit> {
  let credit = await this.findOne({ customerId });

  if (!credit) {
    credit = await this.create({
      customerId,
      creditLimit: defaultCreditLimit,
    });
  }

  return credit;
};

export const CustomerCredit =
  (mongoose.models.CustomerCredit as Model<ICustomerCredit>) ||
  mongoose.model<ICustomerCredit>("CustomerCredit", customerCreditSchema);
