// src/modules/swag-orders/swag-order.routes.js
// ✅ Swag Order Routes - API endpoints

import { Router } from "express";
import { SwagOrderController } from "./swag-order.controller.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";

const router = Router();
const swagOrderController = new SwagOrderController();

// ============================================
// PUBLIC ROUTES (Self-Service Portal - No Auth)
// ============================================

/**
 * @route   GET /api/swag-orders/self-service/:token
 * @desc    Get order info by self-service token
 * @access  Public
 */
router.get("/self-service/:token", swagOrderController.getSelfServiceInfo);

/**
 * @route   POST /api/swag-orders/self-service/:token
 * @desc    Complete self-service (recipient fills info)
 * @access  Public
 */
router.post("/self-service/:token", swagOrderController.completeSelfService);

// ============================================
// PRIVATE ROUTES (Organization only)
// ============================================

// Apply auth middleware for all routes below
router.use(protect, isOrganization);

/**
 * @route   GET /api/swag-orders/stats
 * @desc    Get dashboard stats
 */
router.get("/stats", swagOrderController.getStats);

/**
 * @route   GET /api/swag-orders
 * @desc    Get orders list
 */
router.get("/", swagOrderController.getOrders);

/**
 * @route   POST /api/swag-orders
 * @desc    Create a new swag order
 */
router.post("/", swagOrderController.createOrder);

/**
 * @route   GET /api/swag-orders/:id
 * @desc    Get single order
 */
router.get("/:id", swagOrderController.getOrder);

/**
 * @route   PUT /api/swag-orders/:id
 * @desc    Update order
 */
router.put("/:id", swagOrderController.updateOrder);

/**
 * @route   POST /api/swag-orders/:id/recipients
 * @desc    Add recipients to order
 */
router.post("/:id/recipients", swagOrderController.addRecipients);

/**
 * @route   DELETE /api/swag-orders/:id/recipients/:recipientId
 * @desc    Remove recipient from order
 */
router.delete(
  "/:id/recipients/:recipientId",
  swagOrderController.removeRecipient
);

/**
 * @route   POST /api/swag-orders/:id/submit
 * @desc    Submit order for processing
 */
router.post("/:id/submit", swagOrderController.submitOrder);

/**
 * @route   POST /api/swag-orders/:id/pay
 * @desc    Process payment
 */
router.post("/:id/pay", swagOrderController.processPayment);

/**
 * @route   PUT /api/swag-orders/:id/shipments/:recipientId/status
 * @desc    Update shipment status
 */
router.put(
  "/:id/shipments/:recipientId/status",
  swagOrderController.updateShipmentStatus
);

/**
 * @route   POST /api/swag-orders/:id/cancel
 * @desc    Cancel order
 */
router.post("/:id/cancel", swagOrderController.cancelOrder);

/**
 * @route   POST /api/swag-orders/:id/resend-email/:recipientId
 * @desc    Resend self-service email
 */
router.post(
  "/:id/resend-email/:recipientId",
  swagOrderController.resendSelfServiceEmail
);

export default router;
