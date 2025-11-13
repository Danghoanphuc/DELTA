// apps/admin-backend/src/routes/admin.printer.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as printerController from "../controllers/admin.printer.controller.js";

const router = Router();

// Tất cả các route này đều yêu cầu đăng nhập Admin
// và có vai trò 'vetting' hoặc 'superadmin'
router.use(isAuthenticatedAdmin, hasRole(["superadmin", "vetting"]));

/**
 * [GET] /api/admin/printers/vetting
 * Lấy danh sách nhà in đang chờ duyệt
 */
router.get("/vetting", printerController.getPendingPrinters);

/**
 * [PATCH] /api/admin/printers/:id/verify
 * Duyệt (approve/reject) một nhà in
 */
router.patch("/:id/verify", printerController.verifyPrinter);

export default router;
