import { Router } from "express";
import { SupplierRoutingController } from "../controllers/supplier-routing.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new SupplierRoutingController();

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/admin/routing/select-supplier
 * @desc Select best supplier for a SKU
 * @access Admin
 */
router.post("/select-supplier", controller.selectSupplier);

/**
 * @route POST /api/admin/routing/route-order
 * @desc Route entire order to suppliers
 * @access Admin
 */
router.post("/route-order", controller.routeOrder);

/**
 * @route GET /api/admin/routing/inventory/:sku
 * @desc Check inventory across all suppliers
 * @access Admin
 */
router.get("/inventory/:sku", controller.checkInventory);

/**
 * @route GET /api/admin/routing/statistics
 * @desc Get routing statistics
 * @access Admin
 */
router.get("/statistics", controller.getStatistics);

export default router;
