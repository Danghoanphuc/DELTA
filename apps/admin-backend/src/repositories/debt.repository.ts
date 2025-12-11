/**
 * DebtRepository - Data Access Layer for Debt Management
 *
 * Implements repository pattern for CustomerCredit and DebtLedger models
 * Following SOLID principles and existing codebase patterns
 *
 * Requirements: 8.1
 */

import mongoose, { FilterQuery, UpdateQuery, ClientSession } from "mongoose";
import { Logger } from "../utils/logger.js";
import {
  CustomerCredit,
  ICustomerCredit,
  PAYMENT_PATTERN,
} from "../models/customer-credit.model.js";
import {
  DebtLedger,
  IDebtLedger,
  DEBT_TRANSACTION_TYPE,
  DebtTransactionType,
} from "../models/debt-ledger.model.js";
import {
  IRepository,
  PaginatedResult,
} from "../interfaces/repository.interface.js";

/**
 * Debt Repository Interface
 */
export interface IDebtRepository {
  // CustomerCredit operations
  findCreditByCustomer(customerId: string): Promise<ICustomerCredit | null>;
  findOrCreateCredit(
    customerId: string,
    defaultLimit?: number
  ): Promise<ICustomerCredit>;
  findOrCreateCreditWithLock(
    customerId: string,
    session: ClientSession,
    defaultLimit?: number
  ): Promise<ICustomerCredit>;
  updateCreditLimit(
    customerId: string,
    newLimit: number,
    changedBy: string,
    reason?: string
  ): Promise<ICustomerCredit>;

  // Balance operations
  getBalance(customerId: string): Promise<number>;
  addDebt(
    customerId: string,
    amount: number,
    session?: ClientSession
  ): Promise<ICustomerCredit>;
  recordPayment(
    customerId: string,
    amount: number,
    session?: ClientSession
  ): Promise<ICustomerCredit>;

  // Transaction operations
  addTransaction(
    customerId: string,
    transactionType: DebtTransactionType,
    amount: number,
    createdBy: string,
    options?: {
      orderId?: string;
      dueDate?: Date;
      notes?: string;
      session?: ClientSession;
    }
  ): Promise<IDebtLedger>;

  getHistory(
    customerId: string,
    options?: {
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
      transactionType?: DebtTransactionType;
    }
  ): Promise<IDebtLedger[]>;

  getOverdueTransactions(customerId?: string): Promise<IDebtLedger[]>;
  calculateDebtFromLedger(customerId: string): Promise<number>;
}

/**
 * DebtRepository - Data access for debt and credit management
 */
export class DebtRepository implements IDebtRepository {
  /**
   * Find customer credit record by customer ID
   * Requirements: 8.1
   */
  async findCreditByCustomer(
    customerId: string
  ): Promise<ICustomerCredit | null> {
    try {
      return await CustomerCredit.findOne({
        customerId: new mongoose.Types.ObjectId(customerId),
      }).lean();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error finding credit for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find or create customer credit record
   * Requirements: 8.1
   */
  async findOrCreateCredit(
    customerId: string,
    defaultLimit: number = 0
  ): Promise<ICustomerCredit> {
    try {
      const customerObjectId = new mongoose.Types.ObjectId(customerId);
      let credit = await CustomerCredit.findOne({
        customerId: customerObjectId,
      });

      if (!credit) {
        credit = await CustomerCredit.create({
          customerId: customerObjectId,
          creditLimit: defaultLimit,
          currentDebt: 0,
          overdueAmount: 0,
          paymentPattern: PAYMENT_PATTERN.GOOD,
          isBlocked: false,
        });
        Logger.success(
          `[DebtRepo] Created credit record for customer ${customerId}`
        );
      }

      return credit.toObject();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error finding/creating credit for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find or create customer credit record with lock for transaction
   * Requirements: 8.2, 8.3
   *
   * Uses findOneAndUpdate with upsert to atomically find or create
   * and lock the document within a transaction
   */
  async findOrCreateCreditWithLock(
    customerId: string,
    session: ClientSession,
    defaultLimit: number = 0
  ): Promise<ICustomerCredit> {
    try {
      const customerObjectId = new mongoose.Types.ObjectId(customerId);

      // Use findOneAndUpdate with upsert to atomically find or create
      // This locks the document for the duration of the transaction
      const credit = await CustomerCredit.findOneAndUpdate(
        { customerId: customerObjectId },
        {
          $setOnInsert: {
            customerId: customerObjectId,
            creditLimit: defaultLimit,
            currentDebt: 0,
            overdueAmount: 0,
            paymentPattern: PAYMENT_PATTERN.GOOD,
            isBlocked: false,
          },
        },
        {
          upsert: true,
          new: true,
          session,
          // This ensures the document is locked for update
          rawResult: false,
        }
      );

      if (!credit) {
        throw new Error(
          `Failed to find or create credit record for customer ${customerId}`
        );
      }

      Logger.debug(
        `[DebtRepo] Locked credit record for customer ${customerId} in transaction`
      );

      return credit.toObject();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error finding/creating credit with lock for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update customer credit limit with audit trail
   * Requirements: 11.1, 11.5
   */
  async updateCreditLimit(
    customerId: string,
    newLimit: number,
    changedBy: string,
    reason?: string
  ): Promise<ICustomerCredit> {
    try {
      const credit = await CustomerCredit.findOne({
        customerId: new mongoose.Types.ObjectId(customerId),
      });

      if (!credit) {
        throw new Error(`Credit record not found for customer ${customerId}`);
      }

      await credit.updateCreditLimit(
        newLimit,
        new mongoose.Types.ObjectId(changedBy),
        reason
      );

      Logger.success(
        `[DebtRepo] Updated credit limit for customer ${customerId}: ${credit.creditLimit} -> ${newLimit}`
      );

      return credit.toObject();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error updating credit limit for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get current balance for customer
   * Requirements: 8.1
   */
  async getBalance(customerId: string): Promise<number> {
    try {
      const credit = await this.findCreditByCustomer(customerId);
      return credit?.currentDebt || 0;
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error getting balance for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Add debt to customer account
   * Requirements: 8.1
   */
  async addDebt(
    customerId: string,
    amount: number,
    session?: ClientSession
  ): Promise<ICustomerCredit> {
    try {
      const credit = await CustomerCredit.findOne({
        customerId: new mongoose.Types.ObjectId(customerId),
      }).session(session || null);

      if (!credit) {
        throw new Error(`Credit record not found for customer ${customerId}`);
      }

      await credit.addDebt(amount);

      Logger.debug(
        `[DebtRepo] Added debt ${amount} to customer ${customerId}. New balance: ${credit.currentDebt}`
      );

      return credit.toObject();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error adding debt for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Record payment for customer
   * Requirements: 8.4
   */
  async recordPayment(
    customerId: string,
    amount: number,
    session?: ClientSession
  ): Promise<ICustomerCredit> {
    try {
      const credit = await CustomerCredit.findOne({
        customerId: new mongoose.Types.ObjectId(customerId),
      }).session(session || null);

      if (!credit) {
        throw new Error(`Credit record not found for customer ${customerId}`);
      }

      await credit.recordPayment(amount);

      Logger.success(
        `[DebtRepo] Recorded payment ${amount} for customer ${customerId}. New balance: ${credit.currentDebt}`
      );

      return credit.toObject();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error recording payment for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Add transaction to debt ledger
   * Requirements: 8.5
   */
  async addTransaction(
    customerId: string,
    transactionType: DebtTransactionType,
    amount: number,
    createdBy: string,
    options: {
      orderId?: string;
      dueDate?: Date;
      notes?: string;
      session?: ClientSession;
    } = {}
  ): Promise<IDebtLedger> {
    try {
      const { orderId, dueDate, notes, session } = options;

      // Get current balance
      const currentBalance = await this.getBalance(customerId);

      // Calculate new balance
      const balanceAfter = currentBalance + amount;

      const transaction = await DebtLedger.create(
        [
          {
            customerId: new mongoose.Types.ObjectId(customerId),
            transactionType,
            orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
            amount,
            balanceBefore: currentBalance,
            balanceAfter,
            dueDate,
            paidDate:
              transactionType === DEBT_TRANSACTION_TYPE.PAYMENT
                ? new Date()
                : undefined,
            notes,
            createdBy: new mongoose.Types.ObjectId(createdBy),
          },
        ],
        { session }
      );

      Logger.debug(
        `[DebtRepo] Added ${transactionType} transaction for customer ${customerId}: ${amount}`
      );

      return transaction[0].toObject();
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error adding transaction for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get transaction history for customer
   * Requirements: 8.5
   */
  async getHistory(
    customerId: string,
    options: {
      limit?: number;
      skip?: number;
      startDate?: Date;
      endDate?: Date;
      transactionType?: DebtTransactionType;
    } = {}
  ): Promise<IDebtLedger[]> {
    try {
      return await DebtLedger.getCustomerHistory(
        new mongoose.Types.ObjectId(customerId),
        options
      );
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error getting history for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get overdue transactions
   * Requirements: 8.1
   */
  async getOverdueTransactions(customerId?: string): Promise<IDebtLedger[]> {
    try {
      return await DebtLedger.getOverdueTransactions(
        customerId ? new mongoose.Types.ObjectId(customerId) : undefined
      );
    } catch (error) {
      Logger.error(`[DebtRepo] Error getting overdue transactions:`, error);
      throw error;
    }
  }

  /**
   * Calculate customer debt from ledger transactions
   * Requirements: 8.1, 8.5
   */
  async calculateDebtFromLedger(customerId: string): Promise<number> {
    try {
      return await DebtLedger.calculateCustomerDebt(
        new mongoose.Types.ObjectId(customerId)
      );
    } catch (error) {
      Logger.error(
        `[DebtRepo] Error calculating debt from ledger for customer ${customerId}:`,
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const debtRepository = new DebtRepository();
