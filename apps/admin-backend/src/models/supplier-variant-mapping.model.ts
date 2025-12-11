/**
 * Supplier Variant Mapping Model
 *
 * Maps internal SKU variants to supplier-specific SKUs
 * Separate collection to avoid write-lock contention during supplier syncs
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ISupplierVariantMapping extends Document {
  _id: mongoose.Types.ObjectId;
  skuVariantId: mongoose.Types.ObjectId;
  sku: string; // Denormalized for faster lookup
  supplierId: mongoose.Types.ObjectId;
  supplierSku: string; // Translation to supplier's SKU

  // Pricing & Availability
  cost: number;
  stockQuantity: number; // Supplier's stock level
  isAvailable: boolean;

  // Lead Time
  leadTime: {
    min: number;
    max: number;
    unit: string;
  };
  moq: number; // Minimum Order Quantity

  // Routing Priority
  isPreferred: boolean;
  priority: number; // 1 = highest priority

  // Sync Tracking
  lastSyncedAt: Date;
  syncStatus: "active" | "error" | "disabled";

  createdAt: Date;
  updatedAt: Date;
}

const supplierVariantMappingSchema = new Schema<ISupplierVariantMapping>(
  {
    skuVariantId: {
      type: Schema.Types.ObjectId,
      ref: "SkuVariant",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    supplierSku: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    leadTime: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["days", "weeks"],
        default: "days",
      },
    },
    moq: {
      type: Number,
      default: 1,
    },
    isPreferred: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: Number,
      default: 2, // 1 = highest, 2 = normal, 3 = low
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    syncStatus: {
      type: String,
      enum: ["active", "error", "disabled"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for Performance

// Unique constraint: One mapping per SKU variant + supplier
supplierVariantMappingSchema.index(
  { skuVariantId: 1, supplierId: 1 },
  { unique: true }
);

// Reverse lookup: Supplier SKU → Internal SKU
supplierVariantMappingSchema.index({ sku: 1, supplierId: 1 });

// Supplier queries: Get all mappings for a supplier
supplierVariantMappingSchema.index({ supplierId: 1, isAvailable: 1 });

// Routing queries: Find best supplier for a SKU
supplierVariantMappingSchema.index({
  skuVariantId: 1,
  isAvailable: 1,
  priority: 1,
});

// Routing by SKU (denormalized)
supplierVariantMappingSchema.index({
  sku: 1,
  isAvailable: 1,
  priority: 1,
});

// Sync status monitoring
supplierVariantMappingSchema.index({ syncStatus: 1, lastSyncedAt: 1 });

export const SupplierVariantMapping = (mongoose.models.SupplierVariantMapping ||
  mongoose.model<ISupplierVariantMapping>(
    "SupplierVariantMapping",
    supplierVariantMappingSchema
  )) as mongoose.Model<ISupplierVariantMapping>;
