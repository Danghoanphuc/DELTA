// src/modules/swag-packs/swag-pack.routes.js
// ✅ Swag Pack Routes - API endpoints

import { Router } from "express";
import { SwagPackController } from "./swag-pack.controller.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";

const router = Router();
const swagPackController = new SwagPackController();

// All routes require authentication + organization
router.use(protect, isOrganization);

/**
 * @route   GET /api/swag-packs/templates
 * @desc    Get pre-built pack templates
 */
router.get("/templates", swagPackController.getTemplates);

/**
 * @route   GET /api/swag-packs/stats
 * @desc    Get dashboard stats
 */
router.get("/stats", swagPackController.getStats);

/**
 * @route   GET /api/swag-packs
 * @desc    Get packs list
 */
router.get("/", swagPackController.getPacks);

/**
 * @route   POST /api/swag-packs
 * @desc    Create a new pack
 */
router.post("/", swagPackController.createPack);

/**
 * @route   GET /api/swag-packs/:id
 * @desc    Get single pack
 */
router.get("/:id", swagPackController.getPack);

/**
 * @route   PUT /api/swag-packs/:id
 * @desc    Update pack
 */
router.put("/:id", swagPackController.updatePack);

/**
 * @route   DELETE /api/swag-packs/:id
 * @desc    Delete pack
 */
router.delete("/:id", swagPackController.deletePack);

/**
 * @route   POST /api/swag-packs/:id/items
 * @desc    Add item to pack
 */
router.post("/:id/items", swagPackController.addItem);

/**
 * @route   PUT /api/swag-packs/:id/items/:itemId
 * @desc    Update item in pack
 */
router.put("/:id/items/:itemId", swagPackController.updateItem);

/**
 * @route   DELETE /api/swag-packs/:id/items/:itemId
 * @desc    Remove item from pack
 */
router.delete("/:id/items/:itemId", swagPackController.removeItem);

/**
 * @route   POST /api/swag-packs/:id/publish
 * @desc    Publish pack (make active)
 */
router.post("/:id/publish", swagPackController.publishPack);

/**
 * @route   POST /api/swag-packs/:id/archive
 * @desc    Archive pack
 */
router.post("/:id/archive", swagPackController.archivePack);

/**
 * @route   POST /api/swag-packs/:id/duplicate
 * @desc    Duplicate pack
 */
router.post("/:id/duplicate", swagPackController.duplicatePack);

export default router;
