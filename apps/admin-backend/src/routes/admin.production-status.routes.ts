/**
 * Production Status Routes
 *
 * API endpoints for production status management
 */

import { Router } from "express";
import { ProductionStatusController } from "../controllers/admin.production-status.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new ProductionStatusController();

// All routes require authentication
router.use(authenticate);

/**
 * @route PUT /api/production/:orderId/status
 * @desc Update production status
 * @access Private
 */
router.put("/:orderId/status", controller.updateStatus);

/**
 * @route POST /api/production/scan
 * @desc Handle barcode scan
 * @access Private
 */
router.post("/scan", controller.scanBarcode);

/**
 * @route GET /api/production/:orderId/timeline
 * @desc Get production timeline
 * @access Private
 */
router.get("/:orderId/timeline", controller.getTimeline);

/**
 * @route POST /api/production/:orderId/issues
 * @desc Report production issue
 * @access Private
 */
router.post("/:orderId/issues", controller.reportIssue);

export default router;
