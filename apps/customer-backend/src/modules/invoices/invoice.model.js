// src/modules/invoices/invoice.model.js
// ✅ Invoice Model - Hóa đơn cho swag orders

import mongoose from "mongoose";

const INVOICE_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  REFUNDED: "refunded",
};

// Schema cho line items
const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true },
  taxRate: { type: Number, default: 0 }, // Percentage
  taxAmount: { type: Number, default: 0 },
});

// Schema cho credit notes (phiếu giảm trừ)
const CreditNoteSchema = new mongoose.Schema({
  creditNoteNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  issuedAt: { type: Date, required: true, default: Date.now },
  pdfUrl: { type: String },
});

const InvoiceSchema = new mongoose.Schema(
  {
    // === REFERENCE ===
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    swagOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    swagOrderNumber: { type: String, required: true },

    // === CUSTOMER INFO ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    billingInfo: {
      businessName: { type: String, required: true },
      taxCode: { type: String }, // Mã số thuế
      address: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },

    // === LINE ITEMS ===
    lineItems: [LineItemSchema],

    // === TOTALS ===
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // === PAYMENT ===
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
      index: true,
    },
    paymentMethod: { type: String },
    paidAmount: { type: Number, default: 0 },
    paidAt: { type: Date },
    paymentReference: { type: String }, // Transaction ID, etc.

    // === DATES ===
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },

    // === FILES ===
    pdfUrl: { type: String },

    // === STATUS ===
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.DRAFT,
      index: true,
    },

    // === CREDIT NOTES ===
    creditNotes: [CreditNoteSchema],

    // === NOTES ===
    notes: { type: String },
    internalNotes: { type: String },

    // === EMAIL TRACKING ===
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    emailOpenedAt: { type: Date },

    // === CANCELLATION ===
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
InvoiceSchema.index({ organization: 1, status: 1 });
InvoiceSchema.index({ organization: 1, issueDate: -1 });
InvoiceSchema.index({ dueDate: 1, paymentStatus: 1 });

// === VIRTUALS ===
InvoiceSchema.virtual("isOverdue").get(function () {
  if (this.paymentStatus === PAYMENT_STATUS.PAID) return false;
  return new Date() > this.dueDate;
});

InvoiceSchema.virtual("daysOverdue").get(function () {
  if (!this.isOverdue) return 0;
  const diff = new Date() - this.dueDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

InvoiceSchema.virtual("remainingAmount").get(function () {
  return this.total - this.paidAmount;
});

InvoiceSchema.virtual("totalCreditNotes").get(function () {
  if (!this.creditNotes || this.creditNotes.length === 0) return 0;
  return this.creditNotes.reduce((sum, cn) => sum + cn.amount, 0);
});

// === METHODS ===
InvoiceSchema.methods.markAsPaid = function (paymentData) {
  this.paymentStatus = PAYMENT_STATUS.PAID;
  this.status = INVOICE_STATUS.PAID;
  this.paidAmount = this.total;
  this.paidAt = paymentData.paidAt || new Date();
  this.paymentMethod = paymentData.paymentMethod;
  this.paymentReference = paymentData.paymentReference;
  return this.save();
};

InvoiceSchema.methods.recordPartialPayment = function (amount, paymentData) {
  this.paidAmount += amount;
  this.paymentStatus =
    this.paidAmount >= this.total
      ? PAYMENT_STATUS.PAID
      : PAYMENT_STATUS.PARTIALLY_PAID;

  if (this.paymentStatus === PAYMENT_STATUS.PAID) {
    this.status = INVOICE_STATUS.PAID;
    this.paidAt = paymentData.paidAt || new Date();
  }

  this.paymentMethod = paymentData.paymentMethod;
  this.paymentReference = paymentData.paymentReference;

  return this.save();
};

InvoiceSchema.methods.addCreditNote = function (creditNoteData) {
  const creditNote = {
    creditNoteNumber: creditNoteData.creditNoteNumber,
    amount: creditNoteData.amount,
    reason: creditNoteData.reason,
    issuedAt: new Date(),
    pdfUrl: creditNoteData.pdfUrl,
  };

  this.creditNotes.push(creditNote);

  // Adjust paid amount
  this.paidAmount = Math.max(0, this.paidAmount - creditNoteData.amount);

  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = PAYMENT_STATUS.REFUNDED;
  } else if (this.paidAmount < this.total) {
    this.paymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
  }

  return this.save();
};

InvoiceSchema.methods.send = function () {
  this.status = INVOICE_STATUS.SENT;
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

InvoiceSchema.methods.cancel = function (reason) {
  this.status = INVOICE_STATUS.CANCELLED;
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  return this.save();
};

// === PRE-SAVE ===
InvoiceSchema.pre("save", function (next) {
  // Auto-update status to overdue if past due date
  if (
    this.paymentStatus !== PAYMENT_STATUS.PAID &&
    this.status !== INVOICE_STATUS.CANCELLED &&
    new Date() > this.dueDate
  ) {
    this.status = INVOICE_STATUS.OVERDUE;
  }

  next();
});

// === STATICS ===
InvoiceSchema.statics.generateInvoiceNumber = async function () {
  const date = new Date();
  const prefix = `INV${date.getFullYear()}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
  const count = await this.countDocuments({
    invoiceNumber: new RegExp(`^${prefix}`),
  });
  return `${prefix}${String(count + 1).padStart(5, "0")}`;
};

InvoiceSchema.statics.generateCreditNoteNumber = async function (
  invoiceNumber
) {
  const creditNotesCount = await this.aggregate([
    { $match: { invoiceNumber } },
    { $project: { creditNotesCount: { $size: "$creditNotes" } } },
  ]);

  const count = creditNotesCount[0]?.creditNotesCount || 0;
  return `CN-${invoiceNumber}-${String(count + 1).padStart(2, "0")}`;
};

InvoiceSchema.statics.findOverdue = function () {
  return this.find({
    paymentStatus: { $ne: PAYMENT_STATUS.PAID },
    status: { $ne: INVOICE_STATUS.CANCELLED },
    dueDate: { $lt: new Date() },
  })
    .sort({ dueDate: 1 })
    .populate("organization", "businessName email")
    .populate("swagOrder", "orderNumber name");
};

InvoiceSchema.statics.findByOrganization = function (
  organizationId,
  options = {}
) {
  const query = { organization: organizationId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.paymentStatus) {
    query.paymentStatus = options.paymentStatus;
  }

  return this.find(query)
    .sort({ issueDate: -1 })
    .populate("swagOrder", "orderNumber name");
};

export const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export { INVOICE_STATUS, PAYMENT_STATUS };
