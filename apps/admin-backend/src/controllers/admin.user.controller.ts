// apps/admin-backend/src/controllers/admin.user.controller.ts
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as userService from "../services/admin.user.service.js";
import { ValidationException } from "../shared/exceptions.js";
import { IAdmin } from "../models/admin.model.js"; // Import IAdmin

/**
 * Lấy danh sách User (Phân trang, tìm kiếm)
 */
export const getListUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Phân rã req.query và cung cấp giá trị mặc định
    const { page = 1, limit = 10, status = "all", search = "" } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const validStatus =
      status === "active" || status === "banned" ? status : "all";

    // Gọi service với 4 tham số chính xác
    const result = await userService.getListUsers(
      pageNum,
      limitNum,
      validStatus,
      search as string
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      data: result,
    });
  }
);

/**
 * Cập nhật trạng thái User (Ban / Unban)
 */
export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body; // "active" hoặc "banned"

    if (status !== "active" && status !== "banned") {
      throw new ValidationException(
        "Trạng thái phải là 'active' hoặc 'banned'"
      );
    }

    const updatedUser = await userService.updateUserStatus(id, status);
    res.status(200).json({
      success: true,
      message: `Cập nhật người dùng ${updatedUser.email} thành ${status} thành công.`,
      data: updatedUser,
    });
  }
);

/**
 * Giả mạo đăng nhập
 */
export const impersonateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // ID của user cần giả mạo

    // (File 'index.d.ts' bên dưới sẽ sửa lỗi type cho 'req.user')
    const adminUser = req.user as IAdmin;

    if (!adminUser) {
      return next(new ValidationException("Yêu cầu thông tin admin"));
    }

    const result = await userService.impersonateUser(adminUser, id);
    res.status(200).json({
      success: true,
      message: "Giả mạo đăng nhập thành công",
      data: result,
    });
  }
);
