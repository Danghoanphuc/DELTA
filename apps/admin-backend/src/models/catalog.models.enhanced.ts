// apps/admin-backend/src/models/catalog.models.enhanced.ts
// ✅ Enhanced Product Models with Print Methods & Advanced Features
// Phase 3.1.1: Print Method Configuration

import mongoose, { Schema, Document } from "mongoose";

// ============================================
// PRINT METHOD TYPES & ENUMS
// ============================================
export const PRINT_METHODS = {
  SCREEN_PRINT: "screen_print",
  DTG: "dtg", // Direct-to-Garment
  EMBROIDERY: "embroidery",
  HEAT_TRANSFER: "heat_transfer",
  SUBLIMATION: "sublimation",
  LASER_ENGRAVING: "laser_engraving",
  PAD_PRINTING: "pad_printing",
} as const;

export const PRINT_AREAS = {
  FRONT: "front",
  BACK: "back",
  LEFT_CHEST: "left_chest",
  RIGHT_CHEST: "right_chest",
  LEFT_SLEEVE: "left_sleeve",
  RIGHT_SLEEVE: "right_sleeve",
  COLLAR: "collar",
  POCKET: "pocket",
  BOTTOM: "bottom",
  FULL_WRAP: "full_wrap",
} as const;

export const ARTWORK_COLOR_MODES = {
  CMYK: "CMYK",
  RGB: "RGB",
  PANTONE: "Pantone",
  GRAYSCALE: "Grayscale",
} as const;

// ============================================
// INTERFACES
// ============================================

/**
 * Print Area Configuration
 * Defines where and how artwork can be printed on a product
 */
export interface IPrintArea {
  name: string; // "front", "back", "left_chest"
  displayName: string; // "Front", "Back", "Left Chest"
  maxWidth: number; // mm
  maxHeight: number; // mm
  position?: {
    x: number; // mm from left
    y: number; // mm from top
  };
  allowedColors: number; // max colors for this area
  setupFee: number; // one-time setup cost per design
  unitCost: number; // cost per unit for this area
  isRequired: boolean; // must have artwork for this area
}

/**
 * Artwork Requirements for a Print Method
 */
export interface IArtworkRequirements {
  minResolution: number; // DPI (e.g., 300)
  acceptedFormats: string[]; // ["AI", "EPS", "PDF", "PNG"]
  colorMode: string; // "CMYK", "RGB", "Pantone"
  maxFileSize: number; // MB
  requiresVectorFile: boolean;
  requiresTransparentBackground: boolean;
  notes?: string;
}

/**
 * Print Method Configuration
 * Complete configuration for a printing technique
 */
export interface IPrintMethod {
  method: string; // "screen_print", "dtg", "embroidery"
  displayName: string; // "Screen Printing", "Direct-to-Garment"
  description?: string;
  areas: IPrintArea[];
  artworkRequirements: IArtworkRequirements;
  leadTime: {
    min: number;
    max: number;
    unit: "days" | "hours";
  };
  isActive: boolean;
  sortOrder: number;
}

/**
 * MOQ (Minimum Order Quantity) per Print Method
 */
export interface IMoqByPrintMethod {
  printMethod: string;
  moq: number;
  notes?: string;
}

/**
 * Production Complexity Scoring
 * Helps estimate lead time and pricing
 */
export interface IProductionComplexity {
  score: number; // 1-10 (1=simple, 10=very complex)
  factors: string[]; // ["multiple_colors", "embroidery", "special_material"]
  estimatedLeadTimeDays: number;
  notes?: string;
}

// ============================================
// ENHANCED CATALOG PRODUCT
// ============================================
export interface IEnhancedCatalogProduct extends Document {
  // ... All existing fields from ICatalogProduct ...

  // ✅ NEW: Print Methods Configuration
  printMethods: IPrintMethod[];

  // ✅ NEW: MOQ per Print Method
  moqByPrintMethod: IMoqByPrintMethod[];

  // ✅ NEW: Production Complexity
  productionComplexity: IProductionComplexity;

  // ✅ NEW: Default Print Method
  defaultPrintMethod?: string;

  // Enhanced from existing
  customization: {
    allowLogo: boolean;
    logoPositions?: string[];
    allowPersonalization: boolean;
    personalizationFields?: string[];
    printMethods?: string[]; // Keep for backward compatibility
    setupFee?: number;
    // ✅ NEW: Advanced customization options
    maxColors?: number;
    requiresArtworkApproval?: boolean;
    customizationLeadTime?: number; // days
  };
}

// ============================================
// ENHANCED SCHEMA
// ============================================
const PrintAreaSchema = new Schema<IPrintArea>({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  maxWidth: { type: Number, required: true }, // mm
  maxHeight: { type: Number, required: true }, // mm
  position: {
    x: { type: Number },
    y: { type: Number },
  },
  allowedColors: { type: Number, default: 4 },
  setupFee: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: false },
});

const ArtworkRequirementsSchema = new Schema<IArtworkRequirements>({
  minResolution: { type: Number, default: 300 }, // DPI
  acceptedFormats: [{ type: String }],
  colorMode: { type: String, default: "CMYK" },
  maxFileSize: { type: Number, default: 50 }, // MB
  requiresVectorFile: { type: Boolean, default: false },
  requiresTransparentBackground: { type: Boolean, default: false },
  notes: { type: String },
});

const PrintMethodSchema = new Schema<IPrintMethod>({
  method: {
    type: String,
    required: true,
    enum: Object.values(PRINT_METHODS),
  },
  displayName: { type: String, required: true },
  description: { type: String },
  areas: [PrintAreaSchema],
  artworkRequirements: {
    type: ArtworkRequirementsSchema,
    required: true,
  },
  leadTime: {
    min: { type: Number, default: 3 },
    max: { type: Number, default: 7 },
    unit: { type: String, enum: ["days", "hours"], default: "days" },
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
});

const MoqByPrintMethodSchema = new Schema<IMoqByPrintMethod>({
  printMethod: {
    type: String,
    required: true,
    enum: Object.values(PRINT_METHODS),
  },
  moq: { type: Number, required: true, min: 1 },
  notes: { type: String },
});

const ProductionComplexitySchema = new Schema<IProductionComplexity>({
  score: { type: Number, required: true, min: 1, max: 10 },
  factors: [{ type: String }],
  estimatedLeadTimeDays: { type: Number, required: true },
  notes: { type: String },
});

// Note: This is an extension schema. In production, you would:
// 1. Add these fields to the existing CatalogProductSchema
// 2. Run a migration to add default values to existing products
// 3. Update the ICatalogProduct interface

export const EnhancedProductFields = {
  printMethods: [PrintMethodSchema],
  moqByPrintMethod: [MoqByPrintMethodSchema],
  productionComplexity: ProductionComplexitySchema,
  defaultPrintMethod: {
    type: String,
    enum: Object.values(PRINT_METHODS),
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate total customization cost for a print configuration
 */
export function calculateCustomizationCost(
  printMethod: IPrintMethod,
  selectedAreas: string[],
  quantity: number
): {
  setupFees: number;
  unitCosts: number;
  totalCost: number;
} {
  let setupFees = 0;
  let unitCosts = 0;

  selectedAreas.forEach((areaName) => {
    const area = printMethod.areas.find((a) => a.name === areaName);
    if (area) {
      setupFees += area.setupFee;
      unitCosts += area.unitCost * quantity;
    }
  });

  return {
    setupFees,
    unitCosts,
    totalCost: setupFees + unitCosts,
  };
}

/**
 * Validate artwork against print method requirements
 */
export function validateArtworkForPrintMethod(
  artwork: {
    resolution: number;
    format: string;
    fileSize: number;
    colorMode: string;
    hasTransparency: boolean;
    isVector: boolean;
  },
  requirements: IArtworkRequirements
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (artwork.resolution < requirements.minResolution) {
    errors.push(
      `Resolution ${artwork.resolution}dpi is below minimum ${requirements.minResolution}dpi`
    );
  }

  if (!requirements.acceptedFormats.includes(artwork.format.toUpperCase())) {
    errors.push(
      `Format ${
        artwork.format
      } is not accepted. Accepted formats: ${requirements.acceptedFormats.join(
        ", "
      )}`
    );
  }

  if (artwork.fileSize > requirements.maxFileSize) {
    errors.push(
      `File size ${artwork.fileSize}MB exceeds maximum ${requirements.maxFileSize}MB`
    );
  }

  if (requirements.requiresVectorFile && !artwork.isVector) {
    errors.push("Vector file is required for this print method");
  }

  if (requirements.requiresTransparentBackground && !artwork.hasTransparency) {
    errors.push("Transparent background is required for this print method");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get MOQ for a specific print method
 */
export function getMoqForPrintMethod(
  product: IEnhancedCatalogProduct,
  printMethod: string
): number {
  const moqConfig = product.moqByPrintMethod.find(
    (m) => m.printMethod === printMethod
  );
  return moqConfig?.moq || 1;
}

/**
 * Estimate lead time based on complexity and print method
 */
export function estimateLeadTime(
  product: IEnhancedCatalogProduct,
  printMethod: string,
  quantity: number
): {
  minDays: number;
  maxDays: number;
  notes: string[];
} {
  const method = product.printMethods.find((m) => m.method === printMethod);
  if (!method) {
    return { minDays: 7, maxDays: 14, notes: ["Print method not found"] };
  }

  const baseMin = method.leadTime.min;
  const baseMax = method.leadTime.max;

  // Adjust based on complexity
  const complexityMultiplier = product.productionComplexity.score / 5;

  // Adjust based on quantity
  const quantityMultiplier = quantity > 100 ? 1.5 : quantity > 50 ? 1.2 : 1;

  const notes: string[] = [];
  if (product.productionComplexity.score > 7) {
    notes.push("High complexity product may require additional time");
  }
  if (quantity > 100) {
    notes.push("Large quantity order may require additional production time");
  }

  return {
    minDays: Math.ceil(baseMin * complexityMultiplier * quantityMultiplier),
    maxDays: Math.ceil(baseMax * complexityMultiplier * quantityMultiplier),
    notes,
  };
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

/**
 * Default print method configurations for common products
 */
export const DEFAULT_PRINT_METHODS = {
  TSHIRT_SCREEN_PRINT: {
    method: PRINT_METHODS.SCREEN_PRINT,
    displayName: "Screen Printing",
    description: "High-quality, durable printing for large quantities",
    areas: [
      {
        name: PRINT_AREAS.FRONT,
        displayName: "Front",
        maxWidth: 300,
        maxHeight: 400,
        allowedColors: 4,
        setupFee: 50000, // VND
        unitCost: 15000,
        isRequired: false,
      },
      {
        name: PRINT_AREAS.BACK,
        displayName: "Back",
        maxWidth: 300,
        maxHeight: 400,
        allowedColors: 4,
        setupFee: 50000,
        unitCost: 15000,
        isRequired: false,
      },
      {
        name: PRINT_AREAS.LEFT_CHEST,
        displayName: "Left Chest",
        maxWidth: 100,
        maxHeight: 100,
        allowedColors: 2,
        setupFee: 30000,
        unitCost: 8000,
        isRequired: false,
      },
    ],
    artworkRequirements: {
      minResolution: 300,
      acceptedFormats: ["AI", "EPS", "PDF", "PNG"],
      colorMode: "CMYK",
      maxFileSize: 50,
      requiresVectorFile: true,
      requiresTransparentBackground: false,
    },
    leadTime: { min: 5, max: 7, unit: "days" as const },
    isActive: true,
    sortOrder: 1,
  },

  TSHIRT_DTG: {
    method: PRINT_METHODS.DTG,
    displayName: "Direct-to-Garment",
    description:
      "Full-color printing, ideal for small quantities and complex designs",
    areas: [
      {
        name: PRINT_AREAS.FRONT,
        displayName: "Front",
        maxWidth: 350,
        maxHeight: 450,
        allowedColors: 999, // unlimited
        setupFee: 0,
        unitCost: 35000,
        isRequired: false,
      },
      {
        name: PRINT_AREAS.BACK,
        displayName: "Back",
        maxWidth: 350,
        maxHeight: 450,
        allowedColors: 999,
        setupFee: 0,
        unitCost: 35000,
        isRequired: false,
      },
    ],
    artworkRequirements: {
      minResolution: 300,
      acceptedFormats: ["PNG", "PDF", "AI"],
      colorMode: "RGB",
      maxFileSize: 50,
      requiresVectorFile: false,
      requiresTransparentBackground: true,
    },
    leadTime: { min: 3, max: 5, unit: "days" as const },
    isActive: true,
    sortOrder: 2,
  },
};

export default {
  PRINT_METHODS,
  PRINT_AREAS,
  ARTWORK_COLOR_MODES,
  EnhancedProductFields,
  calculateCustomizationCost,
  validateArtworkForPrintMethod,
  getMoqForPrintMethod,
  estimateLeadTime,
  DEFAULT_PRINT_METHODS,
};
