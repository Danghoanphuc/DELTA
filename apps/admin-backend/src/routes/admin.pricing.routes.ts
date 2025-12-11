/**
 * PricingRoutes - API routes for Dynamic Pricing Engine
 *
 * Defines endpoints for pricing calculations and formula management
 * Following the existing route patterns in the codebase
 *
 * Requirements: 1.1, 1.4
 */

import { Router } from "express";
import { pricingController } from "../controllers/admin.pricing.controller.js";
import { isAuthenticatedAdmin } from "../middleware/admin.auth.middleware.js";

const router = Router();

// All routes require admin authentication
router.use(isAuthenticatedAdmin);

// ============================================
// PRICING CALCULATION
// ============================================

/**
 * @route   POST /api/admin/pricing/calculate
 * @desc    Calculate price for product specifications
 * @access  Admin
 * Requirements: 1.1
 */
router.post("/calculate", pricingController.calculatePrice);

// ============================================
// PRICING FORMULAS
// ============================================

/**
 * @route   GET /api/admin/pricing/formulas
 * @desc    Get all available pricing formulas
 * @access  Admin
 * Requirements: 1.4
 */
router.get("/formulas", pricingController.getFormulas);

/**
 * @route   POST /api/admin/pricing/formulas
 * @desc    Create new pricing formula
 * @access  Admin
 * Requirements: 1.4
 */
router.post("/formulas", pricingController.createFormula);

/**
 * @route   GET /api/admin/pricing/formulas/:id
 * @desc    Get single pricing formula by ID
 * @access  Admin
 * Requirements: 1.4
 */
router.get("/formulas/:id", pricingController.getFormula);

/**
 * @route   PUT /api/admin/pricing/formulas/:id
 * @desc    Update pricing formula
 * @access  Admin
 * Requirements: 1.4
 */
router.put("/formulas/:id", pricingController.updateFormula);

// ============================================
// QUANTITY TIERS
// ============================================

/**
 * @route   GET /api/admin/pricing/tiers/:productType
 * @desc    Get quantity tiers for a product type
 * @access  Admin
 * Requirements: 1.2
 */
router.get("/tiers/:productType", pricingController.getQuantityTiers);

export default router;
