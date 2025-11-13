// src/modules/printer-studio/studio.routes.js
import { Router } from "express";
import { StudioController } from "./studio.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";

const router = Router();
const studioController = new StudioController();

// Định nghĩa các trường file mà middleware uploadStudioAssets sẽ xử lý
const studioUploadFields = [
  { name: "modelFile", maxCount: 1 },
  { name: "dielineFile", maxCount: 1 },
  { name: "productionFile", maxCount: 1 },
  { name: "previewFile", maxCount: 1 },
];

/**
 * @route   POST /api/printer-studio/publish
 * @desc    Tạo đồng thời Product (Phôi) và DesignTemplate (Mẫu)
 * @access  Private (Printer only)
 */
router.post(
  "/publish",
  protect,
  isPrinter,
  studioController.publishStudioAsset
);

export default router;
