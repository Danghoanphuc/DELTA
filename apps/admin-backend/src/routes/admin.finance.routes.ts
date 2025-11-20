// apps/admin-backend/src/routes/admin.finance.routes.ts
import { Router } from "express";
import {
  isAuthenticatedAdmin,
  hasRole,
} from "../middleware/admin.auth.middleware.js";
import * as financeController from "../controllers/admin.finance.controller.js";

const router = Router();

/**
 * ========================================
 * SECURITY: All routes require authentication
 * and either 'superadmin' or 'finance' role
 * ========================================
 */
router.use(isAuthenticatedAdmin, hasRole(["superadmin", "finance"]));

/**
 * ========================================
 * PAYOUT REQUEST MANAGEMENT
 * ========================================
 */

/**
 * GET /api/admin/finance/payouts
 * List all payout requests (PENDING or PROCESSING)
 * Query params: page, limit, printerId, status
 */
router.get("/payouts", financeController.listPayoutRequests);

/**
 * POST /api/admin/finance/payouts/:id/approve
 * Approve a payout request (PENDING -> PROCESSING)
 * Body: none
 */
router.post("/payouts/:id/approve", financeController.approvePayoutRequest);

/**
 * POST /api/admin/finance/payouts/:id/confirm
 * Confirm payout success (PROCESSING -> PAID)
 * Body: { proofImage?: string }
 */
router.post("/payouts/:id/confirm", financeController.confirmPayoutSuccess);

/**
 * POST /api/admin/finance/payouts/:id/reject
 * Reject payout request with refund (ATOMIC)
 * Body: { reason: string } (REQUIRED)
 */
router.post("/payouts/:id/reject", financeController.rejectPayoutRequest);

/**
 * ========================================
 * GENERAL LEDGER (SO CAI)
 * ========================================
 */

/**
 * GET /api/admin/finance/ledger
 * Get ledger entries with credit/debit totals
 * Query params: page, limit, printerId, type, status
 */
router.get("/ledger", financeController.listLedgerEntries);

/**
 * ========================================
 * PLATFORM HEALTH STATS
 * ========================================
 */

/**
 * GET /api/admin/finance/stats
 * Get comprehensive platform financial stats
 * Includes: GMV, Revenue, Debt, Health Status
 */
router.get("/stats", financeController.getPlatformStats);

/**
 * ========================================
 * LEGACY ENDPOINTS (Backward Compatibility)
 * ========================================
 */

/**
 * POST /api/admin/finance/payouts/approve
 * Legacy approve payout endpoint
 * Body: { printerId: string, amount: number }
 */
router.post("/payouts/approve", financeController.approvePayout);

export default router;

