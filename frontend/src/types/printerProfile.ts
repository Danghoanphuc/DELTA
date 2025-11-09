// src/types/printerProfile.ts (TỆP MỚI)

export interface PrinterProfile {
  _id: string;
  userId: string;
  businessName: string;
  businessLicense?: string;
  taxCode?: string;

  shopAddress: {
    street: string;
    ward?: string;
    district: string;
    city: string;
    location: {
      type: "Point";
      coordinates: number[]; // [long, lat]
    };
  };

  contactPhone: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  coverImage?: string;
  logoUrl?: string;

  // (Thêm workingHours nếu bạn cần)

  specialties: string[];
  priceTier: "cheap" | "standard" | "premium";
  productionSpeed: "fast" | "standard";

  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: "not_submitted" | "pending" | "rejected" | "verified";

  createdAt: string;
  updatedAt: string;
}
