/**
 * Reorder Routes
 *
 * API routes for re-order functionality
 * Requirements: 7.1, 7.3
 */

import { Router } from "express";
import { reorderController } from "../controllers/admin.reorder.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/orders/:orderId/reorder
 * @desc Create re-order from original order
 * @access Private
 */
router.post("/:orderId/reorder", reorderController.createReorder);

/**
 * @route GET /api/orders/:orderId/reorder-preview
 * @desc Get re-order preview with price comparison
 * @access Private
 */
router.get("/:orderId/reorder-preview", reorderController.getReorderPreview);

export default router;
