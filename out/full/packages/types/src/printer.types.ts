// packages/types/src/printer.types.ts
import { Types } from "./mongoose.types.js";
import { IUser } from "./user.types.js";

/**
 * @description Các hạng của Nhà in (Kiểu Type)
 */
export enum PrinterTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  STANDARD = "STANDARD", // ✅ Added from schema
}

/**
 * @description Các hạng của Nhà in (Đối tượng Runtime)
 * ✅ SỬA LỖI TS2305: Thêm export này để Mongoose schema có thể sử dụng
 */
export const PRINTER_TIERS_OBJECT = {
  BRONZE: "BRONZE",
  SILVER: "SILVER",
  GOLD: "GOLD",
  PLATINUM: "PLATINUM",
  STANDARD: "STANDARD",
} as const;

/**
 * @description Trạng thái Onboarding của Nhà in với Stripe.
 */
export type StripeAccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "RESTRICTED"
  | "UNKNOWN"
  | "ONBOARDING_REQUIRED"
  | "PENDING_VERIFICATION";

/**
 * @description Trạng thái xác minh của Nhà in
 */
export type VerificationStatus =
  | "not_submitted"
  | "pending_review"
  | "approved"
  | "rejected";

/**
 * @description Phân khúc giá
 */
export type PriceTier = "cheap" | "standard" | "premium";

/**
 * @description Tốc độ sản xuất
 */
export type ProductionSpeed = "fast" | "standard";

/**
 * @description Địa chỉ xưởng in với GeoJSON
 */
export interface ShopAddress {
  street: string;
  ward?: string;
  district: string;
  city: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

/**
 * @description Tài liệu xác minh
 */
export interface VerificationDocs {
  gpkdUrl?: string; // Giấy phép kinh doanh
  cccdUrl?: string; // CCCD
}

/**
 * @description Ảnh xưởng
 */
export interface FactoryImage {
  url: string;
  caption?: string;
}

/**
 * @description Stats
 */
export interface PrinterStats {
  lastDemotionAt?: Date;
  lastPromotionAt?: Date;
}

/**
 * @description Commission Override
 */
export interface CommissionOverride {
  rate: number;
  expiresAt?: Date;
}

/**
 * @description PrinterProfile Interface (Khớp 100% với Backend Schema)
 */
export interface IPrinterProfile {
  _id: Types.ObjectId | string;
  user: Types.ObjectId | string;
  
  // Thông tin cơ bản
  businessName: string;
  contactPhone: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  
  // Hình ảnh
  logoUrl?: string;
  coverImage?: string;
  
  // Địa chỉ
  shopAddress: ShopAddress;
  
  // Verification
  verificationStatus: VerificationStatus;
  verificationDocs?: VerificationDocs;
  isVerified: boolean;
  isActive: boolean;
  
  // Tier & Commission
  tier: string; // Using string to match backend
  standardCommissionRate: number;
  commissionOverride?: CommissionOverride;
  
  // Health Metrics
  healthScore?: number;
  dailyCapacity?: number;
  currentQueueSize?: number;
  
  // Stats
  stats?: PrinterStats;
  
  // Business Info
  specialties: string[];
  priceTier: PriceTier;
  productionSpeed: ProductionSpeed;
  rating?: number;
  totalReviews?: number;
  totalSold?: number;
  
  // Stripe
  stripeAccountId?: string;
  stripeAccountStatus?: StripeAccountStatus;
  
  // Gallery
  factoryImages?: FactoryImage[];
  factoryVideoUrl?: string;
  
  // Business License
  businessLicense?: string;
  taxCode?: string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * @description Represents a PrinterProfile where the 'user' field has been populated.
 */
export interface IPrinterProfileWithUser extends Omit<IPrinterProfile, 'user'> {
  user: IUser;
}

/**
 * @description DTO cho Update Profile (chỉ các field có thể edit)
 */
export interface UpdatePrinterProfileDTO {
  businessName?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  coverImage?: string;
  shopAddress?: Omit<ShopAddress, 'location'>; // Không cho edit coordinates
  specialties?: string[];
  priceTier?: PriceTier;
  productionSpeed?: ProductionSpeed;
}

/**
 * @description Form data cho Frontend (có thể chứa File objects)
 */
export interface PrinterProfileFormData extends Omit<UpdatePrinterProfileDTO, 'logoUrl' | 'coverImage'> {
  logoUrl?: string | File;
  coverImage?: string | File;
}
