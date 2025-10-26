// backend/src/routes/printerRoute.js (CẬP NHẬT)

import express from "express";
import {
  updatePrinterProfile,
  getMyPrinterProfile, // <-- THÊM IMPORT
} from "../controllers/printerController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả route trong file này đều yêu cầu đăng nhập
router.use(isAuthenticated);

// Cập nhật hồ sơ
router.put("/profile", updatePrinterProfile);

// (MỚI) Lấy hồ sơ (cho frontend)
router.get("/my-profile", getMyPrinterProfile);

export default router;
