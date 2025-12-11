// apps/admin-backend/src/routes/admin.inventory.routes.ts
// ✅ Inventory Routes - API endpoints for inventory management
// Phase 4.1.3: Create Inventory Controller & Routes

import { Router } from "express";
import InventoryController from "../controllers/admin.inventory.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();
const controller = new InventoryController();

// All routes require authentication
router.use(authenticate);

// ============================================
// INVENTORY OVERVIEW & REPORTING
// ============================================

/**
 * @route GET /api/admin/inventory
 * @desc Get inventory overview (summary statistics)
 * @access Admin
 */
router.get("/", controller.getInventoryOverview);

/**
 * @route GET /api/admin/inventory/low-stock
 * @desc Get low stock items
 * @query threshold - Optional reorder threshold
 * @access Admin
 */
router.get("/low-stock", controller.getLowStockItems);

/**
 * @route POST /api/admin/inventory/check-fulfillment
 * @desc Check if order can be fulfilled
 * @body items - Array of {variantId, quantity}
 * @access Admin
 */
router.post("/check-fulfillment", controller.checkFulfillment);

/**
 * @route POST /api/admin/inventory/bulk-levels
 * @desc Get inventory levels for multiple variants
 * @body variantIds - Array of variant IDs
 * @access Admin
 */
router.post("/bulk-levels", controller.getBulkInventoryLevels);

// ============================================
// VARIANT-SPECIFIC OPERATIONS
// ============================================

/**
 * @route GET /api/admin/inventory/:variantId
 * @desc Get inventory levels for a specific variant
 * @access Admin
 */
router.get("/:variantId", controller.getInventoryLevels);

/**
 * @route GET /api/admin/inventory/:variantId/transactions
 * @desc Get transaction history for a variant
 * @query startDate, endDate, type, page, limit
 * @access Admin
 */
router.get("/:variantId/transactions", controller.getTransactionHistory);

/**
 * @route POST /api/admin/inventory/:variantId/reserve
 * @desc Reserve inventory for an order
 * @body quantity, orderId, orderNumber, reason
 * @access Admin
 */
router.post("/:variantId/reserve", controller.reserveInventory);

/**
 * @route POST /api/admin/inventory/:variantId/release
 * @desc Release reserved inventory
 * @body quantity, orderId, orderNumber, reason
 * @access Admin
 */
router.post("/:variantId/release", controller.releaseInventory);

/**
 * @route POST /api/admin/inventory/:variantId/adjust
 * @desc Manual inventory adjustment
 * @body quantityChange, reason, notes
 * @access Admin
 */
router.post("/:variantId/adjust", controller.adjustInventory);

/**
 * @route POST /api/admin/inventory/:variantId/purchase
 * @desc Record a purchase (receiving stock)
 * @body quantity, unitCost, purchaseOrderId, purchaseOrderNumber, notes
 * @access Admin
 */
router.post("/:variantId/purchase", controller.recordPurchase);

/**
 * @route POST /api/admin/inventory/:variantId/sale
 * @desc Record a sale (fulfilling order)
 * @body quantity, unitCost, orderId, orderNumber
 * @access Admin
 */
router.post("/:variantId/sale", controller.recordSale);

export default router;
