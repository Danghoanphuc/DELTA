// apps/admin-backend/src/models/invoice.models.ts
// ✅ Invoice & Document Management Models
// Phase 1.1.3 & Phase 7: Document Management

import mongoose, { Schema, Document } from "mongoose";

// ============================================
// INVOICE STATUS & PAYMENT STATUS
// ============================================

export const INVOICE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  REFUNDED: "refunded",
} as const;

// ============================================
// INVOICE INTERFACE
// ============================================

export interface IInvoice extends Document {
  // Reference
  invoiceNumber: string;
  swagOrderId: mongoose.Types.ObjectId;
  swagOrderNumber: string;

  // Customer
  organizationId: mongoose.Types.ObjectId;
  billingInfo: {
    businessName: string;
    taxCode: string;
    address: string;
    email: string;
    phone: string;
  };

  // Line Items
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
  }[];

  // Totals
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;

  // Payment
  paymentStatus: keyof typeof PAYMENT_STATUS;
  paymentMethod?: string;
  paidAmount: number;
  paidAt?: Date;

  // Dates
  issueDate: Date;
  dueDate: Date;

  // Files
  pdfUrl?: string;

  // Status
  status: keyof typeof INVOICE_STATUS;

  // Credit Notes (for refunds)
  creditNotes: {
    creditNoteNumber: string;
    amount: number;
    reason: string;
    issuedAt: Date;
    pdfUrl?: string;
  }[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// INVOICE SCHEMA
// ============================================

const invoiceSchema = new Schema<IInvoice>(
  {
    // Reference
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    swagOrderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    swagOrderNumber: {
      type: String,
      required: true,
    },

    // Customer
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    billingInfo: {
      businessName: { type: String, required: true },
      taxCode: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // Line Items
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        amount: { type: Number, required: true, min: 0 },
        taxRate: { type: Number, default: 0, min: 0, max: 100 },
        taxAmount: { type: Number, default: 0, min: 0 },
      },
    ],

    // Totals
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAt: {
      type: Date,
    },

    // Dates
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Files
    pdfUrl: {
      type: String,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.DRAFT,
      index: true,
    },

    // Credit Notes
    creditNotes: [
      {
        creditNoteNumber: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        reason: { type: String, required: true },
        issuedAt: { type: Date, default: Date.now },
        pdfUrl: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================

invoiceSchema.index({ organizationId: 1, status: 1 });
invoiceSchema.index({ paymentStatus: 1, dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Mark invoice as paid
 */
invoiceSchema.methods.markAsPaid = function (
  paymentMethod: string,
  amount?: number
) {
  this.paymentStatus = PAYMENT_STATUS.PAID;
  this.status = INVOICE_STATUS.PAID;
  this.paymentMethod = paymentMethod;
  this.paidAmount = amount || this.total;
  this.paidAt = new Date();
};

/**
 * Add credit note
 */
invoiceSchema.methods.addCreditNote = function (
  creditNoteNumber: string,
  amount: number,
  reason: string,
  pdfUrl?: string
) {
  this.creditNotes.push({
    creditNoteNumber,
    amount,
    reason,
    issuedAt: new Date(),
    pdfUrl,
  });

  // Update payment status if fully refunded
  const totalRefunded = this.creditNotes.reduce(
    (sum, cn) => sum + cn.amount,
    0
  );
  if (totalRefunded >= this.total) {
    this.paymentStatus = PAYMENT_STATUS.REFUNDED;
  }
};

/**
 * Check if invoice is overdue
 */
invoiceSchema.methods.isOverdue = function (): boolean {
  return (
    this.paymentStatus !== PAYMENT_STATUS.PAID && this.dueDate < new Date()
  );
};

/**
 * Calculate remaining balance
 */
invoiceSchema.methods.getRemainingBalance = function (): number {
  const totalRefunded = this.creditNotes.reduce(
    (sum, cn) => sum + cn.amount,
    0
  );
  return this.total - this.paidAmount - totalRefunded;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Generate invoice number
 */
invoiceSchema.statics.generateInvoiceNumber =
  async function (): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Find last invoice number for this year
    const lastInvoice = await this.findOne({
      invoiceNumber: new RegExp(`^${prefix}`),
    })
      .sort({ invoiceNumber: -1 })
      .lean();

    if (!lastInvoice) {
      return `${prefix}00001`;
    }

    // Extract number and increment
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(5, "0");

    return `${prefix}${nextNumber}`;
  };

/**
 * Find overdue invoices
 */
invoiceSchema.statics.findOverdue = function () {
  return this.find({
    paymentStatus: { $ne: PAYMENT_STATUS.PAID },
    dueDate: { $lt: new Date() },
    status: { $ne: INVOICE_STATUS.CANCELLED },
  }).sort({ dueDate: 1 });
};

/**
 * Find invoices by organization
 */
invoiceSchema.statics.findByOrganization = function (
  organizationId: mongoose.Types.ObjectId,
  options?: {
    status?: string;
    paymentStatus?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const query: any = { organizationId };

  if (options?.status) query.status = options.status;
  if (options?.paymentStatus) query.paymentStatus = options.paymentStatus;
  if (options?.startDate || options?.endDate) {
    query.issueDate = {};
    if (options.startDate) query.issueDate.$gte = options.startDate;
    if (options.endDate) query.issueDate.$lte = options.endDate;
  }

  return this.find(query).sort({ createdAt: -1 });
};

// ============================================
// EXPORT MODEL
// ============================================

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
