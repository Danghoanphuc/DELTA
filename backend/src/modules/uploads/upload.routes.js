// src/modules/uploads/upload.routes.js
import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { protect, handleUploadError } from "../../shared/middleware/index.js";
import { uploadMixed } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const uploadController = new UploadController();

/**
 * @route   POST /api/uploads/file
 * @desc    Uploads a single file (GLB, SVG, Image)
 * @access  Private
 */
router.post(
  "/file",
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
