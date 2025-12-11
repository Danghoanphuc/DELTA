/**
 * Cost Tracking Routes
 *
 * Routes cho cost và margin tracking:
 * - GET /api/admin/costs/:orderId - Get cost breakdown
 * - GET /api/admin/costs/margin-report - Get margin report
 * - PUT /api/admin/costs/:productionOrderId/actual - Update actual costs
 * - GET /api/admin/costs/variance - Get variance analysis
 * - GET /api/admin/costs/:orderId/variance - Get order variance
 *
 * Requirements: 15.1, 15.2, 15.4, 15.5
 */

import { Router } from "express";
import { CostTrackingController } from "../controllers/cost-tracking.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new CostTrackingController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/admin/costs/margin-report
 * @desc Get margin report by product and customer
 * @access Admin
 * @query startDate - Start date (optional, default: 30 days ago)
 * @query endDate - End date (optional, default: today)
 */
router.get("/margin-report", controller.getMarginReport);

/**
 * @route GET /api/admin/costs/variance
 * @desc Get variance analysis report
 * @access Admin
 * @query startDate - Start date (optional, default: 30 days ago)
 * @query endDate - End date (optional, default: today)
 */
router.get("/variance", controller.getVarianceAnalysis);

/**
 * @route GET /api/admin/costs/:orderId
 * @desc Get cost breakdown for specific order
 * @access Admin
 * @param orderId - Swag order ID
 */
router.get("/:orderId", controller.getCostBreakdown);

/**
 * @route GET /api/admin/costs/:orderId/variance
 * @desc Get variance for specific order
 * @access Admin
 * @param orderId - Swag order ID
 */
router.get("/:orderId/variance", controller.getOrderVariance);

/**
 * @route PUT /api/admin/costs/:productionOrderId/actual
 * @desc Update actual cost for production order
 * @access Admin
 * @param productionOrderId - Production order ID
 * @body actualCost - Actual cost incurred
 * @body costBreakdown - Optional cost breakdown (materials, labor, overhead)
 * @body notes - Optional notes
 */
router.put("/:productionOrderId/actual", controller.updateActualCost);

export default router;
