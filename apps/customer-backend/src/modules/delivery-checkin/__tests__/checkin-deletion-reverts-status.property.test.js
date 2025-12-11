/**
 * Property-Based Tests for Check-in Deletion Reverts Status
 *
 * Tests correctness properties for order status reversion when delivery check-ins are deleted.
 *
 * **Feature: delivery-checkin-system, Property 37: Check-in Deletion Reverts Status**
 * **Validates: Requirements 10.5**
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { OrderStatusIntegrationService } from "../order-status-integration.service.js";

describe("Check-in Deletion Reverts Status - Property-Based Tests", () => {
  let orderStatusService;

  beforeAll(() => {
    orderStatusService = new OrderStatusIntegrationService();
  });

  /**
   * **Feature: delivery-checkin-system, Property 37: Check-in Deletion Reverts Status**
   * **Validates: Requirements 10.5**
   *
   * Property: For any deleted check-in, if it was the only check-in for the order,
   * the order status SHALL be reverted from "delivered".
   */
  describe("Property 37: Check-in Deletion Reverts Status", () => {
    // Arbitrary generator for valid previous statuses (before delivery)
    const validPreviousStatusArb = fc.constantFrom(
      "processing",
      "shipped",
      "kitting",
      "paid"
    );

    // Arbitrary generator for order data in delivered state
    const deliveredOrderArb = fc.record({
      _id: fc.constant(new mongoose.Types.ObjectId()),
      orderNumber: fc.stringMatching(/^ORD-[0-9]{6}$/),
      status: fc.constant(OrderStatusIntegrationService.ORDER_STATUS.DELIVERED),
      deliveredAt: fc.date({
        min: new Date("2024-01-01"),
        max: new Date("2025-12-31"),
      }),
      totalRecipients: fc.integer({ min: 1, max: 10 }),
      statusHistory: fc.constant([]),
      statusUpdatedAt: fc.date({
        min: new Date("2024-01-01"),
        max: new Date("2025-12-31"),
      }),
    });

    it("should revert order status from 'delivered' to previous status when check-in is deleted", async () => {
      await fc.assert(
        fc.asyncProperty(
          deliveredOrderArb,
          validPreviousStatusArb,
          async (orderData, previousStatus) => {
            // Arrange: Create a delivered order
            const order = { ...orderData };

            // Act: Revert order status on check-in deletion
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                order,
                previousStatus
              );

            // Assert: Order status MUST be reverted to previous status
            expect(revertedOrder.status).toBe(previousStatus);

            // Assert: deliveredAt MUST be cleared
            expect(revertedOrder.deliveredAt).toBeNull();

            // Assert: statusUpdatedAt MUST be updated
            expect(revertedOrder.statusUpdatedAt).toBeDefined();
            expect(revertedOrder.statusUpdatedAt).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should default to 'shipped' status when no previous status is provided", async () => {
      await fc.assert(
        fc.asyncProperty(deliveredOrderArb, async (orderData) => {
          // Arrange: Create a delivered order
          const order = { ...orderData };

          // Act: Revert order status without specifying previous status
          const revertedOrder =
            await orderStatusService.revertOrderStatusOnCheckinDeletion(order);

          // Assert: Order status MUST default to "shipped"
          expect(revertedOrder.status).toBe("shipped");

          // Assert: deliveredAt MUST be cleared
          expect(revertedOrder.deliveredAt).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve order ID and other immutable fields after status reversion", async () => {
      await fc.assert(
        fc.asyncProperty(
          deliveredOrderArb,
          validPreviousStatusArb,
          async (orderData, previousStatus) => {
            // Arrange
            const order = { ...orderData };
            const originalId = order._id;
            const originalOrderNumber = order.orderNumber;
            const originalTotalRecipients = order.totalRecipients;

            // Act
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                order,
                previousStatus
              );

            // Assert: Immutable fields MUST be preserved
            expect(revertedOrder._id).toEqual(originalId);
            expect(revertedOrder.orderNumber).toBe(originalOrderNumber);
            expect(revertedOrder.totalRecipients).toBe(originalTotalRecipients);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should add status reversion entry to history when statusHistory array exists", async () => {
      await fc.assert(
        fc.asyncProperty(
          deliveredOrderArb,
          validPreviousStatusArb,
          async (orderData, previousStatus) => {
            // Arrange: Ensure statusHistory is an array
            const order = {
              ...orderData,
              statusHistory: [],
            };
            const initialHistoryLength = order.statusHistory.length;

            // Act
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                order,
                previousStatus
              );

            // Assert: Status history should have one more entry
            expect(revertedOrder.statusHistory.length).toBe(
              initialHistoryLength + 1
            );

            // Assert: Latest entry should be the reverted status
            const latestEntry =
              revertedOrder.statusHistory[
                revertedOrder.statusHistory.length - 1
              ];
            expect(latestEntry.status).toBe(previousStatus);
            expect(latestEntry.timestamp).toBeInstanceOf(Date);
            expect(latestEntry.note).toContain("reverted");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle all valid previous statuses correctly", async () => {
      // Test all possible previous statuses
      const allPreviousStatuses = ["processing", "shipped", "kitting", "paid"];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...allPreviousStatuses),
          async (previousStatus) => {
            // Arrange: Create a delivered order
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: OrderStatusIntegrationService.ORDER_STATUS.DELIVERED,
              deliveredAt: new Date(),
              totalRecipients: 1,
              statusHistory: [],
            };

            // Act
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                order,
                previousStatus
              );

            // Assert: Status MUST be reverted to the specified previous status
            expect(revertedOrder.status).toBe(previousStatus);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should clear deliveredAt timestamp when reverting status", async () => {
      await fc.assert(
        fc.asyncProperty(
          deliveredOrderArb,
          validPreviousStatusArb,
          async (orderData, previousStatus) => {
            // Arrange: Ensure deliveredAt is set
            const order = {
              ...orderData,
              deliveredAt: new Date(),
            };

            // Verify deliveredAt is set before reversion
            expect(order.deliveredAt).toBeDefined();
            expect(order.deliveredAt).toBeInstanceOf(Date);

            // Act
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                order,
                previousStatus
              );

            // Assert: deliveredAt MUST be null after reversion
            expect(revertedOrder.deliveredAt).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should update statusUpdatedAt to current time when reverting", async () => {
      await fc.assert(
        fc.asyncProperty(
          deliveredOrderArb,
          validPreviousStatusArb,
          async (orderData, previousStatus) => {
            // Arrange
            const order = { ...orderData };
            const beforeReversion = new Date();

            // Act
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                order,
                previousStatus
              );

            const afterReversion = new Date();

            // Assert: statusUpdatedAt should be between before and after timestamps
            expect(
              revertedOrder.statusUpdatedAt.getTime()
            ).toBeGreaterThanOrEqual(beforeReversion.getTime());
            expect(revertedOrder.statusUpdatedAt.getTime()).toBeLessThanOrEqual(
              afterReversion.getTime()
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle orders without statusHistory array gracefully", async () => {
      await fc.assert(
        fc.asyncProperty(validPreviousStatusArb, async (previousStatus) => {
          // Arrange: Order without statusHistory
          const order = {
            _id: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-123456",
            status: OrderStatusIntegrationService.ORDER_STATUS.DELIVERED,
            deliveredAt: new Date(),
            totalRecipients: 1,
            // statusHistory is not defined
          };

          // Act: Should not throw error
          const revertedOrder =
            await orderStatusService.revertOrderStatusOnCheckinDeletion(
              order,
              previousStatus
            );

          // Assert: Status should still be reverted
          expect(revertedOrder.status).toBe(previousStatus);
          expect(revertedOrder.deliveredAt).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it("should be inverse of updateOrderStatusOnCheckin for single check-in orders", async () => {
      await fc.assert(
        fc.asyncProperty(
          validPreviousStatusArb,
          fc.date({
            min: new Date("2024-01-01"),
            max: new Date("2025-12-31"),
          }),
          async (initialStatus, checkinDate) => {
            // Arrange: Create order with initial status
            const order = {
              _id: new mongoose.Types.ObjectId(),
              orderNumber: "ORD-123456",
              status: initialStatus,
              totalRecipients: 1,
              statusHistory: [],
            };

            const checkin = {
              _id: new mongoose.Types.ObjectId(),
              checkinAt: checkinDate,
              shipperId: new mongoose.Types.ObjectId(),
              shipperName: "Test Shipper",
            };

            // Act: Update status on check-in
            const deliveredOrder =
              await orderStatusService.updateOrderStatusOnCheckin(
                order,
                checkin
              );

            // Verify order is now delivered
            expect(deliveredOrder.status).toBe(
              OrderStatusIntegrationService.ORDER_STATUS.DELIVERED
            );

            // Act: Revert status on check-in deletion
            const revertedOrder =
              await orderStatusService.revertOrderStatusOnCheckinDeletion(
                deliveredOrder,
                initialStatus
              );

            // Assert: Status should be back to initial status
            expect(revertedOrder.status).toBe(initialStatus);

            // Assert: deliveredAt should be cleared
            expect(revertedOrder.deliveredAt).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should throw NotFoundException when order is null", async () => {
      await expect(
        orderStatusService.revertOrderStatusOnCheckinDeletion(null, "shipped")
      ).rejects.toThrow();
    });

    it("should throw NotFoundException when order is undefined", async () => {
      await expect(
        orderStatusService.revertOrderStatusOnCheckinDeletion(
          undefined,
          "shipped"
        )
      ).rejects.toThrow();
    });
  });
});
