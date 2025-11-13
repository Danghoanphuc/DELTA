// apps/admin-backend/src/routes/tier-rule.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as controller from "../controllers/tier-rule.controller.js";

const router = Router();

// === BẢO VỆ TẤT CẢ ROUTE ===
// Chỉ SUPER ADMIN mới được quyền thay đổi "luật chơi" (phí hoa hồng)
router.use(isAuthenticatedAdmin, hasRole(["superadmin"]));

/**
 * [GET] /api/admin/tier-rules
 * Lấy tất cả các luật
 */
router.get("/", controller.handleGetAllTierRules);

/**
 * [POST] /api/admin/tier-rules
 * Tạo hoặc cập nhật một luật
 */
router.post("/upsert", controller.handleUpsertTierRule);

/**
 * [GET] /api/admin/tier-rules/:id
 * Lấy chi tiết 1 luật
 */
router.get("/:id", controller.handleGetTierRuleById);

export default router;
