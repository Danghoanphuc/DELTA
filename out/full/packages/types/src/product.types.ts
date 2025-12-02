// packages/types/src/product.types.ts
// (File này tôi đã gửi ở lượt trước, đây là bản đầy đủ)

// DTO (Data Transfer Object) cho việc TẠO MỚI sản phẩm
export interface ICreateProductDto {
  name: string;
  slug: string; // Service sẽ check unique
  description?: string;
  basePrice: number;
  category: string;
  tags?: string[];

  // Thời gian sản xuất (cam kết)
  // Sửa: Lấy từ file model của anh
  productionTime: {
    min: number;
    max: number;
  };

  // Thông tin Web2Print (từ model của anh)
  assets: {
    modelUrl?: string;
    dielineUrl?: string;
    surfaces: {
      materialName: string;
      surfaceKey: string;
      name: string;
    }[];
  };

  // Thông tin giá sỉ (từ model của anh)
  pricing: {
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit: number;
  }[];

  // Thông số kỹ thuật (từ model của anh)
  specifications: {
    material?: string;
    size?: string;
    color?: string;
    finishing?: string;
  };

  // Tùy chọn tùy chỉnh (từ model của anh)
  customization: {
    allowFileUpload: boolean;
    acceptedFileTypes: string[];
    hasDesignService: boolean;
    designServiceFee?: number;
  };

  stock: number;
}

// DTO cho việc CẬP NHẬT (tất cả đều là tùy chọn)
export interface IUpdateProductDto extends Partial<ICreateProductDto> {
  isActive?: boolean;
}

// Interface "Hợp đồng" cho Product (đã "pure")
export interface IPrinterProduct {
  _id: string;
  printerProfileId: string; // Sửa: Dùng printerProfileId
  taxonomyId?: string;
  name: string;
  slug: string;
  description?: string;
  category: string;

  // W2P
  assets: {
    modelUrl?: string;
    dielineUrl?: string;
    surfaces: {
      materialName: string;
      surfaceKey: string;
      name: string;
    }[];
  };

  // Pricing
  pricing: {
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit: number;
  }[];
  basePrice: number;

  specifications: {
    material?: string;
    size?: string;
    color?: string;
    finishing?: string;
  };

  productionTime: {
    min: number;
    max: number;
  };

  customization: {
    allowFileUpload: boolean;
    acceptedFileTypes: string[];
    hasDesignService: boolean;
    designServiceFee?: number;
  };

  // Status
  isActive: boolean;
  stock: number;
  totalSold: number;
  views: number;
  rating: number;

  // === PRODUCT HEALTH (ADMIN) ===
  isPublished: boolean;
  healthStatus: "Active" | "Warning" | "Suspended";
  stats: {
    refundRate: number;
    cancellationRate: number;
    lastSuspensionAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}
