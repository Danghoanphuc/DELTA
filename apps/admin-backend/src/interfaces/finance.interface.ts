import {
  type BalanceLedgerStatus,
  type BalanceTransactionType,
  type IBalanceLedger,
} from "@printz/types";

export interface LedgerQueryParams {
  page?: number | string;
  limit?: number | string;
  printerId?: string;
  type?: BalanceTransactionType | string;
  status?: BalanceLedgerStatus | string;
}

export interface PaginatedLedgerResult {
  data: IBalanceLedger[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlatformStatsSnapshot {
  totalGMV: number;
  totalPlatformRevenue: number;
  pendingPayouts: number;
  breakdown: Record<
    BalanceTransactionType,
    {
      totalAmount: number;
      count: number;
    }
  >;
}

export interface ApprovePayoutResult {
  printerId: string;
  requestedAmount: number;
  settledAmount: number;
  ledgerEntryIds: string[];
  remainingUnpaidAmount: number;
}

export interface RequestContextMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

