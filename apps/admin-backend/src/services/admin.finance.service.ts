import mongoose, {
  type Document,
  type FilterQuery,
  type Model,
  Types,
  isValidObjectId,
} from "mongoose";
import {
  BalanceLedgerStatus,
  BalanceTransactionType,
  type IBalanceLedger,
} from "@printz/types";
import {
  NotFoundException,
  ValidationException,
  BadRequestException,
} from "../shared/exceptions.js";
import {
  type ApprovePayoutResult,
  type LedgerQueryParams,
  type PaginatedLedgerResult,
  type PlatformStatsSnapshot,
  type RequestContextMeta,
} from "../interfaces/finance.interface.js";
import { type IAdmin } from "../models/admin.model.js";
import { recordAdminAuditLog } from "./admin.audit-log.service.js";
import { Logger } from "../shared/utils/logger.js";
import BalanceLedgerModel from "../models/balance-ledger.model.js";
import { MasterOrder as MasterOrderModel } from "../models/master-order.model.js";

type BalanceLedgerDocument = IBalanceLedger & Document;
type BalanceLedgerLean = IBalanceLedger;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const normalizeTransactionType = (
  value?: string
): BalanceTransactionType | null => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return Object.values(BalanceTransactionType).includes(
    normalized as BalanceTransactionType
  )
    ? (normalized as BalanceTransactionType)
    : null;
};

const normalizeLedgerStatus = (value?: string): BalanceLedgerStatus | null => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return Object.values(BalanceLedgerStatus).includes(
    normalized as BalanceLedgerStatus
  )
    ? (normalized as BalanceLedgerStatus)
    : null;
};

const parseNumericParam = (
  value: string | number | undefined,
  fallback: number,
  max = MAX_LIMIT
) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(parsed), max);
};

const ensureValidPrinterId = (printerId?: string): Types.ObjectId | null => {
  if (!printerId) {
    return null;
  }

  if (!isValidObjectId(printerId)) {
    throw new ValidationException("PrinterId không hợp lệ.");
  }

  return new Types.ObjectId(printerId);
};

export const getLedgerEntries = async (
  query: LedgerQueryParams
): Promise<PaginatedLedgerResult> => {
  const page = Math.max(parseNumericParam(query.page, DEFAULT_PAGE), 1);
  const limit = parseNumericParam(query.limit, DEFAULT_LIMIT);
  const printerObjectId = ensureValidPrinterId(query.printerId);
  const transactionType = normalizeTransactionType(
    query.type as string | undefined
  );
  const status = normalizeLedgerStatus(query.status as string | undefined);

  const filter: FilterQuery<BalanceLedgerDocument> = {};

  if (printerObjectId) {
    filter.printer = printerObjectId;
  }

  if (transactionType) {
    filter.transactionType = transactionType;
  }

  if (status) {
    filter.status = status;
  }

  const [entries, total] = await Promise.all([
    BalanceLedgerModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<BalanceLedgerLean[]>(),
    BalanceLedgerModel.countDocuments(filter),
  ]);

  return {
    data: entries as IBalanceLedger[],
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getPlatformStats = async (): Promise<PlatformStatsSnapshot> => {
  const [totalsByType, pendingPayouts] = await Promise.all([
    BalanceLedgerModel.aggregate<{
      _id: BalanceTransactionType;
      totalAmount: number;
      count: number;
    }>([
      {
        $group: {
          _id: "$transactionType",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    BalanceLedgerModel.aggregate<{ totalPending: number }>([
      {
        $match: {
          transactionType: BalanceTransactionType.SALE,
          status: {
            $in: [BalanceLedgerStatus.UNPAID, BalanceLedgerStatus.PENDING],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const breakdown = Object.values(BalanceTransactionType).reduce(
    (acc, type) => {
      const match = totalsByType.find((item) => item._id === type);
      acc[type] = {
        totalAmount: match?.totalAmount ?? 0,
        count: match?.count ?? 0,
      };
      return acc;
    },
    {} as PlatformStatsSnapshot["breakdown"]
  );

  const totalGMV = breakdown[BalanceTransactionType.SALE]?.totalAmount ?? 0;
  const payoutTotal =
    breakdown[BalanceTransactionType.PAYOUT]?.totalAmount ?? 0;
  const refundTotal =
    breakdown[BalanceTransactionType.REFUND]?.totalAmount ?? 0;
  const adjustmentTotal =
    breakdown[BalanceTransactionType.ADJUSTMENT]?.totalAmount ?? 0;

  const totalPlatformRevenue =
    totalGMV + payoutTotal + refundTotal + adjustmentTotal;

  const pendingPayoutAmount = pendingPayouts[0]?.totalPending ?? 0;

  return {
    totalGMV,
    totalPlatformRevenue,
    pendingPayouts: pendingPayoutAmount,
    breakdown,
  };
};

/**
 * ========================================
 * FEATURE A: PAYOUT REQUEST MANAGEMENT
 * ========================================
 */

/**
 * Get all payout requests (PENDING or PROCESSING)
 */
export const getPayoutRequests = async (
  query: LedgerQueryParams
): Promise<PaginatedLedgerResult> => {
  const page = Math.max(parseNumericParam(query.page, DEFAULT_PAGE), 1);
  const limit = parseNumericParam(query.limit, DEFAULT_LIMIT);
  const printerObjectId = ensureValidPrinterId(query.printerId);
  const status = normalizeLedgerStatus(query.status as string | undefined);

  const filter: FilterQuery<BalanceLedgerDocument> = {
    transactionType: BalanceTransactionType.PAYOUT,
  };

  // Filter by status (default: PENDING or PROCESSING)
  if (status) {
    filter.status = status;
  } else {
    filter.status = {
      $in: [BalanceLedgerStatus.PENDING, BalanceLedgerStatus.PROCESSING],
    };
  }

  if (printerObjectId) {
    filter.printer = printerObjectId;
  }

  const [entries, total] = await Promise.all([
    BalanceLedgerModel.find(filter)
      .populate("printer", "businessName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<BalanceLedgerLean[]>(),
    BalanceLedgerModel.countDocuments(filter),
  ]);

  return {
    data: entries as IBalanceLedger[],
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

/**
 * Approve a payout request (PENDING -> PROCESSING)
 */
export const approvePayoutRequest = async (
  requestId: string,
  admin: IAdmin,
  context: RequestContextMeta = {}
): Promise<{ success: boolean; message: string; data: IBalanceLedger }> => {
  if (!isValidObjectId(requestId)) {
    throw new ValidationException("RequestId không hợp lệ.");
  }

  const payoutRequest = await BalanceLedgerModel.findById(requestId);

  if (!payoutRequest) {
    throw new NotFoundException("Không tìm thấy yêu cầu rút tiền.");
  }

  if (payoutRequest.transactionType !== BalanceTransactionType.PAYOUT) {
    throw new BadRequestException("Bút toán này không phải là PAYOUT.");
  }

  if (payoutRequest.status !== BalanceLedgerStatus.PENDING) {
    throw new BadRequestException(
      `Không thể duyệt yêu cầu có trạng thái: ${payoutRequest.status}`
    );
  }

  // Update status to PROCESSING
  payoutRequest.status = BalanceLedgerStatus.PROCESSING;
  await payoutRequest.save();

  Logger.success(
    `[PAYOUT APPROVED] RequestId: ${requestId}, Amount: ${payoutRequest.amount}, Admin: ${admin.email}`
  );

  void recordAdminAuditLog({
    action: "PAYOUT_APPROVED",
    actor: admin,
    targetType: "BalanceLedger",
    targetId: requestId,
    metadata: {
      amount: payoutRequest.amount,
      printerId: payoutRequest.printer.toString(),
      previousStatus: BalanceLedgerStatus.PENDING,
      newStatus: BalanceLedgerStatus.PROCESSING,
    },
    ipAddress: context.ipAddress ?? undefined,
    userAgent: context.userAgent ?? undefined,
  });

  return {
    success: true,
    message: "Đã duyệt yêu cầu rút tiền thành công.",
    data: payoutRequest.toObject() as IBalanceLedger,
  };
};

/**
 * Confirm payout success (PROCESSING -> PAID)
 * With proof image and atomic transaction
 */
export const confirmPayoutSuccess = async (
  requestId: string,
  proofImage: string | undefined,
  admin: IAdmin,
  context: RequestContextMeta = {}
): Promise<{ success: boolean; message: string; data: IBalanceLedger }> => {
  if (!isValidObjectId(requestId)) {
    throw new ValidationException("RequestId không hợp lệ.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payoutRequest = await BalanceLedgerModel.findById(requestId)
      .session(session)
      .exec();

    if (!payoutRequest) {
      throw new NotFoundException("Không tìm thấy yêu cầu rút tiền.");
    }

    if (payoutRequest.transactionType !== BalanceTransactionType.PAYOUT) {
      throw new BadRequestException("Bút toán này không phải là PAYOUT.");
    }

    if (payoutRequest.status !== BalanceLedgerStatus.PROCESSING) {
      throw new BadRequestException(
        `Không thể xác nhận yêu cầu có trạng thái: ${payoutRequest.status}`
      );
    }

    // Update status to PAID
    payoutRequest.status = BalanceLedgerStatus.PAID;
    payoutRequest.paidAt = new Date();

    // Store proof image if provided
    if (proofImage) {
      payoutRequest.notes = `${
        payoutRequest.notes || ""
      }\nProof: ${proofImage}`.trim();
    }

    await payoutRequest.save({ session });

    await session.commitTransaction();

    Logger.success(
      `[PAYOUT CONFIRMED] RequestId: ${requestId}, Amount: ${payoutRequest.amount}, Admin: ${admin.email}`
    );

    void recordAdminAuditLog({
      action: "PAYOUT_CONFIRMED",
      actor: admin,
      targetType: "BalanceLedger",
      targetId: requestId,
      metadata: {
        amount: payoutRequest.amount,
        printerId: payoutRequest.printer.toString(),
        proofImage,
        previousStatus: BalanceLedgerStatus.PROCESSING,
        newStatus: BalanceLedgerStatus.PAID,
      },
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
    });

    return {
      success: true,
      message: "Đã xác nhận thanh toán thành công.",
      data: payoutRequest.toObject() as IBalanceLedger,
    };
  } catch (error) {
    await session.abortTransaction();
    Logger.error("[PAYOUT CONFIRM FAILED]", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reject payout request with refund (ATOMIC TRANSACTION)
 * CRITICAL: Must refund money back to printer's available balance
 */
export const rejectPayoutRequest = async (
  requestId: string,
  reason: string,
  admin: IAdmin,
  context: RequestContextMeta = {}
): Promise<{ success: boolean; message: string; data: IBalanceLedger }> => {
  if (!isValidObjectId(requestId)) {
    throw new ValidationException("RequestId không hợp lệ.");
  }

  if (!reason || reason.trim().length === 0) {
    throw new ValidationException("Lý do từ chối là bắt buộc.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payoutRequest = await BalanceLedgerModel.findById(requestId)
      .session(session)
      .exec();

    if (!payoutRequest) {
      throw new NotFoundException("Không tìm thấy yêu cầu rút tiền.");
    }

    if (payoutRequest.transactionType !== BalanceTransactionType.PAYOUT) {
      throw new BadRequestException("Bút toán này không phải là PAYOUT.");
    }

    if (
      payoutRequest.status !== BalanceLedgerStatus.PENDING &&
      payoutRequest.status !== BalanceLedgerStatus.PROCESSING
    ) {
      throw new BadRequestException(
        `Không thể từ chối yêu cầu có trạng thái: ${payoutRequest.status}`
      );
    }

    const previousStatus = payoutRequest.status;

    // Update status to CANCELLED
    payoutRequest.status = BalanceLedgerStatus.CANCELLED;
    payoutRequest.notes = `${
      payoutRequest.notes || ""
    }\nRejected: ${reason}`.trim();
    await payoutRequest.save({ session });

    // CRITICAL: Create refund entry to give money back
    // The original payout was negative, so refund is positive
    const refundAmount = Math.abs(payoutRequest.amount);

    await BalanceLedgerModel.create(
      [
        {
          printer: payoutRequest.printer,
          masterOrder: payoutRequest.masterOrder,
          subOrder: payoutRequest.subOrder,
          amount: refundAmount, // Positive to add back
          transactionType: BalanceTransactionType.ADJUSTMENT,
          status: BalanceLedgerStatus.PAID,
          paidAt: new Date(),
          paymentGateway: "MANUAL",
          notes: `Hoàn tiền do từ chối rút tiền. RequestId: ${requestId}. Lý do: ${reason}`,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    Logger.warn(
      `[PAYOUT REJECTED] RequestId: ${requestId}, Amount: ${payoutRequest.amount}, Refunded: ${refundAmount}, Admin: ${admin.email}, Reason: ${reason}`
    );

    void recordAdminAuditLog({
      action: "PAYOUT_REJECTED",
      actor: admin,
      targetType: "BalanceLedger",
      targetId: requestId,
      metadata: {
        amount: payoutRequest.amount,
        refundAmount,
        printerId: payoutRequest.printer.toString(),
        reason,
        previousStatus,
        newStatus: BalanceLedgerStatus.CANCELLED,
      },
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
    });

    return {
      success: true,
      message: "Đã từ chối yêu cầu rút tiền và hoàn tiền thành công.",
      data: payoutRequest.toObject() as IBalanceLedger,
    };
  } catch (error) {
    await session.abortTransaction();
    Logger.error("[PAYOUT REJECT FAILED]", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * ========================================
 * FEATURE B: GENERAL LEDGER (SO CAI)
 * ========================================
 */

/**
 * Get ledger entries with credit/debit totals
 */
export const getLedgerEntriesWithTotals = async (
  query: LedgerQueryParams
): Promise<
  PaginatedLedgerResult & { totalCredit: number; totalDebit: number }
> => {
  const page = Math.max(parseNumericParam(query.page, DEFAULT_PAGE), 1);
  const limit = parseNumericParam(query.limit, DEFAULT_LIMIT);
  const printerObjectId = ensureValidPrinterId(query.printerId);
  const transactionType = normalizeTransactionType(
    query.type as string | undefined
  );
  const status = normalizeLedgerStatus(query.status as string | undefined);

  const filter: FilterQuery<BalanceLedgerDocument> = {};

  if (printerObjectId) {
    filter.printer = printerObjectId;
  }

  if (transactionType) {
    filter.transactionType = transactionType;
  }

  if (status) {
    filter.status = status;
  }

  const [entries, total, totals] = await Promise.all([
    BalanceLedgerModel.find(filter)
      .populate("printer", "businessName email")
      .populate("masterOrder", "orderNumber")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<BalanceLedgerLean[]>()
      .exec(),
    BalanceLedgerModel.countDocuments(filter),
    BalanceLedgerModel.aggregate<{ totalCredit: number; totalDebit: number }>([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
            },
          },
          totalDebit: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
            },
          },
        },
      },
    ]),
  ]);

  const { totalCredit = 0, totalDebit = 0 } = totals[0] || {};

  return {
    data: entries as IBalanceLedger[],
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    totalCredit,
    totalDebit,
  };
};

/**
 * ========================================
 * FEATURE C: PLATFORM HEALTH STATS
 * ========================================
 */

/**
 * Get comprehensive platform financial stats
 * CRITICAL: The "Bankruptcy Check"
 */
export const getComprehensivePlatformStats = async (): Promise<
  PlatformStatsSnapshot & {
    totalDebt: number;
    totalCommissionRevenue: number;
    pendingPayoutRequests: number;
    healthStatus: "healthy" | "warning" | "critical";
  }
> => {
  const [
    totalsByType,
    pendingPayouts,
    totalDebt,
    commissionRevenue,
    pendingPayoutRequests,
  ] = await Promise.all([
    // 1. Breakdown by transaction type
    BalanceLedgerModel.aggregate<{
      _id: BalanceTransactionType;
      totalAmount: number;
      count: number;
    }>([
      {
        $group: {
          _id: "$transactionType",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // 2. Pending payouts (UNPAID + PENDING sales)
    BalanceLedgerModel.aggregate<{ totalPending: number }>([
      {
        $match: {
          transactionType: BalanceTransactionType.SALE,
          status: {
            $in: [BalanceLedgerStatus.UNPAID, BalanceLedgerStatus.PENDING],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$amount" },
        },
      },
    ]),

    // 3. CRITICAL: Total Debt (Money we owe to printers)
    // Sum of all PAID transactions (available balance for all printers)
    BalanceLedgerModel.aggregate<{ totalDebt: number }>([
      {
        $match: {
          status: BalanceLedgerStatus.PAID,
        },
      },
      {
        $group: {
          _id: null,
          totalDebt: { $sum: "$amount" },
        },
      },
    ]),

    // 4. Total Platform Revenue (Commission from orders)
    MasterOrderModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$totalCommission" },
        },
      },
    ]),

    // 5. Pending payout requests count
    BalanceLedgerModel.countDocuments({
      transactionType: BalanceTransactionType.PAYOUT,
      status: {
        $in: [BalanceLedgerStatus.PENDING, BalanceLedgerStatus.PROCESSING],
      },
    }),
  ]);

  const breakdown = Object.values(BalanceTransactionType).reduce(
    (acc, type) => {
      const match = totalsByType.find((item) => item._id === type);
      acc[type] = {
        totalAmount: match?.totalAmount ?? 0,
        count: match?.count ?? 0,
      };
      return acc;
    },
    {} as PlatformStatsSnapshot["breakdown"]
  );

  const totalGMV = breakdown[BalanceTransactionType.SALE]?.totalAmount ?? 0;
  const payoutTotal =
    breakdown[BalanceTransactionType.PAYOUT]?.totalAmount ?? 0;
  const refundTotal =
    breakdown[BalanceTransactionType.REFUND]?.totalAmount ?? 0;
  const adjustmentTotal =
    breakdown[BalanceTransactionType.ADJUSTMENT]?.totalAmount ?? 0;

  const totalPlatformRevenue =
    totalGMV + payoutTotal + refundTotal + adjustmentTotal;

  const pendingPayoutAmount = pendingPayouts[0]?.totalPending ?? 0;
  const totalDebtAmount = totalDebt[0]?.totalDebt ?? 0;
  const totalCommissionRevenueAmount =
    commissionRevenue[0]?.totalCommission ?? 0;

  // Health check: Compare debt vs revenue
  let healthStatus: "healthy" | "warning" | "critical" = "healthy";
  const debtToRevenueRatio =
    totalCommissionRevenueAmount > 0
      ? Math.abs(totalDebtAmount) / totalCommissionRevenueAmount
      : 0;

  if (debtToRevenueRatio > 0.9) {
    healthStatus = "critical"; // Debt > 90% of revenue
  } else if (debtToRevenueRatio > 0.7) {
    healthStatus = "warning"; // Debt > 70% of revenue
  }

  Logger.info("[PLATFORM STATS]", {
    totalDebt: totalDebtAmount,
    totalCommissionRevenue: totalCommissionRevenueAmount,
    debtToRevenueRatio: `${(debtToRevenueRatio * 100).toFixed(2)}%`,
    healthStatus,
  });

  return {
    totalGMV,
    totalPlatformRevenue,
    pendingPayouts: pendingPayoutAmount,
    breakdown,
    totalDebt: totalDebtAmount,
    totalCommissionRevenue: totalCommissionRevenueAmount,
    pendingPayoutRequests,
    healthStatus,
  };
};

// Legacy function (kept for backward compatibility)
export const approvePayout = async (
  printerId: string,
  amount: number,
  admin: IAdmin,
  context: RequestContextMeta = {}
): Promise<ApprovePayoutResult> => {
  const printerObjectId = ensureValidPrinterId(printerId);
  if (!printerObjectId) {
    throw new ValidationException("Yêu cầu chọn printerId.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationException("Số tiền payout phải lớn hơn 0.");
  }

  if (!admin) {
    throw new ValidationException("Thiếu thông tin admin thực hiện.");
  }

  const unpaidEntries = await BalanceLedgerModel.find({
    printer: printerObjectId,
    transactionType: BalanceTransactionType.SALE,
    status: BalanceLedgerStatus.UNPAID,
  })
    .sort({ createdAt: 1 })
    .exec();

  if (unpaidEntries.length === 0) {
    throw new NotFoundException("Ledger entries chưa thanh toán");
  }

  const entriesToSettle: BalanceLedgerDocument[] = [];
  let accumulated = 0;

  for (const entry of unpaidEntries) {
    entriesToSettle.push(entry);
    accumulated += entry.amount;
    if (accumulated >= amount) {
      break;
    }
  }

  if (entriesToSettle.length === 0) {
    throw new ValidationException(
      "Không thể tìm thấy bút toán hợp lệ để thanh toán."
    );
  }

  const entryIds = entriesToSettle.map((entry) => entry._id);
  const settledAmount = entriesToSettle.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  await BalanceLedgerModel.updateMany(
    { _id: { $in: entryIds } },
    {
      status: BalanceLedgerStatus.PAID,
      paidAt: new Date(),
    }
  ).exec();

  const remainingUnpaidAgg = await BalanceLedgerModel.aggregate<{
    total: number;
  }>([
    {
      $match: {
        printer: printerObjectId,
        transactionType: BalanceTransactionType.SALE,
        status: BalanceLedgerStatus.UNPAID,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const remainingUnpaidAmount = remainingUnpaidAgg[0]?.total ?? 0;

  void recordAdminAuditLog({
    action: "PAYOUT_APPROVED",
    actor: admin,
    targetType: "PrinterProfile",
    targetId: printerObjectId.toString(),
    metadata: {
      requestedAmount: amount,
      settledAmount,
      ledgerEntryIds: entryIds.map((id) => id.toString()),
      remainingUnpaidAmount,
    },
    ipAddress: context.ipAddress ?? undefined,
    userAgent: context.userAgent ?? undefined,
  });

  return {
    printerId: printerObjectId.toString(),
    requestedAmount: amount,
    settledAmount,
    ledgerEntryIds: entryIds.map((id) => id.toString()),
    remainingUnpaidAmount,
  };
};
