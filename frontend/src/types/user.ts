// frontend/src/types/user.ts

export interface User {
  _id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
  phone?: string;
  role: 'customer' | 'printer' | 'admin';

  // --- THAY THẾ 'role' ---
  customerProfileId: string;
  printerProfileId: string | null; // Có thể chưa phải là nhà in
  // role: (Đã xóa)
  // printerProfile: (Đã xóa)

  createdAt?: string;
  updatedAt?: string;
}
