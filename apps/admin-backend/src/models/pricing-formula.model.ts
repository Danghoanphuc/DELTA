/**
 * PricingFormula Model
 *
 * Model for dynamic pricing formulas with quantity tiers and finishing options
 * Used by the Dynamic Pricing Engine to calculate prices based on product specifications
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Quantity tier for volume-based pricing
 */
export interface IQuantityTier {
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: number;
  discount?: number;
}

/**
 * Formula variable definition
 */
export interface IFormulaVariable {
  name: string;
  type: "number" | "string" | "boolean";
  defaultValue?: number | string | boolean;
  description?: string;
}

/**
 * PricingFormula document interface
 */
export interface IPricingFormula extends Document {
  _id: Types.ObjectId;
  name: string;
  productType: string;
  formula: string;
  variables: IFormulaVariable[];
  quantityTiers: IQuantityTier[];
  paperMultipliers: Map<string, number>;
  finishingCosts: Map<string, number>;
  minMargin: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quantity tier schema
 */
const quantityTierSchema = new Schema<IQuantityTier>(
  {
    minQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    maxQuantity: {
      type: Number,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

/**
 * Formula variable schema
 */
const formulaVariableSchema = new Schema<IFormulaVariable>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["number", "string", "boolean"],
      required: true,
    },
    defaultValue: {
      type: Schema.Types.Mixed,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * PricingFormula schema
 */
const pricingFormulaSchema = new Schema<IPricingFormula>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    productType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    formula: {
      type: String,
      required: true,
      trim: true,
    },
    variables: {
      type: [formulaVariableSchema],
      default: [],
    },
    quantityTiers: {
      type: [quantityTierSchema],
      default: [],
    },
    paperMultipliers: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    finishingCosts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    minMargin: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
    collection: "pricing_formulas",
  }
);

// Compound indexes for efficient queries
pricingFormulaSchema.index({ productType: 1, isActive: 1 });
pricingFormulaSchema.index({ createdAt: -1 });

/**
 * Static method to find active formulas by product type
 */
pricingFormulaSchema.statics.findActiveByProductType = function (
  productType: string
) {
  return this.find({ productType, isActive: true }).lean();
};

/**
 * Static method to find all active formulas
 */
pricingFormulaSchema.statics.findAllActive = function () {
  return this.find({ isActive: true }).lean();
};

export const PricingFormula =
  (mongoose.models.PricingFormula as Model<IPricingFormula>) ||
  mongoose.model<IPricingFormula>("PricingFormula", pricingFormulaSchema);
