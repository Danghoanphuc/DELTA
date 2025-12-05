// src/modules/organizations/organization.routes.js
// ✅ Gộp chung routes cho B2B Organization module

import { Router } from "express";
import { OrganizationController } from "./organization.controller.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";
import { uploadLegalDocs } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const organizationController = new OrganizationController();

// ============================================
// PUBLIC ROUTES (Registration/Onboarding)
// ============================================

/**
 * @route   POST /api/organizations/register
 * @desc    Register new B2B organization
 * @access  Private (Authenticated user)
 */
router.post("/register", protect, organizationController.registerOrganization);

// ============================================
// PRIVATE ROUTES (Organization Profile Management)
// ============================================

/**
 * @route   GET /api/organizations/profile/me
 * @desc    Get my organization profile
 * @access  Private (Organization only)
 */
router.get(
  "/profile/me",
  protect,
  isOrganization,
  organizationController.getMyProfile
);

/**
 * @route   PUT /api/organizations/profile/me
 * @desc    Update my organization profile
 * @access  Private (Organization only)
 */
router.put(
  "/profile/me",
  protect,
  isOrganization,
  organizationController.updateMyProfile
);

/**
 * @route   GET /api/organizations/profile-exists
 * @desc    Check if organization profile exists for current user
 * @access  Private (Authenticated user)
 */
router.get(
  "/profile-exists",
  protect,
  organizationController.checkProfileExists
);

// ============================================
// BUSINESS DOCUMENTS (For Net 30 / Red Invoice)
// ============================================

/**
 * @route   PUT /api/organizations/submit-business-docs
 * @desc    Submit business documents for verification (GPKD, CCCD)
 * @access  Private (Organization only)
 */
router.put(
  "/submit-business-docs",
  protect,
  isOrganization,
  uploadLegalDocs,
  organizationController.submitBusinessDocs
);

// ============================================
// BRAND ASSETS (Logo/Vector for Studio)
// ============================================

/**
 * @route   PUT /api/organizations/brand-assets
 * @desc    Upload brand assets (Logo, Vector, Brand Guidelines)
 * @access  Private (Organization only)
 */
router.put(
  "/brand-assets",
  protect,
  isOrganization,
  organizationController.uploadBrandAssets
);

// ============================================
// ✅ VALUE-FIRST: ONBOARDING WIZARD ROUTES
// ============================================

/**
 * @route   PUT /api/organizations/usage-intent
 * @desc    Save usage intent from onboarding wizard (Step 1)
 * @access  Private (Organization only)
 */
router.put(
  "/usage-intent",
  protect,
  isOrganization,
  organizationController.saveUsageIntent
);

/**
 * @route   POST /api/organizations/invite-members
 * @desc    Invite team members (Step 3)
 * @access  Private (Organization only)
 */
router.post(
  "/invite-members",
  protect,
  isOrganization,
  organizationController.inviteMembers
);

export default router;
