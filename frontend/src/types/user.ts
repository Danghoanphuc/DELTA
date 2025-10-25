// src/types/user.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: "customer" | "printer" | "admin";
  avatarUrl?: string; // Dấu ? nghĩa là 'optional' (có thể có hoặc không)
  isVerified: boolean;

  // --- Các trường bổ sung cho Nhà in (printer) ---
  phone?: string;
  bio?: string; // (Bạn có thể thêm/bớt các trường này)

  specialties?: string[]; // Mảng các chuỗi

  priceTier?: "cheap" | "standard" | "premium";
  productionSpeed?: "fast" | "standard";

  address?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    location?: {
      type: "Point";
      coordinates: number[]; // [long, lat]
    };
  };

  // (Thêm createdAt, updatedAt nếu bạn cần)
}
