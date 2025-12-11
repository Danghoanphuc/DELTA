// apps/admin-backend/src/routes/admin.product.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as controller from "../controllers/admin.product.controller.js";

const router = Router();
router.use(isAuthenticatedAdmin, hasRole(["superadmin", "support"]));

// Basic product operations
router.get("/", controller.handleGetAllProducts);
router.get("/:id", controller.handleGetProductById);
router.patch("/:id/status", controller.handleUpdateProductStatus);

// Print methods configuration
router.put("/:id/print-methods", controller.handleConfigurePrintMethods);

// Pricing tiers configuration
router.post("/:id/pricing-tiers", controller.handleSetPricingTiers);

// Price calculation
router.post("/:id/calculate-price", controller.handleCalculatePrice);

export default router;
