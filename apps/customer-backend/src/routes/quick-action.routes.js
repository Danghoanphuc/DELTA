// apps/customer-backend/src/routes/quick-action.routes.js
// Quick Action Routes for ORDER Context

import { Router } from "express";
import { QuickActionController } from "../controllers/quick-action.controller.js";
import { authenticate } from "../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new QuickActionController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/orders/:orderId/quick-actions
 * @desc Get available quick actions for an order
 * @access Private
 */
router.get("/:orderId/quick-actions", controller.getQuickActionsForOrder);

/**
 * @route POST /api/orders/:orderId/quick-actions/:action
 * @desc Execute a quick action
 * @access Private
 * @body {Object} data - Action-specific data
 */
router.post("/:orderId/quick-actions/:action", controller.executeQuickAction);

export default router;
