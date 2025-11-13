// apps/admin-backend/src/controllers/admin.printer.controller.ts
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as printerService from "../services/admin.printer.service.js";
import { ValidationException } from "../shared/exceptions.js";

/**
 * Lấy danh sách nhà in chờ duyệt
 */
export const getPendingPrinters = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await printerService.getPendingPrinters(req.query);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách chờ duyệt thành công",
      data: result,
    });
  }
);

/**
 * Cập nhật trạng thái duyệt (Approve/Reject)
 */
export const verifyPrinter = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { action, reason } = req.body; // 'approve' hoặc 'reject'

    if (action !== "approve" && action !== "reject") {
      throw new ValidationException(
        "Hành động phải là 'approve' hoặc 'reject'"
      );
    }

    const updatedPrinter = await printerService.verifyPrinter(
      id,
      action,
      reason
    );
    res.status(200).json({
      success: true,
      message: `Đã ${action} nhà in ${updatedPrinter.businessName}.`,
      data: updatedPrinter,
    });
  }
);
