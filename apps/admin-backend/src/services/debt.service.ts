/**
 * DebtService - Debt and Credit Management
 *
 * Business logic for customer debt tracking, credit limit enforcement,
 * and payment processing
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.2, 11.3
 */

import mongoose from "mongoose";
import { Logger } from "../utils/logger.js";
import {
  DebtRepository,
  debtRepository,
} from "../repositories/debt.repository.js";
import { DEBT_TRANSACTION_TYPE } from "../models/debt-ledger.model.js";
import { PAYMENT_PATTERN } from "../models/customer-credit.model.js";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../shared/exceptions.js";

/**
 * Debt summary for customer
 */
export interface DebtSummary {
  customerId: string;
  currentDebt: number;
  creditLimit: number;
  availableCredit: number;
  overdueAmount: number;
  lastPaymentDate?: Date;
  paymentPattern: "good" | "average" | "poor";
  isBlocked: boolean;
  blockReason?: string;
}

/**
 * Credit check result
 */
export interface CreditCheckResult {
  allowed: boolean;
  currentDebt: number;
  creditLimit: number;
  orderAmount: number;
  shortfall?: number;
  message: string;
}

/**
 * Payment data
 */
export interface Payment {
  amount: number;
  notes?: string;
  recordedBy: string;
}

/**
 * Debt transaction for history
 */
export interface DebtTransaction {
  _id: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  dueDate?: Date;
  paidDate?: Date;
  notes?: string;
  orderId?: {
    _id: string;
    orderNumber: string;
  };
  createdBy: {
    _id: string;
    displayName?: string;
    email?: string;
  };
  createdAt: Date;
}

/**
 * DebtService - Debt and credit management
 */
export class DebtService {
  constructor(private readonly repository: DebtRepository = debtRepository) {}

  /**
   * Get customer debt summary
   * Requirements: 8.1, 8.5
   *
   * Calculates current debt from ledger transactions and includes
   * overdue amount and payment pattern
   */
  async getCustomerDebt(customerId: string): Promise<DebtSummary> {
    Logger.debug(`[DebtSvc] Getting debt summary for customer ${customerId}`);

    try {
      // Validate customer ID
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ValidationException("ID khách hàng không hợp lệ");
      }

      // Get or create credit record
      const credit = await this.repository.findOrCreateCredit(customerId);

      // Calculate debt from ledger for accuracy
      const calculatedDebt = await this.repository.calculateDebtFromLedger(
        customerId
      );

      // Sync if there's a discrepancy (debt cannot be negative)
      const finalCalculatedDebt = Math.max(0, calculatedDebt);
      if (Math.abs(finalCalculatedDebt - credit.currentDebt) > 0.01) {
        Logger.warn(
          `[DebtSvc] Debt mismatch for customer ${customerId}. Credit: ${credit.currentDebt}, Ledger: ${calculatedDebt}. Syncing...`
        );
        // Update credit record to match ledger (but never negative)
        credit.currentDebt = finalCalculatedDebt;
        await this.repository.addDebt(customerId, 0); // Trigger save
      }

      // Get overdue transactions
      const overdueTransactions = await this.repository.getOverdueTransactions(
        customerId
      );
      const overdueAmount = overdueTransactions.reduce(
        (sum, tx) => sum + tx.amount,
        0
      );

      // Calculate payment pattern based on payment history
      const paymentPattern = await this.calculatePaymentPattern(customerId);

      const summary: DebtSummary = {
        customerId,
        currentDebt: credit.currentDebt,
        creditLimit: credit.creditLimit,
        availableCredit: Math.max(0, credit.creditLimit - credit.currentDebt),
        overdueAmount,
        lastPaymentDate: credit.lastPaymentDate,
        paymentPattern,
        isBlocked: credit.isBlocked,
        blockReason: credit.blockReason,
      };

      Logger.success(
        `[DebtSvc] Retrieved debt summary for customer ${customerId}: Debt=${summary.currentDebt}, Limit=${summary.creditLimit}`
      );

      return summary;
    } catch (error) {
      Logger.error(
        `[DebtSvc] Error getting debt summary for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if customer has available credit for order
   * Requirements: 8.2, 8.3, 11.2
   *
   * Performs atomic check: (currentDebt + orderAmount) <= creditLimit
   * Uses MongoDB transaction to prevent race conditions
   *
   * @param customerId - Customer ID to check
   * @param orderAmount - Order amount to check
   * @param options - Optional parameters
   * @param options.reserveCredit - If true, reserves credit amount on success (default: false)
   * @param options.orderId - Order ID for reservation tracking
   * @param options.userId - User ID for audit trail
   */
  async checkCreditAvailability(
    customerId: string,
    orderAmount: number,
    options: {
      reserveCredit?: boolean;
      orderId?: string;
      userId?: string;
    } = {}
  ): Promise<CreditCheckResult> {
    Logger.debug(
      `[DebtSvc] Checking credit availability for customer ${customerId}, amount ${orderAmount}`
    );

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ValidationException("ID khách hàng không hợp lệ");
    }

    if (orderAmount <= 0) {
      throw new ValidationException("Số tiền đơn hàng phải lớn hơn 0");
    }

    // Start transaction for atomic credit check
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Lock customer credit record for update
      // This prevents concurrent transactions from reading the same value
      const credit = await this.repository.findOrCreateCreditWithLock(
        customerId,
        session
      );

      // Check if customer is blocked
      if (credit.isBlocked) {
        await session.abortTransaction();
        return {
          allowed: false,
          currentDebt: credit.currentDebt,
          creditLimit: credit.creditLimit,
          orderAmount,
          shortfall: credit.currentDebt + orderAmount - credit.creditLimit,
          message: `Khách hàng đã bị chặn. Lý do: ${
            credit.blockReason || "Vượt hạn mức tín dụng"
          }`,
        };
      }

      // Atomic check: (currentDebt + orderAmount) <= creditLimit
      const totalDebtAfterOrder = credit.currentDebt + orderAmount;
      const allowed = totalDebtAfterOrder <= credit.creditLimit;

      const result: CreditCheckResult = {
        allowed,
        currentDebt: credit.currentDebt,
        creditLimit: credit.creditLimit,
        orderAmount,
        message: allowed
          ? "Đủ hạn mức tín dụng"
          : `Vượt hạn mức tín dụng. Công nợ hiện tại: ${credit.currentDebt.toLocaleString(
              "vi-VN"
            )}đ, Hạn mức: ${credit.creditLimit.toLocaleString(
              "vi-VN"
            )}đ, Thiếu: ${(
              totalDebtAfterOrder - credit.creditLimit
            ).toLocaleString("vi-VN")}đ`,
      };

      if (!allowed) {
        result.shortfall = totalDebtAfterOrder - credit.creditLimit;
        await session.abortTransaction();
        Logger.debug(
          `[DebtSvc] Credit check BLOCKED for customer ${customerId}: shortfall ${result.shortfall}`
        );
        return result;
      }

      // If reserveCredit is true, reserve the credit amount
      if (options.reserveCredit && allowed) {
        await this.repository.addDebt(customerId, orderAmount, session);

        // Add transaction to ledger for audit trail
        if (options.orderId && options.userId) {
          await this.repository.addTransaction(
            customerId,
            DEBT_TRANSACTION_TYPE.ORDER,
            orderAmount,
            options.userId,
            {
              orderId: options.orderId,
              notes: "Credit reserved for order",
              session,
            }
          );
        }

        Logger.success(
          `[DebtSvc] Reserved credit ${orderAmount} for customer ${customerId}`
        );
      }

      // Commit transaction
      await session.commitTransaction();

      Logger.debug(`[DebtSvc] Credit check ALLOWED for customer ${customerId}`);

      return result;
    } catch (error) {
      // Rollback on any error
      await session.abortTransaction();
      Logger.error(
        `[DebtSvc] Error checking credit availability for customer ${customerId}:`,
        error
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Record payment for customer
   * Requirements: 8.4
   *
   * Records payment and updates balance atomically
   */
  async recordPayment(
    customerId: string,
    payment: Payment
  ): Promise<DebtSummary> {
    Logger.debug(
      `[DebtSvc] Recording payment for customer ${customerId}: ${payment.amount}`
    );

    try {
      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ValidationException("ID khách hàng không hợp lệ");
      }

      if (payment.amount <= 0) {
        throw new ValidationException("Số tiền thanh toán phải lớn hơn 0");
      }

      // Use transaction for atomicity
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Record payment in credit record
        await this.repository.recordPayment(
          customerId,
          payment.amount,
          session
        );

        // Add payment transaction to ledger
        await this.repository.addTransaction(
          customerId,
          DEBT_TRANSACTION_TYPE.PAYMENT,
          -Math.abs(payment.amount), // Payments are negative
          payment.recordedBy,
          {
            notes: payment.notes,
            session,
          }
        );

        await session.commitTransaction();
        Logger.success(
          `[DebtSvc] Recorded payment ${payment.amount} for customer ${customerId}`
        );
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

      // Return updated debt summary
      return await this.getCustomerDebt(customerId);
    } catch (error) {
      Logger.error(
        `[DebtSvc] Error recording payment for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get debt transaction history
   * Requirements: 8.5
   */
  async getDebtHistory(
    customerId: string,
    options: {
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
      transactionType?: string;
    } = {}
  ): Promise<DebtTransaction[]> {
    Logger.debug(`[DebtSvc] Getting debt history for customer ${customerId}`);

    try {
      // Validate customer ID
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ValidationException("ID khách hàng không hợp lệ");
      }

      const history = await this.repository.getHistory(customerId, options);

      Logger.success(
        `[DebtSvc] Retrieved ${history.length} transactions for customer ${customerId}`
      );

      return history as DebtTransaction[];
    } catch (error) {
      Logger.error(
        `[DebtSvc] Error getting debt history for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Calculate payment pattern based on payment history
   * Private helper method
   */
  private async calculatePaymentPattern(
    customerId: string
  ): Promise<"good" | "average" | "poor"> {
    try {
      // Get payment history for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const history = await this.repository.getHistory(customerId, {
        startDate: sixMonthsAgo,
        transactionType: DEBT_TRANSACTION_TYPE.PAYMENT,
      });

      // Get overdue transactions
      const overdueTransactions = await this.repository.getOverdueTransactions(
        customerId
      );

      // Simple heuristic:
      // - Good: No overdue, regular payments
      // - Average: Some overdue or irregular payments
      // - Poor: Many overdue or no payments

      if (overdueTransactions.length === 0 && history.length >= 3) {
        return PAYMENT_PATTERN.GOOD;
      } else if (overdueTransactions.length > 3 || history.length === 0) {
        return PAYMENT_PATTERN.POOR;
      } else {
        return PAYMENT_PATTERN.AVERAGE;
      }
    } catch (error) {
      Logger.warn(
        `[DebtSvc] Error calculating payment pattern for customer ${customerId}:`,
        error
      );
      return PAYMENT_PATTERN.AVERAGE; // Default to average on error
    }
  }
}

// Export singleton instance
export const debtService = new DebtService();
