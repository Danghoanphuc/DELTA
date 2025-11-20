import { type Request, type Response, type NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as financeService from "../services/admin.finance.service.js";
import { ValidationException } from "../shared/exceptions.js";
import {
  type LedgerQueryParams,
} from "../interfaces/finance.interface.js";
import { type IAdmin } from "../models/admin.model.js";

const requireAdmin = (req: Request): IAdmin => {
  const admin = req.admin;
  if (!admin) {
    throw new ValidationException("Yêu cầu đăng nhập Admin.");
  }
  return admin;
};

const getRequestContext = (req: Request) => ({
  ipAddress: req.ip,
  userAgent: req.get("user-agent") ?? undefined,
});

/**
 * ========================================
 * PAYOUT REQUEST MANAGEMENT
 * ========================================
 */

/**
 * GET /api/admin/finance/payouts
 * List all payout requests (PENDING or PROCESSING)
 */
export const listPayoutRequests = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await financeService.getPayoutRequests(
      req.query as unknown as LedgerQueryParams
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * POST /api/admin/finance/payouts/:id/approve
 * Approve a payout request (PENDING -> PROCESSING)
 */
export const approvePayoutRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationException("Thiếu requestId.");
    }

    const admin = requireAdmin(req);

    const result = await financeService.approvePayoutRequest(
      id,
      admin,
      getRequestContext(req)
    );

    res.status(200).json(result);
  }
);

/**
 * POST /api/admin/finance/payouts/:id/confirm
 * Confirm payout success (PROCESSING -> PAID)
 */
export const confirmPayoutSuccess = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { proofImage } = req.body as { proofImage?: string };

    if (!id) {
      throw new ValidationException("Thiếu requestId.");
    }

    const admin = requireAdmin(req);

    const result = await financeService.confirmPayoutSuccess(
      id,
      proofImage,
      admin,
      getRequestContext(req)
    );

    res.status(200).json(result);
  }
);

/**
 * POST /api/admin/finance/payouts/:id/reject
 * Reject payout request with refund (ATOMIC)
 */
export const rejectPayoutRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    if (!id) {
      throw new ValidationException("Thiếu requestId.");
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationException("Lý do từ chối là bắt buộc.");
    }

    const admin = requireAdmin(req);

    const result = await financeService.rejectPayoutRequest(
      id,
      reason,
      admin,
      getRequestContext(req)
    );

    res.status(200).json(result);
  }
);

/**
 * ========================================
 * GENERAL LEDGER (SO CAI)
 * ========================================
 */

/**
 * GET /api/admin/finance/ledger
 * Get ledger entries with credit/debit totals
 */
export const listLedgerEntries = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await financeService.getLedgerEntriesWithTotals(
      req.query as unknown as LedgerQueryParams
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * ========================================
 * PLATFORM HEALTH STATS
 * ========================================
 */

/**
 * GET /api/admin/finance/stats
 * Get comprehensive platform financial stats
 */
export const getPlatformStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await financeService.getComprehensivePlatformStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

/**
 * ========================================
 * LEGACY ENDPOINTS (Backward Compatibility)
 * ========================================
 */

/**
 * POST /api/admin/finance/payouts/approve
 * Legacy approve payout endpoint
 */
export const approvePayout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { printerId, amount } = req.body as {
      printerId?: string;
      amount?: number;
    };

    if (!printerId) {
      throw new ValidationException("Thiếu printerId.");
    }

    if (amount === undefined) {
      throw new ValidationException("Thiếu số tiền payout.");
    }

    const admin = requireAdmin(req);

    const result = await financeService.approvePayout(
      printerId,
      Number(amount),
      admin,
      getRequestContext(req)
    );

    res.status(200).json({
      success: true,
      message: "Duyệt payout thành công.",
      data: result,
    });
  }
);

