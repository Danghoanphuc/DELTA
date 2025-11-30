// apps/admin-backend/src/services/admin.user.service.ts
import { Model, Document } from "mongoose";
import jwt from "jsonwebtoken";
import { type IUser } from "@printz/types";
import { NotFoundException, ForbiddenException } from "../shared/exceptions.js";
import { type IAdmin } from "../models/admin.model.js";

// --- ✅ IMPORT SHARED MODELS TỪ @printz/types ---
import { User as CustomerUserModelJS } from "@printz/types";
import "@printz/types/models/customer-profile.model.js";
import "@printz/types/models/printer-profile.model.js";

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
      .select("-passwordHash") // (Đảm bảo đúng tên trường password)
      .lean(),
    CustomerModel.countDocuments(query),
  ]);

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
