/**
 * JobTicket Model
 *
 * Model for digital job tickets with QR codes and technical specifications
 * Used for production floor tracking and accountability
 *
 * Requirements: 6.1, 6.2
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Job ticket status enum
 */
export const JOB_TICKET_STATUS = {
  ACTIVE: "active",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type JobTicketStatus =
  (typeof JOB_TICKET_STATUS)[keyof typeof JOB_TICKET_STATUS];

/**
 * Production log interface
 */
export interface IProductionLog {
  stage: string;
  operatorId: Types.ObjectId;
  stationId: string;
  timestamp: Date;
  notes?: string;
}

/**
 * Production error interface
 */
export interface IProductionError {
  errorType: string;
  description: string;
  reportedBy: Types.ObjectId;
  reportedAt: Date;
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
}

/**
 * Print area interface
 */
export interface IPrintArea {
  area: string;
  artworkId?: Types.ObjectId;
  colors: string[];
  cost?: number;
}

/**
 * Job ticket specifications interface
 */
export interface IJobTicketSpecifications {
  productType: string;
  size: {
    width: number;
    height: number;
    unit: string;
  };
  paperType: string;
  quantity: number;
  printSides: "single" | "double";
  colors: number;
  finishingOptions: string[];
  specialInstructions: string;
  printAreas?: IPrintArea[];
}

/**
 * JobTicket document interface
 */
export interface IJobTicket extends Document {
  _id: Types.ObjectId;
  ticketId: string;
  orderId: Types.ObjectId;
  qrCode: string;
  qrCodeUrl: string;
  specifications: IJobTicketSpecifications;
  assets: Types.ObjectId[];
  status: JobTicketStatus;
  productionLogs: IProductionLog[];
  productionErrors: IProductionError[];
  generatedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Production log schema
 */
const productionLogSchema = new Schema<IProductionLog>(
  {
    stage: {
      type: String,
      required: true,
      trim: true,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    stationId: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

/**
 * Production error schema
 */
const productionErrorSchema = new Schema<IProductionError>(
  {
    errorType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    reportedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    resolution: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { _id: true }
);

/**
 * Print area schema
 */
const printAreaSchema = new Schema<IPrintArea>(
  {
    area: {
      type: String,
      required: true,
      trim: true,
    },
    artworkId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
    colors: {
      type: [String],
      default: [],
    },
    cost: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Job ticket specifications schema
 */
const specificationsSchema = new Schema<IJobTicketSpecifications>(
  {
    productType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, default: "mm" },
    },
    paperType: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    printSides: {
      type: String,
      enum: ["single", "double"],
      default: "single",
    },
    colors: {
      type: Number,
      default: 4,
    },
    finishingOptions: {
      type: [String],
      default: [],
    },
    specialInstructions: {
      type: String,
      default: "",
      trim: true,
    },
    printAreas: {
      type: [printAreaSchema],
      default: [],
    },
  },
  { _id: false }
);

/**
 * JobTicket schema
 */
const jobTicketSchema = new Schema<IJobTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: specificationsSchema,
      required: true,
    },
    assets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Asset",
      },
    ],
    status: {
      type: String,
      enum: Object.values(JOB_TICKET_STATUS),
      default: JOB_TICKET_STATUS.ACTIVE,
      index: true,
    },
    productionLogs: {
      type: [productionLogSchema],
      default: [],
    },
    productionErrors: {
      type: [productionErrorSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "job_tickets",
  }
);

// Indexes
jobTicketSchema.index({ orderId: 1, status: 1 });
jobTicketSchema.index({ generatedAt: -1 });
jobTicketSchema.index({ "productionLogs.timestamp": -1 });

/**
 * Static method to generate unique ticket ID
 */
jobTicketSchema.statics.generateTicketId = async function (): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const prefix = `JT-${year}${month}${day}`;

  const lastTicket = await this.findOne({
    ticketId: { $regex: `^${prefix}` },
  })
    .sort({ ticketId: -1 })
    .lean();

  let sequence = 1;
  if (lastTicket) {
    const lastSequence = parseInt(lastTicket.ticketId.slice(-4), 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${sequence.toString().padStart(4, "0")}`;
};

/**
 * Static method to find by QR code
 */
jobTicketSchema.statics.findByQRCode = function (qrCode: string) {
  return this.findOne({ qrCode }).populate("assets").lean();
};

/**
 * Instance method to add production log
 */
jobTicketSchema.methods.addProductionLog = async function (
  log: Omit<IProductionLog, "timestamp">
): Promise<IJobTicket> {
  this.productionLogs.push({
    ...log,
    timestamp: new Date(),
  });
  return this.save();
};

/**
 * Instance method to log error
 */
jobTicketSchema.methods.logError = async function (
  error: Omit<IProductionError, "reportedAt">
): Promise<IJobTicket> {
  this.productionErrors.push({
    ...error,
    reportedAt: new Date(),
  });
  return this.save();
};

export const JobTicket =
  (mongoose.models.JobTicket as Model<IJobTicket>) ||
  mongoose.model<IJobTicket>("JobTicket", jobTicketSchema);
