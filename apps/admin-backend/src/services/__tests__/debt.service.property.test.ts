/**
 * Property-Based Tests for DebtService
 *
 * Tests correctness properties using fast-check library
 * Each test validates specific requirements from the design document
 *
 * Requirements: 8.1, 8.2, 8.3, 8.5, 11.2, 11.3
 */

import * as fc from "fast-check";
import mongoose, { Types } from "mongoose";
import { DebtService } from "../debt.service.js";
import { CustomerCredit } from "../../models/customer-credit.model.js";
import {
  DebtLedger,
  DEBT_TRANSACTION_TYPE,
} from "../../models/debt-ledger.model.js";

let debtService: DebtService;

// Arbitraries for generating test data
const customerIdArb = fc.integer().map(() => new Types.ObjectId().toString());

const positiveAmountArb = fc.integer({ min: 1000, max: 100000000 });

const transactionArb = fc.record({
  type: fc.constantFrom(
    DEBT_TRANSACTION_TYPE.ORDER,
    DEBT_TRANSACTION_TYPE.PAYMENT,
    DEBT_TRANSACTION_TYPE.ADJUSTMENT
  ),
  amount: positiveAmountArb,
});

// Setup
beforeAll(async () => {
  debtService = new DebtService();
});

describe("DebtService Property Tests", () => {
  /**
   * **Feature: printz-platform-features, Property 20: Debt Display Accuracy**
   * **Validates: Requirements 8.1, 8.5**
   *
   * For any customer with recorded transactions, the displayed debt SHALL equal
   * the sum of all order amounts minus all payment amounts.
   */
  describe("Property 20: Debt Display Accuracy", () => {
    it("should display debt equal to sum of transactions", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(transactionArb, { minLength: 1, maxLength: 10 }),
          async (transactions) => {
            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();

            // Create customer credit record
            const adminId = new Types.ObjectId();
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit: 100000000,
              currentDebt: 0,
              overdueAmount: 0,
            });

            // Record all transactions
            let expectedDebt = 0;
            for (const tx of transactions) {
              const currentBalance = expectedDebt;
              const amount =
                tx.type === DEBT_TRANSACTION_TYPE.PAYMENT
                  ? -Math.abs(tx.amount)
                  : tx.amount;

              await DebtLedger.create({
                customerId: new Types.ObjectId(customerId),
                transactionType: tx.type,
                orderId:
                  tx.type === DEBT_TRANSACTION_TYPE.ORDER
                    ? new Types.ObjectId()
                    : undefined,
                amount,
                balanceBefore: currentBalance,
                balanceAfter: currentBalance + amount,
                createdBy: adminId,
              });

              expectedDebt += amount;
            }

            // Update credit record to match (debt cannot be negative)
            const finalDebt = Math.max(0, expectedDebt);
            await CustomerCredit.findOneAndUpdate(
              { customerId: new Types.ObjectId(customerId) },
              { currentDebt: finalDebt }
            );

            // Get debt summary
            const summary = await debtService.getCustomerDebt(customerId);

            // Verify debt equals sum of transactions (cannot be negative)
            // Note: The service syncs to ledger, which may have negative values
            // but currentDebt should never be negative
            const calculatedDebt = await DebtLedger.calculateCustomerDebt(
              new Types.ObjectId(customerId)
            );
            const expectedFinalDebt = Math.max(0, calculatedDebt);
            expect(summary.currentDebt).toBe(expectedFinalDebt);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle empty transaction history", async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer(), async (_seed) => {
          // Generate unique customer ID for each test run
          const customerId = new Types.ObjectId().toString();

          // Create customer with no transactions
          await CustomerCredit.create({
            customerId: new Types.ObjectId(customerId),
            creditLimit: 10000000,
            currentDebt: 0,
            overdueAmount: 0,
          });

          const summary = await debtService.getCustomerDebt(customerId);

          // Debt should be zero
          expect(summary.currentDebt).toBe(0);
          expect(summary.availableCredit).toBe(summary.creditLimit);
        }),
        { numRuns: 50 }
      );
    });

    it("should sync debt when ledger and credit mismatch", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          positiveAmountArb,
          async (ledgerAmount, creditAmount) => {
            // Assume ledgerAmount and creditAmount are different
            fc.pre(Math.abs(ledgerAmount - creditAmount) > 100);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();
            const adminId = new Types.ObjectId();

            // Create credit record with one amount
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit: 100000000,
              currentDebt: creditAmount,
              overdueAmount: 0,
            });

            // Create ledger transactions that sum to different amount
            await DebtLedger.create({
              customerId: new Types.ObjectId(customerId),
              transactionType: DEBT_TRANSACTION_TYPE.ORDER,
              orderId: new Types.ObjectId(),
              amount: ledgerAmount,
              balanceBefore: 0,
              balanceAfter: ledgerAmount,
              createdBy: adminId,
            });

            // Get debt summary (should sync)
            const summary = await debtService.getCustomerDebt(customerId);

            // Should match ledger amount (source of truth)
            expect(summary.currentDebt).toBe(ledgerAmount);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 21: Credit Limit Enforcement**
   * **Validates: Requirements 8.2, 11.2**
   *
   * For any order where (currentDebt + orderAmount) > creditLimit,
   * the order creation SHALL be blocked.
   */
  describe("Property 21: Credit Limit Enforcement", () => {
    it("should block orders that exceed credit limit", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          positiveAmountArb,
          positiveAmountArb,
          async (creditLimit, currentDebt, orderAmount) => {
            // Ensure currentDebt is within limit but order would exceed
            fc.pre(currentDebt <= creditLimit);
            fc.pre(currentDebt + orderAmount > creditLimit);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();

            // Create customer credit record
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt,
              overdueAmount: 0,
            });

            // Check credit availability
            const result = await debtService.checkCreditAvailability(
              customerId,
              orderAmount
            );

            // Should be blocked
            expect(result.allowed).toBe(false);
            expect(result.currentDebt).toBe(currentDebt);
            expect(result.creditLimit).toBe(creditLimit);
            expect(result.orderAmount).toBe(orderAmount);
            expect(result.shortfall).toBeDefined();
            expect(result.shortfall).toBe(
              currentDebt + orderAmount - creditLimit
            );
            expect(result.message).toContain("Vượt hạn mức tín dụng");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should allow orders within credit limit", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          positiveAmountArb,
          positiveAmountArb,
          async (creditLimit, currentDebt, orderAmount) => {
            // Ensure order is within limit
            fc.pre(currentDebt < creditLimit);
            fc.pre(currentDebt + orderAmount <= creditLimit);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();

            // Create customer credit record
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt,
              overdueAmount: 0,
            });

            // Check credit availability
            const result = await debtService.checkCreditAvailability(
              customerId,
              orderAmount
            );

            // Should be allowed
            expect(result.allowed).toBe(true);
            expect(result.currentDebt).toBe(currentDebt);
            expect(result.creditLimit).toBe(creditLimit);
            expect(result.orderAmount).toBe(orderAmount);
            expect(result.shortfall).toBeUndefined();
            expect(result.message).toContain("Đủ hạn mức tín dụng");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should block orders for blocked customers", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          positiveAmountArb,
          async (creditLimit, orderAmount) => {
            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();

            // Create blocked customer
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt: 0,
              overdueAmount: 0,
              isBlocked: true,
              blockReason: "Test block",
            });

            // Check credit availability
            const result = await debtService.checkCreditAvailability(
              customerId,
              orderAmount
            );

            // Should be blocked
            expect(result.allowed).toBe(false);
            expect(result.message).toContain("đã bị chặn");
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 22: Credit Block Message Completeness**
   * **Validates: Requirements 8.3, 11.3**
   *
   * For any blocked order due to credit limit, the message SHALL display
   * currentDebt, creditLimit, and shortfall amount.
   */
  describe("Property 22: Credit Block Message Completeness", () => {
    it("should include all required information in block message", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          positiveAmountArb,
          positiveAmountArb,
          async (creditLimit, currentDebt, orderAmount) => {
            // Ensure order exceeds limit
            fc.pre(currentDebt <= creditLimit);
            fc.pre(currentDebt + orderAmount > creditLimit);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();

            // Create customer credit record
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt,
              overdueAmount: 0,
            });

            // Check credit availability
            const result = await debtService.checkCreditAvailability(
              customerId,
              orderAmount
            );

            // Verify message contains all required information
            expect(result.allowed).toBe(false);
            expect(result.message).toBeDefined();

            // Message should contain current debt
            expect(result.message).toContain(
              currentDebt.toLocaleString("vi-VN")
            );

            // Message should contain credit limit
            expect(result.message).toContain(
              creditLimit.toLocaleString("vi-VN")
            );

            // Message should contain shortfall
            const shortfall = currentDebt + orderAmount - creditLimit;
            expect(result.message).toContain(shortfall.toLocaleString("vi-VN"));

            // Verify shortfall field matches
            expect(result.shortfall).toBe(shortfall);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 21: Credit Limit Enforcement with Concurrency**
   * **Validates: Requirements 8.2, 11.2**
   *
   * Test concurrent order creation scenarios to verify no race conditions
   * allow credit limit breach.
   *
   * For any set of concurrent orders, the total reserved credit SHALL NOT
   * exceed the credit limit, even under race conditions.
   */
  describe("Property 21: Credit Limit Enforcement with Concurrency", () => {
    it("should prevent concurrent orders from exceeding credit limit", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          fc.integer({ min: 2, max: 5 }),
          fc.integer({ min: 1000, max: 50000000 }),
          async (creditLimit, numOrders, orderAmount) => {
            // Ensure at least one order would exceed the limit
            fc.pre(numOrders * orderAmount > creditLimit);
            // Ensure at least one order can fit
            fc.pre(orderAmount <= creditLimit);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();

            // Create customer credit record
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt: 0,
              overdueAmount: 0,
            });

            // Create concurrent order checks with reservation
            const orderPromises = Array.from({ length: numOrders }, () =>
              debtService.checkCreditAvailability(customerId, orderAmount, {
                reserveCredit: true,
                orderId: new Types.ObjectId().toString(),
                userId,
              })
            );

            // Execute all checks concurrently
            const results = await Promise.all(orderPromises);

            // Count allowed and blocked orders
            const allowedCount = results.filter((r) => r.allowed).length;
            const blockedCount = results.filter((r) => !r.allowed).length;

            // Verify total allowed orders don't exceed credit limit
            const totalReserved = allowedCount * orderAmount;
            expect(totalReserved).toBeLessThanOrEqual(creditLimit);

            // Verify at least one order was blocked (since total exceeds limit)
            expect(blockedCount).toBeGreaterThan(0);

            // Verify all results sum to total orders
            expect(allowedCount + blockedCount).toBe(numOrders);

            // Verify final debt matches allowed orders
            const finalCredit = await CustomerCredit.findOne({
              customerId: new Types.ObjectId(customerId),
            });

            expect(finalCredit).toBeDefined();
            expect(finalCredit!.currentDebt).toBe(totalReserved);
            expect(finalCredit!.currentDebt).toBeLessThanOrEqual(creditLimit);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle concurrent orders with existing debt", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          positiveAmountArb,
          fc.integer({ min: 2, max: 4 }),
          fc.integer({ min: 1000, max: 20000000 }),
          async (creditLimit, existingDebt, numOrders, orderAmount) => {
            // Ensure existing debt is within limit
            fc.pre(existingDebt < creditLimit);
            // Ensure at least one order can fit with existing debt
            fc.pre(existingDebt + orderAmount <= creditLimit);
            // Ensure all orders together would exceed limit
            fc.pre(existingDebt + numOrders * orderAmount > creditLimit);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();

            // Create customer credit record with existing debt
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt: existingDebt,
              overdueAmount: 0,
            });

            // Create concurrent order checks with reservation
            const orderPromises = Array.from({ length: numOrders }, () =>
              debtService.checkCreditAvailability(customerId, orderAmount, {
                reserveCredit: true,
                orderId: new Types.ObjectId().toString(),
                userId,
              })
            );

            // Execute all checks concurrently
            const results = await Promise.all(orderPromises);

            // Count allowed and blocked orders
            const allowedCount = results.filter((r) => r.allowed).length;

            // Verify total debt doesn't exceed credit limit
            const totalReserved = allowedCount * orderAmount;
            const finalDebt = existingDebt + totalReserved;
            expect(finalDebt).toBeLessThanOrEqual(creditLimit);

            // Verify final debt in database
            const finalCredit = await CustomerCredit.findOne({
              customerId: new Types.ObjectId(customerId),
            });

            expect(finalCredit).toBeDefined();
            expect(finalCredit!.currentDebt).toBe(finalDebt);
            expect(finalCredit!.currentDebt).toBeLessThanOrEqual(creditLimit);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle varying order amounts concurrently", async () => {
      await fc.assert(
        fc.asyncProperty(
          positiveAmountArb,
          fc.array(fc.integer({ min: 1000, max: 10000000 }), {
            minLength: 2,
            maxLength: 5,
          }),
          async (creditLimit, orderAmounts) => {
            // Ensure total of all orders exceeds limit
            const totalAmount = orderAmounts.reduce((sum, amt) => sum + amt, 0);
            fc.pre(totalAmount > creditLimit);
            // Ensure at least one order can fit
            fc.pre(Math.min(...orderAmounts) <= creditLimit);

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();

            // Create customer credit record
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt: 0,
              overdueAmount: 0,
            });

            // Create concurrent order checks with different amounts
            const orderPromises = orderAmounts.map((amount) =>
              debtService.checkCreditAvailability(customerId, amount, {
                reserveCredit: true,
                orderId: new Types.ObjectId().toString(),
                userId,
              })
            );

            // Execute all checks concurrently
            const results = await Promise.all(orderPromises);

            // Calculate total reserved
            let totalReserved = 0;
            for (let i = 0; i < results.length; i++) {
              if (results[i].allowed) {
                totalReserved += orderAmounts[i];
              }
            }

            // Verify total reserved doesn't exceed credit limit
            expect(totalReserved).toBeLessThanOrEqual(creditLimit);

            // Verify final debt matches
            const finalCredit = await CustomerCredit.findOne({
              customerId: new Types.ObjectId(customerId),
            });

            expect(finalCredit).toBeDefined();
            expect(finalCredit!.currentDebt).toBe(totalReserved);
            expect(finalCredit!.currentDebt).toBeLessThanOrEqual(creditLimit);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain consistency under high concurrency", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10000000, max: 50000000 }),
          fc.integer({ min: 5, max: 10 }),
          async (creditLimit, numOrders) => {
            // Calculate order amount that would allow some but not all orders
            const orderAmount = Math.floor(creditLimit / (numOrders - 2));

            // Generate unique customer ID for each test run
            const customerId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();

            // Create customer credit record
            await CustomerCredit.create({
              customerId: new Types.ObjectId(customerId),
              creditLimit,
              currentDebt: 0,
              overdueAmount: 0,
            });

            // Create many concurrent order checks
            const orderPromises = Array.from({ length: numOrders }, () =>
              debtService.checkCreditAvailability(customerId, orderAmount, {
                reserveCredit: true,
                orderId: new Types.ObjectId().toString(),
                userId,
              })
            );

            // Execute all checks concurrently
            const results = await Promise.all(orderPromises);

            // Count allowed orders
            const allowedCount = results.filter((r) => r.allowed).length;
            const totalReserved = allowedCount * orderAmount;

            // Verify no credit limit breach
            expect(totalReserved).toBeLessThanOrEqual(creditLimit);

            // Verify consistency: final debt should match allowed orders
            const finalCredit = await CustomerCredit.findOne({
              customerId: new Types.ObjectId(customerId),
            });

            expect(finalCredit).toBeDefined();
            expect(finalCredit!.currentDebt).toBe(totalReserved);

            // Verify ledger consistency
            const ledgerDebt = await DebtLedger.calculateCustomerDebt(
              new Types.ObjectId(customerId)
            );
            expect(Math.max(0, ledgerDebt)).toBe(totalReserved);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
