// packages/types/src/user.types.ts
import { Types } from "./mongoose.types.js";

/**
 * @description "Hợp đồng" cho Địa chỉ (Chân lý)
 */
export interface IAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * @description "Hợp đồng" cho User (Tài khoản)
 * ✅ BẢN VÁ: Bổ sung các trường mà admin-frontend cần
 */
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string; // (Backend-only)
  role: "customer" | "printer" | "admin";

  googleId?: string;
  isEmailVerified: boolean;

  customerProfile?: Types.ObjectId | ICustomerProfile; // Cho phép populate
  printerProfile?: Types.ObjectId; // Ref: PrinterProfile
  shipperProfileId?: Types.ObjectId; // Ref: ShipperProfile
  organizationProfileId?: Types.ObjectId; // Ref: OrganizationProfile

  // === BỔ SUNG CÁC TRƯỜNG CÒN THIẾU ===

  // 1. Thay thế cho 'isActive' mà component đang dùng
  status: "active" | "banned" | "pending";

  // 2. Thông tin profile (thường được populate hoặc thêm vào)
  // (Nếu API của anh trả về các trường này ở cấp cao nhất)
  displayName: string;
  avatarUrl?: string;
  // ===================================

  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description "Hợp đồng" cho Hồ sơ Khách hàng
 */
export interface ICustomerProfile {
  _id: Types.ObjectId;
  owner: Types.ObjectId; // Ref: User

  firstName: string;
  lastName: string;
  phoneNumber?: string;

  addresses?: IAddress[]; // (Sử dụng IAddress)

  // (Nếu displayName và avatarUrl nằm trong đây, hãy bỏ chúng ở IUser)
  // displayName: string;
  // avatarUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}
