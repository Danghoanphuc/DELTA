// src/routes/admin.delivery-checkin.routes.ts
// ✅ Admin Delivery Check-in Routes

import { Router } from "express";
import { deliveryCheckinController } from "../controllers/admin.delivery-checkin.controller.js";
import { isAuthenticatedAdmin } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require admin authentication
router.use(isAuthenticatedAdmin);

// ============================================
// DELIVERY CHECK-INS
// ============================================

/**
 * @route   GET /api/admin/delivery-checkins
 * @desc    Get all delivery check-ins with filters
 */
router.get("/", deliveryCheckinController.getCheckins);

/**
 * @route   GET /api/admin/delivery-checkins/stats
 * @desc    Get delivery check-in statistics
 */
router.get("/stats", deliveryCheckinController.getStats);

/**
 * @route   GET /api/admin/delivery-checkins/bounds
 * @desc    Get check-ins within geographic bounds (for map view)
 */
router.get("/bounds", deliveryCheckinController.getCheckinsByBounds);

/**
 * @route   GET /api/admin/delivery-checkins/:id
 * @desc    Get single check-in detail
 */
router.get("/:id", deliveryCheckinController.getCheckin);

/**
 * @route   GET /api/admin/delivery-checkins/order/:orderId
 * @desc    Get check-ins for a specific order
 */
router.get("/order/:orderId", deliveryCheckinController.getCheckinsByOrder);

/**
 * @route   GET /api/admin/delivery-checkins/shipper/:shipperId
 * @desc    Get check-ins by shipper
 */
router.get(
  "/shipper/:shipperId",
  deliveryCheckinController.getCheckinsByShipper
);

/**
 * @route   DELETE /api/admin/delivery-checkins/:id
 * @desc    Delete a check-in (admin only)
 */
router.delete("/:id", deliveryCheckinController.deleteCheckin);

export default router;
