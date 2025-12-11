// frontend/src/types/user.ts

export interface User {
  _id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
  phone?: string;
  role: "customer" | "printer" | "organization" | "admin";

  // --- Profile Links ---
  customerProfileId: string;
  printerProfileId: string | null;
  organizationProfileId: string | null; // ✅ NEW: B2B Organization
  shipperProfileId: string | null; // ✅ NEW: Shipper Profile

  createdAt?: string;
  updatedAt?: string;
}
