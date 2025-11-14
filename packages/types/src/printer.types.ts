// packages/types/src/printer.types.ts
import { Types } from "./mongoose.types.js";
import { IAddress } from "./user.types.js";

/**
 * @description Các hạng của Nhà in (Kiểu Type)
 * (Đã thêm lại ở lượt 44)
 */
export enum PrinterTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
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
} as const; // Dùng "as const" để bảo vệ giá trị

/**
 * @description Trạng thái Onboarding của Nhà in với Stripe.
 * (Type Alias - Đã sửa ở lượt 41)
 */
export type StripeAccountStatus =
  | "ONBOARDING_REQUIRED"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "RESTRICTED"
  | "UNKNOWN";

/**
 * @description "Hợp đồng" cho Mongoose Model (Đã vá ở lượt 41)
 */
export interface IPrinterProfile {
  _id: Types.ObjectId;
  owner: Types.ObjectId; // Ref: User
  ownerEmail: string;
  businessName: string;

  phoneNumber?: string;
  businessAddress?: IAddress; // (Import từ File 2)
  status?: "Pending" | "Approved" | "Rejected";

  tier?: PrinterTier; // (Dùng enum ở trên)

  // (Đã vá ở lượt 41)
  stripeAccountId?: string;
  stripeAccountStatus?: StripeAccountStatus;

  createdAt: Date;
  updatedAt: Date;
}
