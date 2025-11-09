// backend/src/modules/products/product.routes.js (✅ ĐÃ CẬP NHẬT)
import { Router } from "express";
import { ProductController } from "./product.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";
import {
  uploadImage,
  uploadModel,
  uploadDieline,
} from "../../infrastructure/storage/multer.config.js";
// ✅ ĐÍCH 1: Import middleware mới
import { parseJsonFields } from "../../shared/middleware/parse-form-data.middleware.js";

const router = Router();
const productController = new ProductController();

// ... (Các route /upload-3d-assets, GET /, GET /:id, GET /my-products giữ nguyên) ...
router.post(
  "/upload-3d-assets",
  protect,
  isPrinter,
  uploadModel.fields([
    { name: "modelFile", maxCount: 1 },
    { name: "dielineFile", maxCount: 1 },
  ]),
  productController.upload3DAssets
);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/my-products", protect, isPrinter, productController.getMyProducts);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Printer only)
 */
router.post(
  "/",
  protect,
  isPrinter,
  uploadImage.array("images", 5), // Step 1: Multer xử lý file
  // ✅ ĐÍCH 1: Middleware mới parse JSON
  parseJsonFields(["pricing", "specifications", "assets"]), // Step 2: Parse JSON
  productController.createProduct // Step 3: Controller nhận data sạch
);

// ... (Các route PUT /:id và DELETE /:id giữ nguyên) ...
router.put("/:id", protect, isPrinter, productController.updateProduct);
router.delete("/:id", protect, isPrinter, productController.deleteProduct);

export default router;
