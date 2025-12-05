// src/modules/company-store/company-store.routes.js
// ✅ Company Store Routes

import { Router } from "express";
import { companyStoreController } from "./company-store.controller.js";
import {
  protect,
  isOrganization,
  optionalAuth,
} from "../../shared/middleware/index.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/company-store/public
 * @desc    Get public stores directory
 * @access  Public
 */
router.get("/public", companyStoreController.getPublicStores);

/**
 * @route   GET /api/company-store/public/:slug
 * @desc    Get store by slug (public storefront)
 * @access  Public (with optional auth for private stores)
 */
router.get(
  "/public/:slug",
  optionalAuth,
  companyStoreController.getPublicStore
);

// ============================================
// PRIVATE ROUTES (Organization Only)
// ============================================

/**
 * @route   POST /api/company-store
 * @desc    Create company store
 * @access  Private (Organization)
 */
router.post("/", protect, isOrganization, companyStoreController.createStore);

/**
 * @route   GET /api/company-store/me
 * @desc    Get my company store
 * @access  Private (Organization)
 */
router.get("/me", protect, isOrganization, companyStoreController.getMyStore);

/**
 * @route   PUT /api/company-store/me
 * @desc    Update my company store
 * @access  Private (Organization)
 */
router.put("/me", protect, isOrganization, companyStoreController.updateStore);

/**
 * @route   POST /api/company-store/me/publish
 * @desc    Publish store
 * @access  Private (Organization)
 */
router.post(
  "/me/publish",
  protect,
  isOrganization,
  companyStoreController.publishStore
);

/**
 * @route   POST /api/company-store/me/unpublish
 * @desc    Unpublish store
 * @access  Private (Organization)
 */
router.post(
  "/me/unpublish",
  protect,
  isOrganization,
  companyStoreController.unpublishStore
);

// === PRODUCTS ===

/**
 * @route   POST /api/company-store/me/products
 * @desc    Add product to store
 * @access  Private (Organization)
 */
router.post(
  "/me/products",
  protect,
  isOrganization,
  companyStoreController.addProduct
);

/**
 * @route   PUT /api/company-store/me/products/:productId
 * @desc    Update product in store
 * @access  Private (Organization)
 */
router.put(
  "/me/products/:productId",
  protect,
  isOrganization,
  companyStoreController.updateProduct
);

/**
 * @route   DELETE /api/company-store/me/products/:productId
 * @desc    Remove product from store
 * @access  Private (Organization)
 */
router.delete(
  "/me/products/:productId",
  protect,
  isOrganization,
  companyStoreController.removeProduct
);

// === CATEGORIES ===

/**
 * @route   POST /api/company-store/me/categories
 * @desc    Add category to store
 * @access  Private (Organization)
 */
router.post(
  "/me/categories",
  protect,
  isOrganization,
  companyStoreController.addCategory
);

/**
 * @route   PUT /api/company-store/me/categories/:categoryId
 * @desc    Update category in store
 * @access  Private (Organization)
 */
router.put(
  "/me/categories/:categoryId",
  protect,
  isOrganization,
  companyStoreController.updateCategory
);

/**
 * @route   DELETE /api/company-store/me/categories/:categoryId
 * @desc    Remove category from store
 * @access  Private (Organization)
 */
router.delete(
  "/me/categories/:categoryId",
  protect,
  isOrganization,
  companyStoreController.removeCategory
);

export default router;
