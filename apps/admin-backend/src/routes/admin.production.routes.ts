// apps/admin-backend/src/routes/admin.production.routes.ts
// ✅ Production Order Routes
// Phase 5.1.3: Production Order Management - Routing Layer

import { Router } from "express";
import { ProductionController } from "../controllers/admin.production.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new ProductionController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/admin/production-orders/statistics
 * @desc Get production statistics
 * @access Admin
 */
router.get("/statistics", controller.getProductionStatistics);

/**
 * @route GET /api/admin/production-orders/delayed
 * @desc Get delayed production orders
 * @access Admin
 */
router.get("/delayed", controller.getDelayedProductionOrders);

/**
 * @route GET /api/admin/production-orders/swag-order/:swagOrderId
 * @desc Get production orders by swag order
 * @access Admin
 */
router.get(
  "/swag-order/:swagOrderId",
  controller.getProductionOrdersBySwagOrder
);

/**
 * @route GET /api/admin/production-orders/supplier/:supplierId
 * @desc Get production orders by supplier
 * @access Admin
 */
router.get("/supplier/:supplierId", controller.getProductionOrdersBySupplier);

/**
 * @route GET /api/admin/production-orders/status/:status
 * @desc Get production orders by status
 * @access Admin
 */
router.get("/status/:status", controller.getProductionOrdersByStatus);

/**
 * @route GET /api/admin/production-orders/:id
 * @desc Get production order by ID
 * @access Admin
 */
router.get("/:id", controller.getProductionOrder);

/**
 * @route PUT /api/admin/production-orders/:id/status
 * @desc Update production order status
 * @access Admin
 */
router.put("/:id/status", controller.updateProductionStatus);

/**
 * @route POST /api/admin/production-orders/:id/qc
 * @desc Perform QC check
 * @access Admin
 */
router.post("/:id/qc", controller.performQCCheck);

/**
 * @route POST /api/admin/production-orders/:id/complete
 * @desc Complete production order
 * @access Admin
 */
router.post("/:id/complete", controller.completeProduction);

export default router;
