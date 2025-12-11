/**
 * Property-Based Tests for Order Completion Logic
 *
 * Tests correctness properties for order completion when all recipients have check-ins.
 *
 * **Feature: delivery-checkin-system, Property 36: Order Completion Logic**
 * **Validates: Requirements 10.4**
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { OrderStatusIntegrationService } from "../order-status-integration.service.js";

describe("Order Completion Logic - Property-Based Tests", () => {
  let orderStatusService;

  beforeAll(() => {
    orderStatusService = new OrderStatusIntegrationService();
  });

  /**
   * **Feature: delivery-checkin-system, Property 36: Order Completion Logic**
   * **Validates: Requirements 10.4**
   *
   * Property: For any order where all recipients have check-ins, the order status
   * SHALL be marked as "completed".
   */
  describe("Property 36: Order Completion Logic", () => {
    // Arbitrary generator for valid check-in data
    const checkinArb = (isDeleted = false) =>
      fc.record({
        _id: fc.constant(new mongoose.Types.ObjectId()),
        orderId: fc.constant(new mongoose.Types.ObjectId()),
        checkinAt: fc.date({
          min: new Date("2024-01-01"),
          max: new Date("2025-12-31"),
        }),
        shipperId: fc.constant(new mongoose.Types.ObjectId()),
        shipperName: fc.string({ minLength: 2, maxLength: 50 }),
        isDeleted: fc.constant(isDeleted),
      });

    // Arbitrary generator for order data with multiple recipients
    const orderArb = fc.integer({ min: 1, max: 20 }).chain((totalRecipients) =>
      fc.record({
        _id: fc.constant(new mongoose.Types.ObjectId()),
        orderNumber: fc.stringMatching(/^ORD-[0-9]{6}$/),
        status: fc.constantFrom("processing", "shipped", "delivered"),
        totalRecipients: fc.constant(totalRecipients),
        statusHistory: fc.constant([]),
      })
    );

    it("should return true when all recipients have check-ins", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 20 }),
          async (totalRecipients) => {
            // Arrange: Create order with N recipients
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: "delivered",
              totalRecipients: totalRecipients,
              statusHistory: [],
            };

            // Create exactly N check-ins (one per recipient)
            const checkins = Array.from({ length: totalRecipients }, () => ({
              _id: new mongoose.Types.ObjectId(),
              orderId: order._id,
              checkinAt: new Date(),
              shipperId: new mongoose.Types.ObjectId(),
              shipperName: "Test Shipper",
              isDeleted: false,
            }));

            // Act: Check if order is complete
            const isComplete = orderStatusService.checkOrderCompletion(
              order,
              checkins
            );

            // Assert: Order MUST be marked as complete when all recipients have check-ins
            expect(isComplete).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return false when not all recipients have check-ins", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 20 }),
          async (totalRecipients) => {
            // Arrange: Create order with N recipients
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: "delivered",
              totalRecipients: totalRecipients,
              statusHistory: [],
            };

            // Create fewer check-ins than recipients (N-1)
            const checkins = Array.from(
              { length: totalRecipients - 1 },
              () => ({
                _id: new mongoose.Types.ObjectId(),
                orderId: order._id,
                checkinAt: new Date(),
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper",
                isDeleted: false,
              })
            );

            // Act: Check if order is complete
            const isComplete = orderStatusService.checkOrderCompletion(
              order,
              checkins
            );

            // Assert: Order MUST NOT be complete when not all recipients have check-ins
            expect(isComplete).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should exclude deleted check-ins from completion count", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 1, max: 5 }),
          async (totalRecipients, deletedCount) => {
            // Ensure deletedCount doesn't exceed totalRecipients
            const actualDeletedCount = Math.min(
              deletedCount,
              totalRecipients - 1
            );

            // Arrange: Create order with N recipients
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: "delivered",
              totalRecipients: totalRecipients,
              statusHistory: [],
            };

            // Create check-ins where some are deleted
            const activeCheckins = totalRecipients - actualDeletedCount;
            const checkins = [
              // Active check-ins
              ...Array.from({ length: activeCheckins }, () => ({
                _id: new mongoose.Types.ObjectId(),
                orderId: order._id,
                checkinAt: new Date(),
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper",
                isDeleted: false,
              })),
              // Deleted check-ins
              ...Array.from({ length: actualDeletedCount }, () => ({
                _id: new mongoose.Types.ObjectId(),
                orderId: order._id,
                checkinAt: new Date(),
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper",
                isDeleted: true,
              })),
            ];

            // Act: Check if order is complete
            const isComplete = orderStatusService.checkOrderCompletion(
              order,
              checkins
            );

            // Assert: Deleted check-ins should NOT count toward completion
            // Only active check-ins count, so if activeCheckins < totalRecipients, not complete
            expect(isComplete).toBe(activeCheckins >= totalRecipients);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should mark order as completed when checkOrderCompletion returns true", async () => {
      await fc.assert(
        fc.asyncProperty(orderArb, async (orderData) => {
          // Arrange: Create order that will be marked as completed
          const order = { ...orderData };

          // Act: Mark order as completed
          const completedOrder = await orderStatusService.markOrderAsCompleted(
            order
          );

          // Assert: Order status MUST be "completed"
          expect(completedOrder.status).toBe(
            OrderStatusIntegrationService.ORDER_STATUS.COMPLETED
          );

          // Assert: completedAt timestamp MUST be set
          expect(completedOrder.completedAt).toBeDefined();
          expect(completedOrder.completedAt).toBeInstanceOf(Date);

          // Assert: statusUpdatedAt MUST be set
          expect(completedOrder.statusUpdatedAt).toBeDefined();
          expect(completedOrder.statusUpdatedAt).toBeInstanceOf(Date);
        }),
        { numRuns: 100 }
      );
    });

    it("should add completion entry to status history", async () => {
      await fc.assert(
        fc.asyncProperty(orderArb, async (orderData) => {
          // Arrange: Ensure statusHistory is an array
          const order = {
            ...orderData,
            statusHistory: [],
          };
          const initialHistoryLength = order.statusHistory.length;

          // Act: Mark order as completed
          const completedOrder = await orderStatusService.markOrderAsCompleted(
            order
          );

          // Assert: Status history should have one more entry
          expect(completedOrder.statusHistory.length).toBe(
            initialHistoryLength + 1
          );

          // Assert: Latest entry should be "completed"
          const latestEntry =
            completedOrder.statusHistory[
              completedOrder.statusHistory.length - 1
            ];
          expect(latestEntry.status).toBe(
            OrderStatusIntegrationService.ORDER_STATUS.COMPLETED
          );
          expect(latestEntry.timestamp).toBeInstanceOf(Date);
          expect(latestEntry.note).toContain("completed");
        }),
        { numRuns: 100 }
      );
    });

    it("should handle single recipient orders correctly", async () => {
      await fc.assert(
        fc.asyncProperty(checkinArb(false), async (checkinData) => {
          // Arrange: Single recipient order
          const order = {
            _id: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-123456",
            status: "delivered",
            totalRecipients: 1,
            statusHistory: [],
          };

          const checkins = [{ ...checkinData, orderId: order._id }];

          // Act: Check if order is complete
          const isComplete = orderStatusService.checkOrderCompletion(
            order,
            checkins
          );

          // Assert: Single recipient with one check-in MUST be complete
          expect(isComplete).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should handle orders with more check-ins than recipients", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 5 }),
          async (totalRecipients, extraCheckins) => {
            // Arrange: Create order with N recipients
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: "delivered",
              totalRecipients: totalRecipients,
              statusHistory: [],
            };

            // Create more check-ins than recipients
            const checkins = Array.from(
              { length: totalRecipients + extraCheckins },
              () => ({
                _id: new mongoose.Types.ObjectId(),
                orderId: order._id,
                checkinAt: new Date(),
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper",
                isDeleted: false,
              })
            );

            // Act: Check if order is complete
            const isComplete = orderStatusService.checkOrderCompletion(
              order,
              checkins
            );

            // Assert: Order with more check-ins than recipients MUST be complete
            expect(isComplete).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return false for null or undefined inputs", () => {
      // Test null order
      expect(orderStatusService.checkOrderCompletion(null, [])).toBe(false);

      // Test undefined order
      expect(orderStatusService.checkOrderCompletion(undefined, [])).toBe(
        false
      );

      // Test null checkins
      const order = {
        _id: new mongoose.Types.ObjectId(),
        totalRecipients: 1,
      };
      expect(orderStatusService.checkOrderCompletion(order, null)).toBe(false);

      // Test undefined checkins
      expect(orderStatusService.checkOrderCompletion(order, undefined)).toBe(
        false
      );
    });

    it("should default to 1 recipient when totalRecipients is not set", async () => {
      await fc.assert(
        fc.asyncProperty(checkinArb(false), async (checkinData) => {
          // Arrange: Order without totalRecipients field
          const order = {
            _id: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-123456",
            status: "delivered",
            statusHistory: [],
            // totalRecipients is not set
          };

          const checkins = [{ ...checkinData, orderId: order._id }];

          // Act: Check if order is complete
          const isComplete = orderStatusService.checkOrderCompletion(
            order,
            checkins
          );

          // Assert: Should default to 1 recipient and be complete with 1 check-in
          expect(isComplete).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve order ID and other fields when marking as completed", async () => {
      await fc.assert(
        fc.asyncProperty(orderArb, async (orderData) => {
          // Arrange
          const order = { ...orderData };
          const originalId = order._id;
          const originalOrderNumber = order.orderNumber;
          const originalTotalRecipients = order.totalRecipients;

          // Act
          const completedOrder = await orderStatusService.markOrderAsCompleted(
            order
          );

          // Assert: Immutable fields MUST be preserved
          expect(completedOrder._id).toEqual(originalId);
          expect(completedOrder.orderNumber).toBe(originalOrderNumber);
          expect(completedOrder.totalRecipients).toBe(originalTotalRecipients);
        }),
        { numRuns: 100 }
      );
    });
  });
});
