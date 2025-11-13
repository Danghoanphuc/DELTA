// apps/admin-backend/src/routes/admin.user.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as userController from "../controllers/admin.user.controller.js";

const router = Router();

// Tất cả các route trong file này đều yêu cầu đăng nhập Admin
router.use(isAuthenticatedAdmin);

/**
 * [GET] /api/admin/users
 * Lấy danh sách Users (phân trang, filter)
 * Quyền: Superadmin, Support
 */
router.get(
  "/",
  hasRole(["superadmin", "support"]),
  userController.getListUsers
);

/**
 * [PATCH] /api/admin/users/:id/status
 * Cập nhật trạng thái (ban/unban)
 * Quyền: Superadmin, Support
 */
router.patch(
  "/:id/status",
  hasRole(["superadmin", "support"]),
  userController.updateUserStatus
);

/**
 * [POST] /api/admin/users/:id/impersonate
 * Lấy token giả mạo của User
 * Quyền: CHỈ Superadmin
 */
router.post(
  "/:id/impersonate",
  hasRole(["superadmin"]),
  userController.impersonateUser
);

export default router;
