// features/products/types/customization.types.ts
/**
 * Types for Product Customization (Phase 3.3)
 */

export interface PrintArea {
  area: string; // "front", "back", "left_chest", "sleeve"
  artworkId?: string;
  artworkUrl?: string;
  colors?: string[];
}

export interface PrintMethodSelection {
  method: string; // "screen_print", "dtg", "embroidery", etc.
  areas: PrintArea[];
}

export interface PersonalizationText {
  text: string;
  font?: string;
  color?: string;
  position?: string;
}

export interface VariantSelection {
  size?: string;
  color?: string;
  material?: string;
  [key: string]: string | undefined;
}

export interface CustomizationOptions {
  variantSelection: VariantSelection;
  printMethod?: PrintMethodSelection;
  personalization?: PersonalizationText;
  quantity: number;
}

export interface PriceBreakdown {
  basePrice: number;
  customizationCost: number;
  setupFees: number;
  volumeDiscount: number;
  subtotal: number;
  total: number;
  unitPrice: number;
  savings?: number;
  nextTierInfo?: {
    quantity: number;
    unitPrice: number;
    savings: number;
  };
}
