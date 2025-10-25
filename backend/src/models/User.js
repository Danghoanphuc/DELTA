// backend/src/models/User.js (CẬP NHẬT)
import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    // --- Thông tin cơ bản ---
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, select: false },

    // --- Vai trò ---
    role: {
      type: String,
      enum: ["customer", "printer", "admin"],
      default: "customer",
    },

    // --- OAuth ---
    authMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },

    // --- Profile ---
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    phone: { type: String, unique: true, sparse: true },

    // --- Địa chỉ ---
    address: {
      street: String,
      ward: String,
      district: String,
      city: String,
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },
    specialties: {
      type: [String], // Một mảng các Chuỗi (vd: ["áo thun", "cốc sứ"])
      default: [], // Mặc định là một mảng rỗng
    },
    // *** THÊM 2 TRƯỜNG MỚI NÀY VÀO ***
    priceTier: {
      type: String,
      enum: ["cheap", "standard", "premium"], // Phân khúc giá: Rẻ, TB, Cao cấp
      default: "standard", // Mặc định là 'standard'
    },
    productionSpeed: {
      type: String,
      enum: ["fast", "standard"], // Tốc độ sản xuất: Nhanh, TB
      default: "standard", // Mặc định là 'standard'
    },
    // --- Xác thực ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiresAt: { type: Date, select: false },

    // --- Metadata ---
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index cho tìm kiếm địa lý
UserSchema.index({ "address.location": "2dsphere" }); // <-- 2. Dòng 'index' của bạn
// *** ĐẢM BẢO DÒNG NÀY ĐÃ CÓ ***
UserSchema.index({
  "address.city": "text",
  "address.district": "text",
  displayName: "text",
});
// <-- 3. Tạo và XUẤT model bằng 'export default'
export const User = mongoose.model("User", UserSchema);
