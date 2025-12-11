// src/routes/admin.shipping.routes.ts
// ✅ Shipping Routes - API endpoints cho shipping operations

import { Router } from "express";
import { shippingController } from "../controllers/admin.shipping.controller";
import { authenticate } from "../middleware/admin.auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/admin/shipments/carriers
 * @desc    Get available carriers
 * @access  Private (Admin)
 */
router.get("/carriers", shippingController.getCarriers);

/**
 * @route   POST /api/admin/shipments/calculate-fee
 * @desc    Calculate shipping fee
 * @access  Private (Admin)
 */
router.post("/calculate-fee", shippingController.calculateFee);

/**
 * @route   POST /api/admin/shipments
 * @desc    Create shipment for a recipient
 * @access  Private (Admin)
 */
router.post("/", shippingController.createShipment);

/**
 * @route   POST /api/admin/shipments/bulk
 * @desc    Create bulk shipments for order
 * @access  Private (Admin)
 */
router.post("/bulk", shippingController.createBulkShipments);

/**
 * @route   GET /api/admin/shipments/:orderId/recipients/:recipientId/tracking
 * @desc    Get tracking info for shipment
 * @access  Private (Admin)
 */
router.get(
  "/:orderId/recipients/:recipientId/tracking",
  shippingController.getTracking
);

/**
 * @route   POST /api/admin/shipments/:orderId/recipients/:recipientId/cancel
 * @desc    Cancel shipment
 * @access  Private (Admin)
 */
router.post(
  "/:orderId/recipients/:recipientId/cancel",
  shippingController.cancelShipment
);

export default router;
