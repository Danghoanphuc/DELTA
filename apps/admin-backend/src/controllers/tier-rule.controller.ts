// apps/admin-backend/src/controllers/tier-rule.controller.ts
import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as tierRuleService from "../services/tier-rule.service.js";

export const handleGetAllTierRules = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const rules = await tierRuleService.getAllTierRules();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách luật thành công.",
      data: rules,
    });
  }
);

export const handleGetTierRuleById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const rule = await tierRuleService.getTierRuleById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Lấy chi tiết luật thành công.",
      data: rule,
    });
  }
);

export const handleUpsertTierRule = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Dùng 1 hàm cho cả Tạo mới và Cập nhật
    const rule = await tierRuleService.upsertTierRule(req.body);
    res.status(200).json({
      success: true,
      message: `Đã cập nhật/tạo luật cho bậc ${rule.tier} thành công.`,
      data: rule,
    });
  }
);
