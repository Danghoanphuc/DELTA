// src/modules/uploads/upload.routes.js
import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { protect, handleUploadError } from "../../shared/middleware/index.js";
import { uploadMixed } from "../../infrastructure/storage/multer.config.js";
// ✅ SECURITY: Import upload rate limiter
import { uploadRateLimiter } from "../../shared/middleware/rate-limit.middleware.js";

const router = Router();
const uploadController = new UploadController();

/**
 * @route   POST /api/uploads/file
 * @desc    Uploads a single file (GLB, SVG, Image)
 * @access  Private
 * @rateLimit 20 uploads per hour per user/IP
 */
router.post(
  "/file",
  uploadRateLimiter, // ✅ SECURITY: Rate limit to protect Cloudinary storage
  protect,
  uploadMixed.single("file"),
  handleUploadError,
  uploadController.uploadSingleFile
);

/**
 * ✅ MỚI: Endpoint dọn rác
 * @route   POST /api/uploads/cleanup-orphan
 * @desc    Xóa file trên Cloudinary (nếu lưu DB lỗi)
 * @access  Private (Chỉ user đã login mới được gọi)
 */
router.post("/cleanup-orphan", protect, uploadController.cleanupOrphanedFile);

export default router;
