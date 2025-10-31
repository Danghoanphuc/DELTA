// src/types/product.ts (TỆP MỚI)

// Dựa trên backend/src/models/Product.js
export type ProductCategory =
  | "business-card"
  | "flyer"
  | "banner"
  | "brochure"
  | "t-shirt"
  | "mug"
  | "sticker"
  | "packaging"
  | "other";

export interface ProductImage {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface ProductPrice {
  _id?: string; // Sẽ có khi lấy từ DB
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
}

export interface ProductSpecs {
  material?: string;
  size?: string;
  color?: string;
  finishing?: string;
}

export interface ProductCustomization {
  allowFileUpload?: boolean;
  acceptedFileTypes?: string[];
  hasDesignService?: boolean;
  designServiceFee?: number;
}

export interface ProductAssets {
  modelUrl?: string;
  dielineUrl?: string;
}

// Đây là type cho sản phẩm trong trang quản lý của nhà in
export interface PrinterProduct {
  _id: string;
  printerId: string;
  name: string;
  category: ProductCategory;
  description?: string;
  images?: ProductImage[];
  pricing: ProductPrice[];
  specifications?: ProductSpecs;
  productionTime?: {
    min: number;
    max: number;
  };
  customization?: ProductCustomization;
  isActive: boolean;
  stock?: number;
  totalSold?: number;
  views?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product extends PrinterProduct {
  assets: ProductAssets;
}
