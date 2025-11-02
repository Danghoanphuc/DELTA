// src/types/product.ts (CẬP NHẬT)

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

// =================================================================
// ✅ THAY ĐỔI BẮT ĐẦU TỪ ĐÂY
// =================================================================

/**
 * Đại diện cho một bề mặt có thể thiết kế trên mô hình 3D.
 */
export interface DesignSurface {
  key: string; // ID định danh duy nhất (vd: 'lid', 'body')
  name: string; // Tên hiển thị cho người dùng (vd: 'Nắp hộp', 'Thân hộp')

  /**
   * Tên chính xác của vật liệu (material) trong file GLTF/GLB.
   * Ví dụ: 'Material_Lid'
   */
  materialName: string;

  /**
   * URL đến file Dieline (khuôn) 2D, BẮT BUỘC phải là SVG.
   * File SVG này sẽ được dùng làm clipPath (mặt nạ cắt).
   */
  dielineSvgUrl: string;

  /**
   * (Tùy chọn) URL đến file PNG/JPG của dieline.
   * Dùng làm overlay mờ để người dùng thấy đường cấn/gấp.
   * Nếu không có, sẽ dùng dielineSvgUrl.
   */
  dielineOverlayUrl?: string;
}

export interface ProductAssets {
  modelUrl?: string;

  /**
   * @deprecated dielineUrl không còn được dùng, thay bằng 'surfaces'
   */
  dielineUrl?: string;

  /**
   * Danh sách các bề mặt có thể thiết kế của sản phẩm.
   * Nếu mảng này rỗng, sản phẩm không hỗ trợ chỉnh sửa 3D.
   */
  surfaces: DesignSurface[];
}
// =================================================================
// KẾT THÚC THAY ĐỔI
// =================================================================

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

// Cập nhật Product để sử dụng ProductAssets mới
export interface Product extends PrinterProduct {
  assets: ProductAssets;
}
