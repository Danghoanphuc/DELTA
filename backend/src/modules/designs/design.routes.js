// src/modules/designs/design.routes.js
import { Router } from "express";
import { DesignController } from "./design.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js"; //
import { uploadDesignTemplate } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const designController = new DesignController();
const templateUploadFields = [
  { name: "previewFile", maxCount: 1 }, // Tên khớp với frontend (File 1)
  { name: "productionFile", maxCount: 1 }, // Tên khớp với frontend (File 1)
];
// --- Printer Routes (Quản lý "Kho mẫu") ---
router.get(
  "/customized/my-designs",
  protect, // Yêu cầu đăng nhập
  designController.getMyCustomizedDesigns
);

router.post(
  "/templates",
  protect,
  isPrinter,
  uploadDesignTemplate.fields(templateUploadFields),
  designController.createTemplate
);

router.get(
  "/templates/my-templates",
  protect,
  isPrinter,
  designController.getMyTemplates
);

// --- Public Routes (User xem "Kho mẫu") ---
router.get("/templates/public", designController.getPublicTemplates);
router.get("/templates/:id", designController.getTemplateById); // User/Printer đều xem được

// --- User Routes (Lưu thiết kế tùy chỉnh) ---
router.post("/customized", protect, designController.createCustomizedDesign);
router.get("/customized/:id", protect, designController.getCustomizedDesign);

export default router;
