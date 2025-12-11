// apps/admin-backend/src/services/admin.user.service.ts
import { Model, Document } from "mongoose";
import jwt from "jsonwebtoken";
import { type IUser } from "@printz/types";
import { NotFoundException, ForbiddenException } from "../shared/exceptions.js";
import { type IAdmin } from "../models/admin.model.js";

// --- ✅ IMPORT SHARED MODELS TỪ @printz/types ---
import { User as CustomerUserModelJS } from "@printz/types";
// Side-effect imports để đảm bảo models được register
import "@printz/types/models/customer-profile.model";
import "@printz/types/models/printer-profile.model";
import "@printz/types/models/shipper-profile.model";
import { ShipperProfile } from "@printz/types";

type ICustomerUserModel = Model<
  IUser &
    Document & {
      // (Giả định IUser từ @printz/types có 'role')
      role: "customer" | "printer" | "admin";
      // (Giả định IUser từ @printz/types có 'status')
      status: "active" | "banned" | "pending";
    }
>;

const CustomerModel = CustomerUserModelJS as unknown as ICustomerUserModel;
// --- KẾT THÚC KỸ THUẬT IMPORT ---

/**
 * Lấy danh sách Users (với phân trang và filter)
 */
export const getListUsers = async (
  page: number,
  limit: number,
  status: "all" | "active" | "banned",
  search: string
) => {
  const query: any = {};

  if (status !== "all") {
    // ✅ SỬA LỖI LOGIC A (Part 1):
    // Tìm theo 'status' thay vì 'isActive'
    query.status = status;
  }

  if (search) {
    query.$or = [
      { email: { $regex: search, $options: "i" } },
      // (Giả định 'displayName' tồn tại trên 'IUser' từ @printz/types)
      { displayName: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    CustomerModel.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .select(
        "_id email displayName avatarUrl phone status createdAt printerProfileId customerProfileId organizationProfileId shipperProfileId"
      )
      .lean(),
    CustomerModel.countDocuments(query),
  ]);

  // Debug log
  console.log(
    "[DEBUG] First user shipperProfileId:",
    users[0]?.shipperProfileId
  );

  return {
    data: users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Cập nhật trạng thái (ban/unban)
 */
export const updateUserStatus = async (
  userId: string,
  status: "active" | "banned"
) => {
  // ✅ SỬA LỖI LOGIC A (Part 2):
  // Cập nhật 'status' thay vì 'isActive'
  const updatedUser = await CustomerModel.findByIdAndUpdate(
    userId,
    { status: status }, // Sửa từ { isActive: isActive }
    { new: true }
  ).select("-passwordHash"); // (Đảm bảo đúng tên trường password)

  if (!updatedUser) {
    throw new NotFoundException("Người dùng", userId);
  }

  return updatedUser;
};

/**
 * Giả mạo đăng nhập (Impersonate)
 */
export const impersonateUser = async (
  adminUser: IAdmin,
  userIdToImpersonate: string
) => {
  const targetUser = await CustomerModel.findById(userIdToImpersonate);

  if (!targetUser) {
    throw new NotFoundException("Người dùng để giả mạo", userIdToImpersonate);
  }

  // ✅ SỬA LỖI LOGIC B:
  // Dùng 'role' thay vì 'isAdmin'
  if (targetUser.role === "admin") {
    throw new ForbiddenException("Không thể giả mạo tài khoản Admin");
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Lỗi cấu hình: Thiếu ACCESS_TOKEN_SECRET");
  }

  console.log(
    `[ADMIN] Admin '${adminUser.email}' (ID: ${adminUser._id}) đang giả mạo User (ID: ${userIdToImpersonate})`
  );

  // Tạo token
  const accessToken = jwt.sign(
    {
      userId: targetUser._id,
      role: targetUser.role,
      isImpersonating: true,
      impersonatedBy: adminUser._id,
    },
    secret,
    { expiresIn: "15m" }
  );

  return { accessToken };
};

/**
 * Toggle Shipper Role - Đổi user thành shipper hoặc remove shipper role
 */
export const toggleShipperRole = async (userId: string) => {
  // Cast to any để access các fields từ mongoose schema
  const user = (await CustomerModel.findById(userId)) as any;

  if (!user) {
    throw new NotFoundException("Người dùng", userId);
  }

  // Check if user already has shipper profile
  if (user.shipperProfileId) {
    // Remove shipper role
    await ShipperProfile.findByIdAndDelete(user.shipperProfileId);
    user.shipperProfileId = null;
    await user.save();

    return {
      success: true,
      message: "Đã xóa vai trò Shipper",
      isShipper: false,
    };
  } else {
    // Add shipper role
    // Check if shipper profile already exists for this user (edge case)
    let shipperProfile = await ShipperProfile.findOne({ userId: user._id });

    if (!shipperProfile) {
      // Create new shipper profile with minimal data
      shipperProfile = new ShipperProfile({
        userId: user._id,
        phoneNumber: user.phone || "", // Use user's phone if available
        isActive: true,
      });
      await shipperProfile.save();
    }

    // Link to user
    user.shipperProfileId = shipperProfile._id;
    await user.save();

    return {
      success: true,
      message: "Đã thêm vai trò Shipper",
      isShipper: true,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        shipperProfileId: user.shipperProfileId,
      },
    };
  }
};
