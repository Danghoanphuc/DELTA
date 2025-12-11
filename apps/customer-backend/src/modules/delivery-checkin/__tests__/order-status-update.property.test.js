/**
 * Property-Based Tests for Order Status Update on Check-in
 *
 * Tests correctness properties for order status updates when delivery check-ins are created.
 *
 * **Feature: delivery-checkin-system, Property 33: Order Status Update on Check-in**
 * **Validates: Requirements 10.1**
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { OrderStatusIntegrationService } from "../order-status-integration.service.js";

describe("Order Status Update on Check-in - Property-Based Tests", () => {
  let orderStatusService;

  beforeAll(() => {
    orderStatusService = new OrderStatusIntegrationService();
  });

  /**
   * **Feature: delivery-checkin-system, Property 33: Order Status Update on Check-in**
   * **Validates: Requirements 10.1**
   *
   * Property: For any check-in created for an order, the order status SHALL be updated to "delivered".
   */
  describe("Property 33: Order Status Update on Check-in", () => {
    // Arbitrary generator for valid order statuses before delivery
    const validPreviousStatusArb = fc.constantFrom(
      "processing",
      "shipped",
      "kitting",
      "paid"
    );

    // Arbitrary generator for order data
    const orderArb = fc.record({
      _id: fc.constant(new mongoose.Types.ObjectId()),
      orderNumber: fc.stringMatching(/^ORD-[0-9]{6}$/),
      status: validPreviousStatusArb,
      totalRecipients: fc.integer({ min: 1, max: 10 }),
      statusHistory: fc.constant([]),
    });

    // Arbitrary generator for check-in data
    const checkinArb = fc.record({
      _id: fc.constant(new mongoose.Types.ObjectId()),
      checkinAt: fc.date({
        min: new Date("2024-01-01"),
        max: new Date("2025-12-31"),
      }),
      shipperId: fc.constant(new mongoose.Types.ObjectId()),
      shipperName: fc.string({ minLength: 2, maxLength: 50 }),
    });

    it("should update order status to 'delivered' for any valid check-in", async () => {
      await fc.assert(
        fc.asyncProperty(
          orderArb,
          checkinArb,
          async (orderData, checkinData) => {
            // Arrange: Create a mutable order object
            const order = { ...orderData };
            const previousStatus = order.status;

            // Act: Update order status on check-in
            const updatedOrder =
              await orderStatusService.updateOrderStatusOnCheckin(
                order,
                checkinData
              );

            // Assert: Order status MUST be "delivered"
            expect(updatedOrder.status).toBe(
              OrderStatusIntegrationService.ORDER_STATUS.DELIVERED
            );

            // Assert: deliveredAt timestamp MUST be set
            expect(updatedOrder.deliveredAt).toBeDefined();
            expect(updatedOrder.deliveredAt).toBeInstanceOf(Date);

            // Assert: statusUpdatedAt MUST be set
            expect(updatedOrder.statusUpdatedAt).toBeDefined();
            expect(updatedOrder.statusUpdatedAt).toBeInstanceOf(Date);

            // Assert: Previous status was different (unless already delivered)
            if (previousStatus !== "delivered") {
              expect(previousStatus).not.toBe(updatedOrder.status);
            }
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it("should preserve order ID and other immutable fields after status update", async () => {
      await fc.assert(
        fc.asyncProperty(
          orderArb,
          checkinArb,
          async (orderData, checkinData) => {
            // Arrange
            const order = { ...orderData };
            const originalId = order._id;
            const originalOrderNumber = order.orderNumber;
            const originalTotalRecipients = order.totalRecipients;

            // Act
            const updatedOrder =
              await orderStatusService.updateOrderStatusOnCheckin(
                order,
                checkinData
              );

            // Assert: Immutable fields MUST be preserved
            expect(updatedOrder._id).toEqual(originalId);
            expect(updatedOrder.orderNumber).toBe(originalOrderNumber);
            expect(updatedOrder.totalRecipients).toBe(originalTotalRecipients);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should use check-in timestamp as deliveredAt when provided", async () => {
      await fc.assert(
        fc.asyncProperty(
          orderArb,
          checkinArb,
          async (orderData, checkinData) => {
            // Arrange
            const order = { ...orderData };

            // Act
            const updatedOrder =
              await orderStatusService.updateOrderStatusOnCheckin(
                order,
                checkinData
              );

            // Assert: deliveredAt should match checkinAt
            expect(updatedOrder.deliveredAt.getTime()).toBe(
              checkinData.checkinAt.getTime()
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should add status change to history when statusHistory array exists", async () => {
      await fc.assert(
        fc.asyncProperty(
          orderArb,
          checkinArb,
          async (orderData, checkinData) => {
            // Arrange: Ensure statusHistory is an array
            const order = {
              ...orderData,
              statusHistory: [],
            };
            const initialHistoryLength = order.statusHistory.length;

            // Act
            const updatedOrder =
              await orderStatusService.updateOrderStatusOnCheckin(
                order,
                checkinData
              );

            // Assert: Status history should have one more entry
            expect(updatedOrder.statusHistory.length).toBe(
              initialHistoryLength + 1
            );

            // Assert: Latest entry should be "delivered"
            const latestEntry =
              updatedOrder.statusHistory[updatedOrder.statusHistory.length - 1];
            expect(latestEntry.status).toBe(
              OrderStatusIntegrationService.ORDER_STATUS.DELIVERED
            );
            expect(latestEntry.timestamp).toBeInstanceOf(Date);
            expect(latestEntry.checkinId).toEqual(checkinData._id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle orders with any valid previous status", async () => {
      // Test all possible previous statuses
      const allPreviousStatuses = ["processing", "shipped", "kitting", "paid"];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...allPreviousStatuses),
          checkinArb,
          async (previousStatus, checkinData) => {
            // Arrange
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: previousStatus,
              totalRecipients: 1,
              statusHistory: [],
            };

            // Act
            const updatedOrder =
              await orderStatusService.updateOrderStatusOnCheckin(
                order,
                checkinData
              );

            // Assert: Regardless of previous status, new status MUST be "delivered"
            expect(updatedOrder.status).toBe(
              OrderStatusIntegrationService.ORDER_STATUS.DELIVERED
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should be idempotent - updating already delivered order keeps delivered status", async () => {
      await fc.assert(
        fc.asyncProperty(checkinArb, async (checkinData) => {
          // Arrange: Order already in delivered status
          const order = {
            _id: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-123456",
            status: "delivered",
            deliveredAt: new Date("2024-06-01"),
            totalRecipients: 1,
            statusHistory: [],
          };

          // Act: Update again
          const updatedOrder =
            await orderStatusService.updateOrderStatusOnCheckin(
              order,
              checkinData
            );

          // Assert: Status remains "delivered"
          expect(updatedOrder.status).toBe(
            OrderStatusIntegrationService.ORDER_STATUS.DELIVERED
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should handle check-ins with various timestamp values", async () => {
      // Generate dates across a wide range
      const dateArb = fc.date({
        min: new Date("2020-01-01"),
        max: new Date("2030-12-31"),
      });

      await fc.assert(
        fc.asyncProperty(orderArb, dateArb, async (orderData, checkinDate) => {
          // Arrange
          const order = { ...orderData };
          const checkin = {
            _id: new mongoose.Types.ObjectId(),
            checkinAt: checkinDate,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: "Test Shipper",
          };

          // Act
          const updatedOrder =
            await orderStatusService.updateOrderStatusOnCheckin(order, checkin);

          // Assert: Status is delivered and timestamp is preserved
          expect(updatedOrder.status).toBe(
            OrderStatusIntegrationService.ORDER_STATUS.DELIVERED
          );
          expect(updatedOrder.deliveredAt.getTime()).toBe(
            checkinDate.getTime()
          );
        }),
        { numRuns: 100 }
      );
    });
  });
});
