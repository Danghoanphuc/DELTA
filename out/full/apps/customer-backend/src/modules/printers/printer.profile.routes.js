// src/modules/printers/printer.routes.js
import { Router } from "express";
import { PrinterController } from "./printer.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";
import { uploadLegalDocs } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const printerController = new PrinterController();

// === PUBLIC ROUTES ===
router.post("/onboarding", protect, printerController.createMyProfile);

/**
 * HÀM MỚI: Endpoint công khai để tải gallery (dữ liệu nặng)
 * @route   GET /api/printers/public-gallery/:profileId
 * @desc    Lấy gallery ảnh/video của nhà in (cho lazy-load)
 * @access  Public
 */
router.get("/public-gallery/:profileId", printerController.getPublicGallery);

// === PRIVATE ROUTES (Printer Profile Management) ===
// (Các route private khác giữ nguyên)
router.get("/my-profile", protect, isPrinter, printerController.getMyProfile);
router.put("/profile", protect, isPrinter, printerController.updateMyProfile);
router.put(
  "/submit-verification",
  protect,
  isPrinter,
  uploadLegalDocs,
  printerController.submitVerificationDocs
);

export default router;
