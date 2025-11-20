// src/modules/printers/printer.routes.js

import { Router } from "express";
import { PrinterController } from "./printer.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";
import { uploadLegalDocs } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const printerController = new PrinterController();

// === PUBLIC ROUTES (Onboarding) ===
router.post("/onboarding", protect, printerController.createMyProfile);

// === PRIVATE ROUTES (Printer Profile Management) ===
// All routes below require protect and isPrinter
// Note: /my-profile and /profile are defined here now.

/**
 * @route   GET /api/printers/my-profile  <-- LEGACY ENDPOINT
 * @desc    Get my printer profile
 * @access  Private (Printer only)
 */
router.get("/my-profile", protect, isPrinter, printerController.getMyProfile);

/**
 * @route   GET /api/printers/profile/me  <-- NEW RESTFUL ENDPOINT
 * @desc    Get my printer profile
 * @access  Private (Printer only)
 */
router.get("/profile/me", protect, isPrinter, printerController.getMyProfile);

/**
 * @route   PUT /api/printers/profile
 * @desc    Update my printer profile (legacy)
 * @access  Private (Printer only)
 */
router.put("/profile", protect, isPrinter, printerController.updateMyProfile);

/**
 * @route   PUT /api/printers/profile/me  <-- NEW RESTFUL ENDPOINT
 * @desc    Update my printer profile
 * @access  Private (Printer only)
 */
router.put("/profile/me", protect, isPrinter, printerController.updateMyProfile);

/**
 * @route   PUT /api/printers/submit-verification
 * @desc    Submit legal documents for verification
 * @access  Private (Printer only)
 */
router.put(
  "/submit-verification",
  protect,
  isPrinter,
  uploadLegalDocs,
  printerController.submitVerificationDocs
);

/**
 * @route   GET /api/printers/profile-exists
 * @desc    Check if printer profile exists for current user
 * @access  Private (Printer only)
 */
router.get(
  "/profile-exists",
  protect,
  isPrinter,
  printerController.checkProfileExists
);

// ============================================
// ✅ OBJECTIVE 2: PROOFING WORKFLOW ROUTES
// ============================================

/**
 * @route   PUT /api/printers/orders/:orderId/proof
 * @desc    Upload proof file for order
 * @access  Private (Printer only)
 */
router.put(
  "/orders/:orderId/proof",
  protect,
  isPrinter,
  printerController.uploadProof
);

/**
 * @route   GET /api/printers/orders/:orderId
 * @desc    Get order detail
 * @access  Private (Printer only)
 */
router.get(
  "/orders/:orderId",
  protect,
  isPrinter,
  printerController.getOrderDetail
);

export default router;
