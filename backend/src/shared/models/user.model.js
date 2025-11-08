import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // --- Thông tin Danh tính (Identity) ---
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    phone: { type: String, unique: true, sparse: true },

    // --- Phương thức Xác thực ---
    hashedPassword: { type: String, select: false },
    authMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },

    // --- Trạng thái Xác thực ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiresAt: { type: Date, select: false },

    // --- LIÊN KẾT HỒ SƠ (THAY THẾ CHO 'role') ---
    customerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerProfile", // <-- Sẽ tạo model này
      required: true,
    },
    printerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrinterProfile", // <-- Đã có model này
      default: null,
      index: true,
    },

    // (Trong tương lai có thể thêm designerProfileId,...)

    // --- Metadata ---
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },

    // --- XÓA CÁC TRƯỜNG CŨ ---
    // username: (Đã xóa, dùng email làm định danh)
    // role: (Đã xóa, thay bằng liên kết hồ sơ)
    // printerProfile: (Đã xóa, đổi tên thành printerProfileId cho nhất quán)
  },
  { timestamps: true }
);

UserSchema.index({ displayName: "text", email: "text" });

export const User = mongoose.model("User", UserSchema);
