// backend/src/routes/printerRoute.js

import express from "express";
import { updatePrinterProfile } from "../controllers/printerController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Định nghĩa route: PUT /api/printer/profile
// 1. Phải đăng nhập (isAuthenticated)
// 2. Chạy hàm updatePrinterProfile
router.put("/profile", isAuthenticated, updatePrinterProfile);

export default router;
