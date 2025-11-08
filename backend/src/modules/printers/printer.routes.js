// src/modules/printers/printer.routes.js
// BÀN GIAO: Đã sửa lỗi import (thêm 'isPrinter')

import { Router } from "express";
import printerProfileRoutes from "./printer.profile.routes.js";
import { PrinterController } from "./printer.controller.js";
// ✅ SỬA DÒNG NÀY:
import { protect, isPrinter } from "../../shared/middleware/index.js";
// ✅ 1. Import multer uploader mới
import { uploadLegalDocs } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const printerController = new PrinterController(); // ✅ KHỞI TẠO

// === CÁC ROUTE CÔNG KHAI (PUBLIC) ===
// (Không có)

// ✅ GIAI ĐOẠN 1: ONBOARDING
router.post("/onboarding", protect, printerController.createMyProfile);

// === CÁC ROUTE CỦA NHÀ IN (PRINTER) ===
// Các route này sẽ chạy middleware 'protect' và 'isPrinter'
router.use("/", printerProfileRoutes);

// ✅ GIAI ĐOẠN 2: SUBMIT HỒ SƠ XÁC THỰC
router.put(
  "/submit-verification",
  protect,
  isPrinter, // <-- Giờ biến này đã được định nghĩa
  uploadLegalDocs, // Dùng multer upload trước
  printerController.submitVerificationDocs // Gọi controller sau
);

export default router;
