// frontend/src/types/user.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  role: "customer" | "printer" | "admin";
  avatarUrl?: string;
  isVerified: boolean;
  phone?: string;
  printerProfile?: string; // ID tham chiếu đến PrinterProfile
  createdAt?: string;
  updatedAt?: string;
}
