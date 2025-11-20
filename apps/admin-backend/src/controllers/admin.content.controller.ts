import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as contentService from "../services/admin.content.service.js";
import { ValidationException } from "../shared/exceptions.js";
import { type IAdmin } from "../models/admin.model.js";

const getAdminOrThrow = (req: Request): IAdmin => {
  const admin = req.admin;
  if (!admin) {
    throw new ValidationException("Yêu cầu đăng nhập Admin.");
  }
  return admin;
};

export const getPendingAssets = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { type } = req.query;
    const assets = await contentService.getPendingAssets(
      type?.toString?.()
    );
    res.status(200).json({
      success: true,
      data: assets,
    });
  }
);

export const flagAsset = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id, type, reason } = req.body as {
      id?: string;
      type?: "product" | "template";
      reason?: string;
    };

    if (!id) {
      throw new ValidationException("Thiếu ID asset.");
    }

    if (!type) {
      throw new ValidationException("Thiếu loại asset.");
    }

    if (!reason) {
      throw new ValidationException("Thiếu lý do gắn cờ.");
    }

    const admin = getAdminOrThrow(req);

    const updatedAsset = await contentService.flagAsset({
      id,
      type,
      reason,
      admin,
      context: {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Đã gắn cờ asset thành công.",
      data: updatedAsset,
    });
  }
);

