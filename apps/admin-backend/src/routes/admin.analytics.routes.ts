/**
 * Analytics Routes
 *
 * Defines API endpoints for analytics and reporting
 *
 * Requirements: 13.1, 13.2, 13.3, 13.5
 */

import { Router } from "express";
import { AnalyticsController } from "../controllers/admin.analytics.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new AnalyticsController();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/admin/analytics/products
 * @desc Get product analytics (top products, revenue by category, slow-moving inventory)
 * @access Admin
 * @query startDate - Start date (ISO format)
 * @query endDate - End date (ISO format)
 * @query topN - Number of top products to return (optional, default: 10)
 * @query slowMovingThreshold - Days threshold for slow-moving inventory (optional, default: 90)
 */
router.get("/products", controller.getProductAnalytics);

/**
 * @route GET /api/admin/analytics/suppliers
 * @desc Get supplier analytics (performance metrics, quality scores, lead times)
 * @access Admin
 * @query startDate - Start date (ISO format)
 * @query endDate - End date (ISO format)
 */
router.get("/suppliers", controller.getSupplierAnalytics);

/**
 * @route GET /api/admin/analytics/orders
 * @desc Get order analytics (volume trends, revenue trends, AOV)
 * @access Admin
 * @query startDate - Start date (ISO format)
 * @query endDate - End date (ISO format)
 * @query groupBy - Group by period: day, week, month (optional, default: month)
 */
router.get("/orders", controller.getOrderAnalytics);

/**
 * @route GET /api/admin/analytics/export
 * @desc Export analytics report as CSV or Excel
 * @access Admin
 * @query reportType - Type of report: products, suppliers, orders
 * @query startDate - Start date (ISO format)
 * @query endDate - End date (ISO format)
 * @query format - Export format: csv, excel (optional, default: csv)
 */
router.get("/export", controller.exportReport);

export default router;
