// src/modules/inventory/inventory.routes.js
// ✅ Inventory Routes - API endpoints

import { Router } from "express";
import { InventoryController } from "./inventory.controller.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";

const router = Router();
const inventoryController = new InventoryController();

// All routes require authentication + organization
router.use(protect, isOrganization);

/**
 * @route   GET /api/inventory/stats
 * @desc    Get inventory stats
 */
router.get("/stats", inventoryController.getStats);

/**
 * @route   GET /api/inventory/low-stock
 * @desc    Get low stock items
 */
router.get("/low-stock", inventoryController.getLowStockItems);

/**
 * @route   GET /api/inventory
 * @desc    Get inventory with items
 */
router.get("/", inventoryController.getInventory);

/**
 * @route   POST /api/inventory/items
 * @desc    Add item to inventory
 */
router.post("/items", inventoryController.addItem);

/**
 * @route   PUT /api/inventory/items/:itemId
 * @desc    Update item details
 */
router.put("/items/:itemId", inventoryController.updateItem);

/**
 * @route   PUT /api/inventory/items/:itemId/quantity
 * @desc    Update item quantity
 */
router.put("/items/:itemId/quantity", inventoryController.updateQuantity);

/**
 * @route   POST /api/inventory/items/:itemId/reserve
 * @desc    Reserve items for order
 */
router.post("/items/:itemId/reserve", inventoryController.reserveItems);

/**
 * @route   DELETE /api/inventory/items/:itemId
 * @desc    Remove item from inventory
 */
router.delete("/items/:itemId", inventoryController.removeItem);

/**
 * @route   PUT /api/inventory/settings
 * @desc    Update inventory settings
 */
router.put("/settings", inventoryController.updateSettings);

export default router;
