// apps/admin-frontend/src/components/products/index.ts
// ✅ Export all product components

export { ProductCard } from "./ProductCard";
export { ProductFilters } from "./ProductFilters";
export { ProductForm } from "./ProductForm";
export { PrintMethodConfig } from "./PrintMethodConfig";
export { PricingTiersConfig } from "./PricingTiersConfig";

export type { ProductFormData } from "./ProductForm";
export type {
  PrintMethod,
  PrintArea,
  ArtworkRequirements,
} from "./PrintMethodConfig";
export type { PricingTier } from "./PricingTiersConfig";
