// apps/admin-backend/src/routes/admin.kitting.routes.ts
// ✅ Kitting Routes - Phase 6.1.2
// API endpoints cho kitting operations

import { Router } from "express";
import { KittingController } from "../controllers/admin.kitting.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new KittingController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/admin/kitting/queue
 * @desc Get kitting queue
 * @access Admin
 * Requirements: 8.1
 */
router.get("/queue", controller.getKittingQueue);

/**
 * @route GET /api/admin/kitting/:orderId/checklist
 * @desc Get kitting checklist for an order
 * @access Admin
 * Requirements: 8.1, 8.2
 */
router.get("/:orderId/checklist", controller.getKittingChecklist);

/**
 * @route GET /api/admin/kitting/:orderId/progress
 * @desc Get kitting progress
 * @access Admin
 * Requirements: 8.2
 */
router.get("/:orderId/progress", controller.getKittingProgress);

/**
 * @route GET /api/admin/kitting/:orderId/validate-inventory
 * @desc Validate inventory availability for kitting
 * @access Admin
 * Requirements: 8.2
 */
router.get("/:orderId/validate-inventory", controller.validateInventory);

/**
 * @route POST /api/admin/kitting/:orderId/start
 * @desc Start kitting process
 * @access Admin
 * Requirements: 8.2
 */
router.post("/:orderId/start", controller.startKitting);

/**
 * @route POST /api/admin/kitting/:orderId/scan
 * @desc Scan item during kitting
 * @access Admin
 * Requirements: 8.2, 8.3
 */
router.post("/:orderId/scan", controller.scanItem);

/**
 * @route POST /api/admin/kitting/:orderId/complete
 * @desc Complete kitting process
 * @access Admin
 * Requirements: 8.3, 8.4
 */
router.post("/:orderId/complete", controller.completeKitting);

export default router;
