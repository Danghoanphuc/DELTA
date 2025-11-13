// apps/admin-backend/src/routes/dashboard.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

/**
 * [GET] /api/admin/dashboard/stats
 * Lấy dữ liệu thống kê cho dashboard
 *
 * Yêu cầu: Đã đăng nhập (Authenticated)
 * Yêu cầu vai trò: 'superadmin' hoặc 'finance'
 */
router.get(
  "/stats",
  isAuthenticatedAdmin, // Gác cổng 1: Phải đăng nhập
  hasRole(["superadmin", "finance"]), // <-- SỬA LỖI: Truyền vào 1 mảng
  getDashboardStats
);

export default router;
