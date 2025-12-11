// apps/admin-backend/src/models/inventory.models.ts
// ✅ Inventory Management Models
// Phase 4: Inventory Management System

import mongoose, { Schema, Document } from "mongoose";

// ============================================
// INVENTORY TRANSACTION - Lịch sử giao dịch tồn kho
// ============================================

export const TRANSACTION_TYPES = {
  PURCHASE: "purchase", // Nhập hàng từ supplier
  SALE: "sale", // Bán hàng
  ADJUSTMENT: "adjustment", // Điều chỉnh thủ công
  RETURN: "return", // Trả hàng
  DAMAGE: "damage", // Hàng hỏng
  RESERVE: "reserve", // Đặt trước cho đơn hàng
  RELEASE: "release", // Hủy đặt trước
  TRANSFER: "transfer", // Chuyển kho
} as const;

export const REFERENCE_TYPES = {
  SWAG_ORDER: "swag_order",
  PRODUCTION_ORDER: "production_order",
  MANUAL_ADJUSTMENT: "manual_adjustment",
  PURCHASE_ORDER: "purchase_order",
} as const;

export interface IInventoryTransaction extends Document {
  // SKU Reference
  skuVariantId: mongoose.Types.ObjectId;
  sku: string;
  productName: string;

  // Transaction Type
  type: keyof typeof TRANSACTION_TYPES;

  // Quantity Changes
  quantityBefore: number;
  quantityChange: number; // Positive for increase, negative for decrease
  quantityAfter: number;

  // Reference to source document
  referenceType: keyof typeof REFERENCE_TYPES;
  referenceId: mongoose.Types.ObjectId;
  referenceNumber?: string; // Order number, PO number, etc.

  // Cost Tracking (for COGS calculation)
  unitCost: number;
  totalCost: number;

  // Location (if multi-warehouse)
  warehouseId?: mongoose.Types.ObjectId;
  warehouseName?: string;

  // Metadata
  reason: string;
  notes?: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    // SKU Reference
    skuVariantId: {
      type: Schema.Types.ObjectId,
      ref: "SkuVariant",
      required: true,
      index: true,
    },
    sku: { type: String, required: true, uppercase: true },
    productName: { type: String, required: true },

    // Transaction Type
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
      index: true,
    },

    // Quantity Changes
    quantityBefore: { type: Number, required: true },
    quantityChange: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },

    // Reference
    referenceType: {
      type: String,
      enum: Object.values(REFERENCE_TYPES),
      required: true,
      index: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    referenceNumber: { type: String },

    // Cost Tracking
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    // Location
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    warehouseName: { type: String },

    // Metadata
    reason: { type: String, required: true },
    notes: { type: String },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    performedByName: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
InventoryTransactionSchema.index({ skuVariantId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ referenceId: 1, referenceType: 1 });
InventoryTransactionSchema.index({ type: 1, createdAt: -1 });
InventoryTransactionSchema.index({ performedBy: 1, createdAt: -1 });

// ============================================
// ENHANCED SKU VARIANT - Extended inventory fields
// ============================================

/**
 * Supplier Mapping for SKU Variant
 * Maps variant to supplier with cost and lead time
 */
export interface ISupplierMapping {
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  supplierSku: string;
  cost: number;
  leadTime: {
    min: number;
    max: number;
    unit: "days" | "weeks";
  };
  moq: number; // Minimum order quantity
  isPreferred: boolean;
  lastOrderDate?: Date;
  notes?: string;
}

/**
 * Inventory Tracking for SKU Variant
 * Detailed stock levels and locations
 */
export interface IInventoryTracking {
  onHand: number; // Physical stock in warehouse
  reserved: number; // Reserved for orders
  available: number; // onHand - reserved
  inTransit: number; // Ordered from supplier, not yet received

  // Multi-location support
  locations?: {
    warehouseId: mongoose.Types.ObjectId;
    warehouseName: string;
    quantity: number;
  }[];

  // Replenishment
  reorderPoint: number; // When to reorder
  reorderQuantity: number; // How much to reorder
  lastRestockDate?: Date;
  nextRestockDate?: Date;

  // Tracking
  lastCountDate?: Date;
  lastCountBy?: mongoose.Types.ObjectId;
}

/**
 * Performance Metrics for SKU Variant
 * Sales and profitability tracking
 */
export interface IPerformanceMetrics {
  totalSold: number;
  totalRevenue: number;
  averageMargin: number;
  returnRate: number;
  averageLeadTime: number;
  lastSoldDate?: Date;
  turnoverRate?: number; // Times sold per period
}

// These fields should be added to existing SkuVariant model
export const EnhancedSkuVariantFields = {
  // Supplier Mappings
  supplierMappings: [
    {
      supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
      supplierName: { type: String },
      supplierSku: { type: String },
      cost: { type: Number, required: true },
      leadTime: {
        min: { type: Number, default: 3 },
        max: { type: Number, default: 7 },
        unit: { type: String, enum: ["days", "weeks"], default: "days" },
      },
      moq: { type: Number, default: 1 },
      isPreferred: { type: Boolean, default: false },
      lastOrderDate: { type: Date },
      notes: { type: String },
    },
  ],

  // Enhanced Inventory Tracking
  inventory: {
    onHand: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    inTransit: { type: Number, default: 0 },

    locations: [
      {
        warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
        warehouseName: { type: String },
        quantity: { type: Number, default: 0 },
      },
    ],

    reorderPoint: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 50 },
    lastRestockDate: { type: Date },
    nextRestockDate: { type: Date },

    lastCountDate: { type: Date },
    lastCountBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },

  // Performance Metrics
  metrics: {
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageMargin: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    averageLeadTime: { type: Number, default: 0 },
    lastSoldDate: { type: Date },
    turnoverRate: { type: Number, default: 0 },
  },
};

// ============================================
// EXPORT MODELS
// ============================================

export const InventoryTransaction = (mongoose.models.InventoryTransaction ||
  mongoose.model<IInventoryTransaction>(
    "InventoryTransaction",
    InventoryTransactionSchema
  )) as mongoose.Model<IInventoryTransaction>;

// Helper function to calculate available quantity
export function calculateAvailableQuantity(
  onHand: number,
  reserved: number
): number {
  return Math.max(0, onHand - reserved);
}

// Helper function to check if reorder is needed
export function needsReorder(available: number, reorderPoint: number): boolean {
  return available <= reorderPoint;
}

// Helper function to calculate COGS (Cost of Goods Sold)
export function calculateCOGS(transactions: IInventoryTransaction[]): number {
  return transactions
    .filter((t) => t.type === TRANSACTION_TYPES.SALE)
    .reduce((sum, t) => sum + t.totalCost, 0);
}

export default {
  InventoryTransaction,
  TRANSACTION_TYPES,
  REFERENCE_TYPES,
  EnhancedSkuVariantFields,
  calculateAvailableQuantity,
  needsReorder,
  calculateCOGS,
};
