/**
 * SKU Variant Model
 *
 * Model for product variants (size, color combinations)
 * Includes inventory tracking and supplier mappings
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ISkuVariant extends Document {
  _id: mongoose.Types.ObjectId;
  sku: string;
  productId: mongoose.Types.ObjectId;
  name: string;
  attributes: {
    size?: string;
    color?: string;
    material?: string;
    [key: string]: any;
  };
  price: number;
  cost: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  isActive: boolean;
  inventory?: {
    onHand: number;
    reserved: number;
    available: number;
    inTransit: number;
    locations?: Array<{
      warehouseId: mongoose.Types.ObjectId;
      quantity: number;
    }>;
    reorderPoint?: number;
    reorderQuantity?: number;
    lastRestockDate?: Date;
    nextRestockDate?: Date;
  };
  supplierMappings?: Array<{
    supplierId: mongoose.Types.ObjectId;
    supplierSku: string;
    cost: number;
    leadTime: {
      min: number;
      max: number;
      unit: string;
    };
    moq: number;
    isPreferred: boolean;
  }>;
  metrics?: {
    totalSold: number;
    totalRevenue: number;
    averageMargin: number;
    returnRate: number;
    averageLeadTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const skuVariantSchema = new Schema<ISkuVariant>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "CatalogProduct",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ["mm", "cm", "inch"],
        default: "cm",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    inventory: {
      onHand: {
        type: Number,
        default: 0,
      },
      reserved: {
        type: Number,
        default: 0,
      },
      available: {
        type: Number,
        default: 0,
      },
      inTransit: {
        type: Number,
        default: 0,
      },
      locations: [
        {
          warehouseId: Schema.Types.ObjectId,
          quantity: Number,
        },
      ],
      reorderPoint: Number,
      reorderQuantity: Number,
      lastRestockDate: Date,
      nextRestockDate: Date,
    },
    supplierMappings: [
      {
        supplierId: {
          type: Schema.Types.ObjectId,
          ref: "Supplier",
        },
        supplierSku: String,
        cost: Number,
        leadTime: {
          min: Number,
          max: Number,
          unit: {
            type: String,
            enum: ["days", "weeks"],
            default: "days",
          },
        },
        moq: Number,
        isPreferred: {
          type: Boolean,
          default: false,
        },
      },
    ],
    metrics: {
      totalSold: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      averageMargin: {
        type: Number,
        default: 0,
      },
      returnRate: {
        type: Number,
        default: 0,
      },
      averageLeadTime: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
skuVariantSchema.index({ productId: 1, isActive: 1 });
skuVariantSchema.index({ "inventory.available": 1 });

// Virtual for calculating available stock
skuVariantSchema.virtual("availableStock").get(function () {
  if (!this.inventory) return 0;
  return this.inventory.onHand - this.inventory.reserved;
});

export const SkuVariant = (mongoose.models.SkuVariant ||
  mongoose.model<ISkuVariant>(
    "SkuVariant",
    skuVariantSchema
  )) as mongoose.Model<ISkuVariant>;
