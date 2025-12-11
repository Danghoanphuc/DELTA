/**
 * Alert Routes
 *
 * API endpoints for alert management
 */

import { Router } from "express";
import { AlertController } from "../controllers/admin.alert.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new AlertController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/alerts
 * @desc Get pending alerts for current user
 * @access Private
 */
router.get("/", controller.getAlerts);

/**
 * @route GET /api/alerts/stats
 * @desc Get alert statistics for current user
 * @access Private
 */
router.get("/stats", controller.getAlertStats);

/**
 * @route GET /api/alerts/orders/urgent
 * @desc Get orders sorted by deadline urgency
 * @access Private
 */
router.get("/orders/urgent", controller.getUrgentOrders);

/**
 * @route GET /api/alerts/thresholds/:tier
 * @desc Get alert thresholds for a customer tier
 * @access Private
 */
router.get("/thresholds/:tier", controller.getThresholds);

/**
 * @route PUT /api/alerts/:id/acknowledge
 * @desc Acknowledge an alert
 * @access Private
 */
router.put("/:id/acknowledge", controller.acknowledgeAlert);

/**
 * @route PUT /api/alerts/thresholds/:tier
 * @desc Configure alert thresholds for a customer tier
 * @access Admin
 */
router.put("/thresholds/:tier", controller.configureThresholds);

/**
 * @route POST /api/alerts/check-deadlines
 * @desc Manually trigger deadline check
 * @access Admin
 */
router.post("/check-deadlines", controller.checkDeadlines);

export default router;
