// src/modules/redemption/redemption.routes.js
// ✅ Redemption Link Routes

import { Router } from "express";
import { redemptionController } from "./redemption.controller.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";

const router = Router();

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

/**
 * @route   GET /api/redemption/public/:token
 * @desc    Get redemption link by token (public page)
 * @access  Public
 */
router.get("/public/:token", redemptionController.getPublicLink);

/**
 * @route   POST /api/redemption/public/:token/redeem
 * @desc    Submit redemption form
 * @access  Public
 */
router.post("/public/:token/redeem", redemptionController.redeemLink);

// ============================================
// PRIVATE ROUTES (Organization Only)
// ============================================

/**
 * @route   POST /api/redemption/links
 * @desc    Create new redemption link
 * @access  Private (Organization)
 */
router.post("/links", protect, isOrganization, redemptionController.createLink);

/**
 * @route   GET /api/redemption/links
 * @desc    Get all redemption links for organization
 * @access  Private (Organization)
 */
router.get("/links", protect, isOrganization, redemptionController.getLinks);

/**
 * @route   GET /api/redemption/links/stats
 * @desc    Get redemption stats
 * @access  Private (Organization)
 */
router.get(
  "/links/stats",
  protect,
  isOrganization,
  redemptionController.getStats
);

/**
 * @route   GET /api/redemption/links/:id
 * @desc    Get redemption link detail
 * @access  Private (Organization)
 */
router.get(
  "/links/:id",
  protect,
  isOrganization,
  redemptionController.getLinkDetail
);

/**
 * @route   PUT /api/redemption/links/:id
 * @desc    Update redemption link
 * @access  Private (Organization)
 */
router.put(
  "/links/:id",
  protect,
  isOrganization,
  redemptionController.updateLink
);

/**
 * @route   DELETE /api/redemption/links/:id
 * @desc    Delete redemption link
 * @access  Private (Organization)
 */
router.delete(
  "/links/:id",
  protect,
  isOrganization,
  redemptionController.deleteLink
);

/**
 * @route   POST /api/redemption/links/:id/duplicate
 * @desc    Duplicate redemption link
 * @access  Private (Organization)
 */
router.post(
  "/links/:id/duplicate",
  protect,
  isOrganization,
  redemptionController.duplicateLink
);

export default router;
