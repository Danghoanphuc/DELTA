/**
 * Asset Routes - Asset Version Control API Routes
 *
 * API endpoints for asset management with version control
 * Implements Asset Version Control feature
 *
 * Requirements: 3.1, 3.2, 3.5
 */

import { Router } from "express";
import { assetController } from "../controllers/admin.asset.controller.js";
import { authenticate } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Order-specific asset routes
 */
// POST /api/orders/:orderId/assets - Upload asset
router.post("/orders/:orderId/assets", assetController.uploadAsset);

// GET /api/orders/:orderId/assets - List assets with versions
router.get("/orders/:orderId/assets", assetController.getAssets);

// GET /api/orders/:orderId/assets/validate - Validate for production
router.get(
  "/orders/:orderId/assets/validate",
  assetController.validateForProduction
);

/**
 * Asset-specific routes
 */
// GET /api/assets/:id - Get asset details
router.get("/assets/:id", assetController.getAsset);

// PUT /api/assets/:id/final - Mark as FINAL
router.put("/assets/:id/final", assetController.markAsFinal);

// POST /api/assets/:id/revision - Create revision
router.post("/assets/:id/revision", assetController.createRevision);

// DELETE /api/assets/:id - Delete asset
router.delete("/assets/:id", assetController.deleteAsset);

export default router;
