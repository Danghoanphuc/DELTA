// apps/admin-backend/src/modules/upload/upload.routes.js
// Upload routes - Cloudinary for images, R2 for documents

import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { authenticate } from "../../shared/middleware/index.js";
import {
  uploadMemory,
  uploadVideo as uploadVideoMulter,
} from "../../infrastructure/storage/multer.config.js";
import {
  processImage,
  resizeOnly,
} from "../../shared/middleware/image-processor.middleware.js";

const router = Router();
const controller = new UploadController();

// All routes require authentication
router.use(authenticate);

// === IMAGE UPLOADS (Cloudinary) ===
// Full processing: resize 1200px, watermark, WebP, metadata
router.post(
  "/image",
  uploadMemory.single("file"),
  processImage,
  controller.uploadImage
);

// Avatar/thumbnail: resize only, no watermark
router.post(
  "/avatar",
  uploadMemory.single("file"),
  resizeOnly(400),
  controller.uploadImage
);
router.delete("/image/:publicId", controller.deleteImage);

// === VIDEO UPLOADS (Cloudinary) ===
router.post("/video", uploadVideoMulter.single("file"), controller.uploadVideo);

// === DOCUMENT UPLOADS (R2) ===
router.post("/document-url", controller.getDocumentUploadUrl);
router.get("/document-download", controller.getDocumentDownloadUrl);

export default router;
