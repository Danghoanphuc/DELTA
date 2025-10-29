// src/modules/products/product.routes.js (✅ UPDATED - PUBLIC ACCESS)
import { Router } from "express";
import { ProductController } from "./product.controller.js";
import {
  protect,
  isPrinter,
  optionalAuth,
} from "../../shared/middleware/index.js";
import { upload } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const productController = new ProductController();

/**
 * Product Routes
 *
 * ✅ UPDATED: PUBLIC ROUTES for browsing
 * - GET  /api/products              - Get all products (PUBLIC - no auth needed)
 * - GET  /api/products/:id          - Get product by ID (PUBLIC - no auth needed)
 *
 * PRIVATE ROUTES (Printer only):
 * - POST   /api/products            - Create product
 * - PUT    /api/products/:id        - Update product
 * - DELETE /api/products/:id        - Delete product
 * - GET    /api/products/my-products - Get my products
 */

// ============================================
// ✅ PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/products
 * @desc    Get all active products (with filters)
 * @query   ?category=...&search=...&sort=...
 * @access  PUBLIC ← Bất kỳ ai cũng có thể xem
 */
router.get("/", productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @param   id - Product ID
 * @access  PUBLIC ← Bất kỳ ai cũng có thể xem chi tiết
 */
router.delete("/:id", protect, isPrinter, productController.deleteProduct);

// ============================================
// PRIVATE ROUTES (Authentication required)
// ============================================

/**
 * IMPORTANT: Specific routes MUST come before dynamic routes (:id)
 * Otherwise Express will match "/my-products" as an :id parameter
 */

/**
 * @route   GET /api/products/my-products
 * @desc    Get all products owned by authenticated printer
 * @access  Private (Printer only)
 */
router.get("/my-products", protect, isPrinter, productController.getMyProducts);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @body    { name, category, description, pricing, specifications, ... }
 * @files   images[] (max 5, JPEG/PNG/WEBP, max 5MB each)
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
 * @param   id - Product ID
 * @access  Private (Printer only - owner)
 */
router.put("/:id", protect, isPrinter, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (soft delete)
 * @param   id - Product ID
 * @access  Private (Printer only - owner)
 */
router.get("/:id", productController.getProductById);

export default router;
