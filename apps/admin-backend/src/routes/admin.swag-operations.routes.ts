// src/routes/admin.swag-operations.routes.ts
// ✅ Admin Swag Operations Routes

import { Router } from "express";
import { swagOperationsController } from "../controllers/admin.swag-operations.controller.js";
import { isAuthenticatedAdmin } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require admin authentication
router.use(isAuthenticatedAdmin);

// ============================================
// DASHBOARD
// ============================================

/**
 * @route   GET /api/admin/swag-ops/dashboard
 * @desc    Get dashboard stats
 */
router.get("/dashboard", swagOperationsController.getDashboardStats);

// ============================================
// ORDERS
// ============================================

/**
 * @route   GET /api/admin/swag-ops/orders
 * @desc    Get all swag orders with filters
 */
router.get("/orders", swagOperationsController.getOrders);

/**
 * @route   GET /api/admin/swag-ops/orders/:id
 * @desc    Get single order detail
 */
router.get("/orders/:id", swagOperationsController.getOrder);

/**
 * @route   PUT /api/admin/swag-ops/orders/:id/status
 * @desc    Update order status
 */
router.put("/orders/:id/status", swagOperationsController.updateOrderStatus);

/**
 * @route   GET /api/admin/swag-ops/orders/:id/activity
 * @desc    Get order activity log
 */
router.get(
  "/orders/:id/activity",
  swagOperationsController.getOrderActivityLog
);

// ============================================
// SHIPMENTS
// ============================================

/**
 * @route   PUT /api/admin/swag-ops/orders/:orderId/shipments/:recipientId
 * @desc    Update single shipment status
 */
router.put(
  "/orders/:orderId/shipments/:recipientId",
  swagOperationsController.updateShipmentStatus
);

/**
 * @route   POST /api/admin/swag-ops/orders/:orderId/shipments/bulk
 * @desc    Bulk update shipments
 */
router.post(
  "/orders/:orderId/shipments/bulk",
  swagOperationsController.bulkUpdateShipments
);

/**
 * @route   POST /api/admin/swag-ops/orders/:orderId/labels
 * @desc    Generate shipping labels
 */
router.post(
  "/orders/:orderId/labels",
  swagOperationsController.generateShippingLabels
);

// ============================================
// FULFILLMENT QUEUE
// ============================================

/**
 * @route   GET /api/admin/swag-ops/fulfillment/queue
 * @desc    Get fulfillment queue
 */
router.get("/fulfillment/queue", swagOperationsController.getFulfillmentQueue);

/**
 * @route   POST /api/admin/swag-ops/orders/:id/process
 * @desc    Start processing an order
 */
router.post("/orders/:id/process", swagOperationsController.startProcessing);

/**
 * @route   POST /api/admin/swag-ops/orders/:id/kitting-complete
 * @desc    Mark kitting as complete
 */
router.post(
  "/orders/:id/kitting-complete",
  swagOperationsController.completeKitting
);

// ============================================
// INVENTORY
// ============================================

/**
 * @route   GET /api/admin/swag-ops/inventory
 * @desc    Get inventory overview
 */
router.get("/inventory", swagOperationsController.getInventoryOverview);

/**
 * @route   PUT /api/admin/swag-ops/inventory/:itemId
 * @desc    Update inventory item
 */
router.put("/inventory/:itemId", swagOperationsController.updateInventoryItem);

// ============================================
// ORGANIZATIONS
// ============================================

/**
 * @route   GET /api/admin/swag-ops/organizations
 * @desc    Get all organizations (for filters)
 */
router.get("/organizations", swagOperationsController.getOrganizations);

// ============================================
// CARRIERS & SHIPPING
// ============================================

/**
 * @route   GET /api/admin/swag-ops/carriers
 * @desc    Get available shipping carriers
 */
router.get("/carriers", swagOperationsController.getCarriers);

/**
 * @route   POST /api/admin/swag-ops/orders/:orderId/shipments/:recipientId/create
 * @desc    Create shipment with carrier integration
 */
router.post(
  "/orders/:orderId/shipments/:recipientId/create",
  swagOperationsController.createShipment
);

/**
 * @route   GET /api/admin/swag-ops/orders/:orderId/shipments/:recipientId/tracking
 * @desc    Get tracking info from carrier
 */
router.get(
  "/orders/:orderId/shipments/:recipientId/tracking",
  swagOperationsController.getTrackingInfo
);

// ============================================
// EXPORT
// ============================================

/**
 * @route   GET /api/admin/swag-ops/export
 * @desc    Export orders to CSV
 */
router.get("/export", swagOperationsController.exportOrders);

// ============================================
// ANALYTICS (imported from analytics controller)
// ============================================
import { analyticsController } from "../controllers/admin.analytics.controller.js";

/**
 * @route   GET /api/admin/swag-ops/analytics/trends
 * @desc    Get order trends over time
 */
router.get("/analytics/trends", analyticsController.getOrderTrends);

/**
 * @route   GET /api/admin/swag-ops/analytics/fulfillment
 * @desc    Get fulfillment performance metrics
 */
router.get("/analytics/fulfillment", analyticsController.getFulfillmentMetrics);

/**
 * @route   GET /api/admin/swag-ops/analytics/top-organizations
 * @desc    Get top organizations by order volume
 */
router.get(
  "/analytics/top-organizations",
  analyticsController.getTopOrganizations
);

/**
 * @route   GET /api/admin/swag-ops/analytics/status-distribution
 * @desc    Get order status distribution
 */
router.get(
  "/analytics/status-distribution",
  analyticsController.getStatusDistribution
);

/**
 * @route   GET /api/admin/swag-ops/analytics/carriers
 * @desc    Get carrier performance metrics
 */
router.get("/analytics/carriers", analyticsController.getCarrierPerformance);

/**
 * @route   GET /api/admin/swag-ops/analytics/inventory-alerts
 * @desc    Get inventory alerts
 */
router.get(
  "/analytics/inventory-alerts",
  analyticsController.getInventoryAlerts
);

export default router;
