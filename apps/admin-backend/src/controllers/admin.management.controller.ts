import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as adminManagementService from "../services/admin.management.service.js";
import { ValidationException } from "../shared/exceptions.js";

export const listAdmins = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = "1", limit = "20", search, role, status } = req.query;

    const result = await adminManagementService.listAdmins({
      page: Number(page),
      limit: Number(limit),
      search: search as string | undefined,
      role: role as any,
      status: status as any,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const createAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const actor = req.admin;
    if (!actor) {
      throw new ValidationException("Thiếu thông tin admin");
    }

    const newAdmin = await adminManagementService.createAdminAccount(
      req.body,
      actor,
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }
    );

    res.status(201).json({
      success: true,
      message: "Tạo admin mới thành công",
      data: newAdmin,
    });
  }
);

export const updateAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const actor = req.admin;
    if (!actor) {
      throw new ValidationException("Thiếu thông tin admin");
    }

    const { id } = req.params;
    if (!id) {
      throw new ValidationException("Thiếu ID admin");
    }

    if (
      actor._id.toString() === id &&
      typeof req.body.isActive === "boolean" &&
      req.body.isActive === false
    ) {
      throw new ValidationException(
        "Bạn không thể tự vô hiệu hóa tài khoản của chính mình"
      );
    }

    const updatedAdmin = await adminManagementService.updateAdminAccount(
      id,
      req.body,
      actor,
      {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật admin thành công",
      data: updatedAdmin,
    });
  }
);

