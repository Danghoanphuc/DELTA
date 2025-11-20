// apps/admin-backend/src/routes/admin.routes.ts
import express from "express";
const { Router } = express;
import * as authController from "../controllers/admin.auth.controller.js";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

// === Auth Routes (Public) - ✅ SECURITY: Rate limited to prevent brute force ===
router.post("/signin", authRateLimiter, authController.signIn);
router.post("/forgot-password", authRateLimiter, authController.requestPasswordReset);
router.post("/reset-password", authRateLimiter, authController.resetPassword);

// === Protected Routes (Yêu cầu đăng nhập) ===
// Giờ middleware mới được áp dụng
router.get("/me", isAuthenticatedAdmin, authController.getMe);
router.post("/signout", isAuthenticatedAdmin, authController.signOut);
router.post(
  "/password",
  isAuthenticatedAdmin,
  authController.updatePassword
);

// API Route mẫu cho Finance
router.get(
  "/finance/reports",
  isAuthenticatedAdmin,
  hasRole(["superadmin", "finance"]),
  (req, res) => {
    res.json({ message: "Báo cáo tài chính cho " + req.admin?.role });
  }
);

export default router;
