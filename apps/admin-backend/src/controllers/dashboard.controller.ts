// apps/admin-backend/src/controllers/dashboard.controller.ts
import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js"; // <-- Giờ file này đã tồn tại

/**
 * Controller lấy dữ liệu thống kê Dashboard
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await dashboardService.getDashboardStats();

    res.status(200).json({
      status: "success",
      message: "Lấy dữ liệu dashboard thành công.",
      data,
    });
  }
);
