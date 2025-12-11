/**
 * Proposal Model
 *
 * Model for professional PDF proposals with customer snapshot and pricing details
 * Used for 1-Click Proposal Generation feature
 *
 * Requirements: 2.1, 2.4
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Proposal status enum
 */
export const PROPOSAL_STATUS = {
  DRAFT: "draft",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CONVERTED: "converted",
  EXPIRED: "expired",
} as const;

export type ProposalStatus =
  (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

/**
 * Customer snapshot interface
 */
export interface ICustomerSnapshot {
  customerId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  taxCode?: string;
}

/**
 * Proposal item interface
 */
export interface IProposalItem {
  productType: string;
  name: string;
  specifications: {
    size?: { width: number; height: number; unit: string };
    paperType?: string;
    quantity: number;
    printSides?: "single" | "double";
    colors?: number;
    finishingOptions?: string[];
  };
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

/**
 * Pricing result interface
 */
export interface IPricingResult {
  costPrice: number;
  sellingPrice: number;
  profitMargin: number;
  marginPercentage: number;
  breakdown?: {
    baseCost: number;
    paperCost: number;
    printingCost: number;
    finishingCost: number;
    setupFee: number;
  };
}

/**
 * Margin result interface for multi-tier pricing
 */
export interface IMarginResult {
  dealPrice: number;
  costPrice: number;
  salesCost: number;
  grossProfit: number;
  actualProfit: number;
  marginPercentage: number;
}

/**
 * Proposal document interface
 */
export interface IProposal extends Document {
  _id: Types.ObjectId;
  proposalNumber: string;
  customerId: Types.ObjectId;
  customerSnapshot: ICustomerSnapshot;
  items: IProposalItem[];
  pricing: IPricingResult;
  dealPrice?: number;
  salesCost?: number;
  actualMargin?: IMarginResult;
  terms: string;
  validUntil: Date;
  status: ProposalStatus;
  convertedToOrderId?: Types.ObjectId;
  textSummary?: string;
  pdfUrl?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer snapshot schema
 */
const customerSnapshotSchema = new Schema<ICustomerSnapshot>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    taxCode: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Proposal item schema
 */
const proposalItemSchema = new Schema<IProposalItem>(
  {
    productType: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      size: {
        width: Number,
        height: Number,
        unit: { type: String, default: "mm" },
      },
      paperType: String,
      quantity: { type: Number, required: true },
      printSides: { type: String, enum: ["single", "double"] },
      colors: Number,
      finishingOptions: [String],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

/**
 * Pricing result schema
 */
const pricingResultSchema = new Schema(
  {
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    marginPercentage: { type: Number, required: true },
    breakdown: {
      baseCost: Number,
      paperCost: Number,
      printingCost: Number,
      finishingCost: Number,
      setupFee: Number,
    },
  },
  { _id: false }
);

/**
 * Margin result schema
 */
const marginResultSchema = new Schema(
  {
    dealPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    salesCost: { type: Number, default: 0 },
    grossProfit: { type: Number, required: true },
    actualProfit: { type: Number, required: true },
    marginPercentage: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * Proposal schema
 */
const proposalSchema = new Schema<IProposal>(
  {
    proposalNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
      index: true,
    },
    customerSnapshot: {
      type: customerSnapshotSchema,
      required: true,
    },
    items: {
      type: [proposalItemSchema],
      required: true,
      validate: {
        validator: function (items: IProposalItem[]) {
          return items.length > 0;
        },
        message: "Proposal must have at least one item",
      },
    },
    pricing: {
      type: pricingResultSchema,
      required: true,
    },
    dealPrice: {
      type: Number,
      min: 0,
    },
    salesCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    actualMargin: {
      type: marginResultSchema,
    },
    terms: {
      type: String,
      default: "",
      trim: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PROPOSAL_STATUS),
      default: PROPOSAL_STATUS.DRAFT,
      index: true,
    },
    convertedToOrderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
    },
    textSummary: {
      type: String,
      trim: true,
    },
    pdfUrl: {
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
    timestamps: true,
    versionKey: false,
    collection: "proposals",
  }
);

// Indexes
proposalSchema.index({ customerId: 1, createdAt: -1 });
proposalSchema.index({ status: 1, validUntil: 1 });
proposalSchema.index({ createdBy: 1, createdAt: -1 });

/**
 * Static method to generate unique proposal number
 */
proposalSchema.statics.generateProposalNumber =
  async function (): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `PRP-${year}${month}`;

    const lastProposal = await this.findOne({
      proposalNumber: { $regex: `^${prefix}` },
    })
      .sort({ proposalNumber: -1 })
      .lean();

    let sequence = 1;
    if (lastProposal) {
      const lastSequence = parseInt(lastProposal.proposalNumber.slice(-4), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, "0")}`;
  };

export const Proposal =
  (mongoose.models.Proposal as Model<IProposal>) ||
  mongoose.model<IProposal>("Proposal", proposalSchema);
