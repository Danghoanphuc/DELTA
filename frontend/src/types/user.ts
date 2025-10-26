// src/types/user.ts (CẬP NHẬT)

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: "customer" | "printer" | "admin";
  avatarUrl?: string;
  isVerified: boolean;
  phone?: string;

  // (MỚI) ID tham chiếu, bản thân profile sẽ được lưu riêng
  printerProfile?: string;

  // (ĐÃ XÓA) Các trường specialties, priceTier, productionSpeed, address
}
