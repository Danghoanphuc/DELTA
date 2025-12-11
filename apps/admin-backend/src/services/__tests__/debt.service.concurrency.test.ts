/**
 * Concurrency Tests for DebtService
 *
 * Tests that transaction support prevents race conditions
 * when checking credit availability
 *
 * Requirements: 8.2, 8.3
 */

import mongoose, { Types } from "mongoose";
import { DebtService } from "../debt.service.js";
import { CustomerCredit } from "../../models/customer-credit.model.js";
import { DebtLedger } from "../../models/debt-ledger.model.js";

let debtService: DebtService;

beforeAll(async () => {
  debtService = new DebtService();
});

describe("DebtService Concurrency Tests", () => {
  /**
   * Test that concurrent credit checks with reservation prevent exceeding credit limit
   * Requirements: 8.2, 8.3
   */
  describe("Concurrent Credit Check with Reservation", () => {
    it("should prevent concurrent orders from exceeding credit limit", async () => {
      // Create customer with credit limit
      const customerId = new Types.ObjectId().toString();
      const creditLimit = 10000;
      const orderAmount = 6000; // Two orders would exceed limit (12000 > 10000)

      await CustomerCredit.create({
        customerId: new Types.ObjectId(customerId),
        creditLimit,
        currentDebt: 0,
        overdueAmount: 0,
      });

      // Simulate two concurrent order creations
      const userId = new Types.ObjectId().toString();
      const orderId1 = new Types.ObjectId().toString();
      const orderId2 = new Types.ObjectId().toString();

      const results = await Promise.all([
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: true,
          orderId: orderId1,
          userId,
        }),
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: true,
          orderId: orderId2,
          userId,
        }),
      ]);

      // Exactly one should succeed, one should fail
      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBe(1);
      expect(blockedCount).toBe(1);

      // Verify final debt does not exceed credit limit
      const finalCredit = await CustomerCredit.findOne({
        customerId: new Types.ObjectId(customerId),
      });

      expect(finalCredit).toBeDefined();
      expect(finalCredit!.currentDebt).toBeLessThanOrEqual(creditLimit);
      expect(finalCredit!.currentDebt).toBe(orderAmount); // Only one order should be reserved
    });

    it("should handle multiple concurrent checks correctly", async () => {
      // Create customer with credit limit
      const customerId = new Types.ObjectId().toString();
      const creditLimit = 20000;
      const orderAmount = 5000; // Four orders would total 20000 (at limit)

      await CustomerCredit.create({
        customerId: new Types.ObjectId(customerId),
        creditLimit,
        currentDebt: 0,
        overdueAmount: 0,
      });

      // Simulate five concurrent order creations (one should fail)
      const userId = new Types.ObjectId().toString();
      const promises = Array.from({ length: 5 }, (_, i) =>
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: true,
          orderId: new Types.ObjectId().toString(),
          userId,
        })
      );

      const results = await Promise.all(promises);

      // Count allowed and blocked
      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      // At most 4 should succeed (4 * 5000 = 20000)
      expect(allowedCount).toBeLessThanOrEqual(4);
      expect(allowedCount + blockedCount).toBe(5);

      // Verify final debt does not exceed credit limit
      const finalCredit = await CustomerCredit.findOne({
        customerId: new Types.ObjectId(customerId),
      });

      expect(finalCredit).toBeDefined();
      expect(finalCredit!.currentDebt).toBeLessThanOrEqual(creditLimit);
      expect(finalCredit!.currentDebt).toBe(allowedCount * orderAmount);
    });

    it("should work correctly without reservation", async () => {
      // Create customer with credit limit
      const customerId = new Types.ObjectId().toString();
      const creditLimit = 10000;
      const orderAmount = 6000;

      await CustomerCredit.create({
        customerId: new Types.ObjectId(customerId),
        creditLimit,
        currentDebt: 0,
        overdueAmount: 0,
      });

      // Check without reservation (should not modify debt)
      const results = await Promise.all([
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: false,
        }),
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: false,
        }),
      ]);

      // Both should succeed since we're not reserving
      expect(results[0].allowed).toBe(true);
      expect(results[1].allowed).toBe(true);

      // Verify debt is still 0
      const finalCredit = await CustomerCredit.findOne({
        customerId: new Types.ObjectId(customerId),
      });

      expect(finalCredit).toBeDefined();
      expect(finalCredit!.currentDebt).toBe(0);
    });

    it("should handle race condition with existing debt", async () => {
      // Create customer with existing debt
      const customerId = new Types.ObjectId().toString();
      const creditLimit = 10000;
      const existingDebt = 4000;
      const orderAmount = 4000; // Two orders would exceed (4000 + 4000 + 4000 = 12000 > 10000)

      await CustomerCredit.create({
        customerId: new Types.ObjectId(customerId),
        creditLimit,
        currentDebt: existingDebt,
        overdueAmount: 0,
      });

      // Simulate two concurrent order creations
      const userId = new Types.ObjectId().toString();
      const orderId1 = new Types.ObjectId().toString();
      const orderId2 = new Types.ObjectId().toString();

      const results = await Promise.all([
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: true,
          orderId: orderId1,
          userId,
        }),
        debtService.checkCreditAvailability(customerId, orderAmount, {
          reserveCredit: true,
          orderId: orderId2,
          userId,
        }),
      ]);

      // Exactly one should succeed
      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBe(1);
      expect(blockedCount).toBe(1);

      // Verify final debt
      const finalCredit = await CustomerCredit.findOne({
        customerId: new Types.ObjectId(customerId),
      });

      expect(finalCredit).toBeDefined();
      expect(finalCredit!.currentDebt).toBeLessThanOrEqual(creditLimit);
      expect(finalCredit!.currentDebt).toBe(existingDebt + orderAmount);
    });

    it("should rollback on transaction failure", async () => {
      // Create customer
      const customerId = new Types.ObjectId().toString();
      const creditLimit = 10000;

      await CustomerCredit.create({
        customerId: new Types.ObjectId(customerId),
        creditLimit,
        currentDebt: 0,
        overdueAmount: 0,
      });

      // Try to check with invalid user ID (should fail)
      const invalidUserId = "invalid-id";
      const orderId = new Types.ObjectId().toString();

      await expect(
        debtService.checkCreditAvailability(customerId, 5000, {
          reserveCredit: true,
          orderId,
          userId: invalidUserId,
        })
      ).rejects.toThrow();

      // Verify debt is still 0 (transaction rolled back)
      const finalCredit = await CustomerCredit.findOne({
        customerId: new Types.ObjectId(customerId),
      });

      expect(finalCredit).toBeDefined();
      expect(finalCredit!.currentDebt).toBe(0);
    });
  });

  /**
   * Test that transaction locking prevents dirty reads
   */
  describe("Transaction Locking", () => {
    it("should prevent dirty reads during credit check", async () => {
      // Create customer
      const customerId = new Types.ObjectId().toString();
      const creditLimit = 10000;

      await CustomerCredit.create({
        customerId: new Types.ObjectId(customerId),
        creditLimit,
        currentDebt: 0,
        overdueAmount: 0,
      });

      const userId = new Types.ObjectId().toString();

      // Start first check with reservation (will lock the record)
      const check1Promise = debtService.checkCreditAvailability(
        customerId,
        5000,
        {
          reserveCredit: true,
          orderId: new Types.ObjectId().toString(),
          userId,
        }
      );

      // Immediately start second check (should wait for lock)
      const check2Promise = debtService.checkCreditAvailability(
        customerId,
        5000,
        {
          reserveCredit: true,
          orderId: new Types.ObjectId().toString(),
          userId,
        }
      );

      const [result1, result2] = await Promise.all([
        check1Promise,
        check2Promise,
      ]);

      // Both should succeed since total is within limit
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);

      // Verify final debt
      const finalCredit = await CustomerCredit.findOne({
        customerId: new Types.ObjectId(customerId),
      });

      expect(finalCredit).toBeDefined();
      expect(finalCredit!.currentDebt).toBe(10000);
    });
  });
});
