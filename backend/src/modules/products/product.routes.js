// backend/src/modules/products/product.routes.js (✅ CẬP NHẬT)
import { Router } from "express";
import { ProductController } from "./product.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";
import {
  upload,
  uploadModel,
  uploadDieline,
} from "../../infrastructure/storage/multer.config.js";

const router = Router();
const productController = new ProductController();

// ============================================
// ✅ MỚI: UPLOAD 3D ASSETS (GLB + Dieline SVG)
// ============================================

/**
 * @route   POST /api/products/upload-3d-assets
 * @desc    Upload GLB model và Dieline SVG
 * @access  Private (Printer only)
 * @body    { category: string }
 * @files   { modelFile: File, dielineFile: File }
 */
router.post(
  "/upload-3d-assets",
  protect,
  isPrinter,
  uploadModel.fields([
    { name: "modelFile", maxCount: 1 },
    { name: "dielineFile", maxCount: 1 }, // Có thể null
  ]),
  productController.upload3DAssets
);

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/products
 * @desc    Get all active products
 * @access  PUBLIC
 */
router.get("/", productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  PUBLIC
 */
router.get("/:id", productController.getProductById);

// ============================================
// PRIVATE ROUTES (Printer only)
// ============================================

/**
 * @route   GET /api/products/my-products
 * @desc    Get all products owned by authenticated printer
 * @access  Private (Printer only)
 */
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
  upload.array("images", 5),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Printer only - owner)
 */
router.put("/:id", protect, isPrinter, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Printer only - owner)
 */
router.delete("/:id", protect, isPrinter, productController.deleteProduct);

export default router;
