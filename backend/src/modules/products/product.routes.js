// backend/src/modules/products/product.routes.js (✅ ĐÃ SỬA LỖI IMPORT)
import { Router } from "express";
import { ProductController } from "./product.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";
import {
  // ✅ SỬA 1: Thêm 'uploadImage' vào import
  uploadImage,
  uploadModel,
  uploadDieline,
} from "../../infrastructure/storage/multer.config.js";

const router = Router();
const productController = new ProductController();

// ============================================
// ✅ MỚI: UPLOAD 3D ASSETS (GLB + Dieline SVG)
// ============================================
// (Phần này đã đúng, giữ nguyên)
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

// ============================================
// PUBLIC ROUTES
// ============================================
// (Phần này đã đúng, giữ nguyên)
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// ============================================
// PRIVATE ROUTES (Printer only)
// ============================================
// (Phần này đã đúng, giữ nguyên)
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
  // ✅ SỬA 2: Đổi 'upload.array' thành 'uploadImage.array'
  uploadImage.array("images", 5),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Printer only - owner)
 */
// (Phần này đã đúng, giữ nguyên)
router.put("/:id", protect, isPrinter, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Printer only - owner)
 */
// (Phần này đã đúng, giữ nguyên)
router.delete("/:id", protect, isPrinter, productController.deleteProduct);

export default router;
