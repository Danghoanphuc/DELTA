/**
 * Admin Supplier Routes
 * Routes for supplier management and performance tracking
 *
 * Phase 8.1.3: Supplier Routes
 */

import { Router } from "express";
import { AdminSupplierController } from "../controllers/admin.supplier.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new AdminSupplierController();

// Apply authentication to all routes
router.use(authenticate);

// ============================================
// SUPPLIER PERFORMANCE ROUTES
// ============================================

/**
 * @route   GET /api/admin/suppliers/compare
 * @desc    Compare suppliers by performance
 * @access  Admin
 * @query   supplierIds - Comma-separated supplier IDs (optional)
 */
router.get("/compare", controller.compareSuppliers);

/**
 * @route   GET /api/admin/suppliers/top
 * @desc    Get top performing suppliers
 * @access  Admin
 * @query   limit - Number of suppliers to return (default: 10)
 */
router.get("/top", controller.getTopSuppliers);

/**
 * @route   GET /api/admin/suppliers/low-performing
 * @desc    Get low performing suppliers
 * @access  Admin
 * @query   onTimeThreshold - On-time delivery threshold (default: 80)
 * @query   qualityThreshold - Quality score threshold (default: 90)
 */
router.get("/low-performing", controller.getLowPerformingSuppliers);

/**
 * @route   POST /api/admin/suppliers/refresh-metrics
 * @desc    Refresh all supplier metrics
 * @access  Admin
 */
router.post("/refresh-metrics", controller.refreshAllMetrics);

/**
 * @route   GET /api/admin/suppliers/:id/performance
 * @desc    Get supplier performance metrics
 * @access  Admin
 * @param   id - Supplier ID
 */
router.get("/:id/performance", controller.getSupplierPerformance);

/**
 * @route   GET /api/admin/suppliers/:id/lead-time-history
 * @desc    Get supplier lead time history
 * @access  Admin
 * @param   id - Supplier ID
 */
router.get("/:id/lead-time-history", controller.getLeadTimeHistory);

/**
 * @route   PUT /api/admin/suppliers/:id/rating
 * @desc    Update supplier rating
 * @access  Admin
 * @param   id - Supplier ID
 * @body    rating - Rating (0-5)
 */
router.put("/:id/rating", controller.updateSupplierRating);

// ============================================
// SUPPLIER POSTS ROUTES
// ============================================

/**
 * @route   POST /api/admin/suppliers/:supplierId/posts
 * @desc    Create a new post for supplier
 * @access  Admin
 */
router.post("/:supplierId/posts", controller.createPost);

/**
 * @route   GET /api/admin/suppliers/:supplierId/posts
 * @desc    Get posts by supplier
 * @access  Admin
 */
router.get("/:supplierId/posts", controller.getPostsBySupplier);

export default router;
