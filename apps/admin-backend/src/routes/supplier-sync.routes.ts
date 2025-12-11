import { Router } from "express";
import { SupplierSyncController } from "../controllers/supplier-sync.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new SupplierSyncController();

// Admin routes (require authentication)
const adminRouter = Router();
adminRouter.use(authenticate);

/**
 * @route POST /api/admin/sync/inventory/:supplierId
 * @desc Manually sync inventory from supplier
 * @access Admin
 */
adminRouter.post("/inventory/:supplierId", controller.syncInventory);

/**
 * @route POST /api/admin/sync/pricing/:supplierId
 * @desc Manually sync pricing from supplier
 * @access Admin
 */
adminRouter.post("/pricing/:supplierId", controller.syncPricing);

/**
 * @route POST /api/admin/sync/catalog/:supplierId
 * @desc Manually sync catalog from supplier
 * @access Admin
 */
adminRouter.post("/catalog/:supplierId", controller.syncCatalog);

// Webhook routes (no authentication - verified by signature)
const webhookRouter = Router();

/**
 * @route POST /api/webhooks/suppliers/printful
 * @desc Handle Printful webhook
 * @access Public (verified by signature)
 */
webhookRouter.post("/printful", controller.handlePrintfulWebhook);

/**
 * @route POST /api/webhooks/suppliers/customcat
 * @desc Handle CustomCat webhook
 * @access Public (verified by signature)
 */
webhookRouter.post("/customcat", controller.handleCustomCatWebhook);

export {
  adminRouter as supplierSyncAdminRoutes,
  webhookRouter as supplierSyncWebhookRoutes,
};
