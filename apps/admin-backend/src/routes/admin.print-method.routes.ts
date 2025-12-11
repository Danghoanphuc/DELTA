// apps/admin-backend/src/routes/admin.print-method.routes.ts
// ✅ Print Method Configuration Routes
// Phase 3.1.1: Implement Print Method Configuration

import { Router } from "express";
import printMethodController from "../controllers/admin.print-method.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Print Method Configuration Routes
 * Base path: /api/admin/catalog/products/:id/print-methods
 */

// Configure print methods (replace all)
router.put("/:id/print-methods", printMethodController.configurePrintMethods);

// Add a single print method
router.post("/:id/print-methods", printMethodController.addPrintMethod);

// Remove a print method
router.delete(
  "/:id/print-methods/:method",
  printMethodController.removePrintMethod
);

// Get available print methods
router.get(
  "/:id/print-methods",
  printMethodController.getAvailablePrintMethods
);

// Apply default print method template
router.post(
  "/:id/apply-default-print-method",
  printMethodController.applyDefaultPrintMethod
);

/**
 * MOQ Configuration Routes
 */

// Configure MOQ per print method
router.put("/:id/moq-by-print-method", printMethodController.configureMoq);

// Get MOQ for a specific print method
router.get("/:id/moq/:method", printMethodController.getMoq);

/**
 * Production Complexity Routes
 */

// Set production complexity
router.put(
  "/:id/production-complexity",
  printMethodController.setProductionComplexity
);

/**
 * Calculation & Validation Routes
 */

// Calculate customization cost
router.post(
  "/:id/calculate-customization-cost",
  printMethodController.calculateCustomizationCost
);

// Validate artwork
router.post("/:id/validate-artwork", printMethodController.validateArtwork);

// Estimate lead time
router.post("/:id/estimate-lead-time", printMethodController.estimateLeadTime);

export default router;
