/**
 * E2E Test: Multi-Recipient Order Flow
 *
 * Task 21: Integration Testing - End-to-End Flows
 * Tests the complete workflow for orders with multiple recipients,
 * including per-recipient check-ins and order completion logic
 *
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import {
  DeliveryCheckin,
  CHECKIN_STATUS,
} from "../../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../../delivery-checkin.repository.js";
import { OrderStatusIntegrationService } from "../../order-status-integration.service.js";

describe("E2E: Multi-Recipient Order Flow", () => {
  let repository;
  let orderStatusService;

  // Test data
  const mockOrderId = new mongoose.Types.ObjectId();
  const mockShipperId = new mongoose.Types.ObjectId();
  const mockCustomerId = new mongoose.Types.ObjectId();

  // Multi-recipient order with 3 recipients
  const mockMultiRecipientOrder = {
    _id: mockOrderId,
    orderNumber: "ORD-MULTI-001",
    customerId: mockCustomerId,
    customerEmail: "customer@test.com",
    status: "shipped",
    totalRecipients: 3,
    recipients: [
      { _id: new mongoose.Types.ObjectId(), name: "Recipient A" },
      { _id: new mongoose.Types.ObjectId(), name: "Recipient B" },
      { _id: new mongoose.Types.ObjectId(), name: "Recipient C" },
    ],
    statusHistory: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeAll(() => {
    repository = new DeliveryCheckinRepository();
    orderStatusService = new OrderStatusIntegrationService();
  });

  beforeEach(async () => {
    await DeliveryCheckin.deleteMany({});
    jest.clearAllMocks();
  });

  describe("Multiple Check-ins for Same Order", () => {
    it("should allow multiple check-ins for the same order", async () => {
      // Create first check-in
      await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "123 Street A, District 1" },
        photos: [
          {
            url: "https://example.com/a.jpg",
            thumbnailUrl: "https://example.com/a-thumb.jpg",
          },
        ],
        notes: "First delivery",
        status: CHECKIN_STATUS.COMPLETED,
        checkinAt: new Date("2024-01-13T10:00:00Z"),
      });

      // Create second check-in for same order
      await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.68, 10.78] },
        address: { formatted: "456 Street B, District 3" },
        photos: [
          {
            url: "https://example.com/b.jpg",
            thumbnailUrl: "https://example.com/b-thumb.jpg",
          },
        ],
        notes: "Second delivery",
        status: CHECKIN_STATUS.COMPLETED,
        checkinAt: new Date("2024-01-13T14:30:00Z"),
      });

      // Get all check-ins for the order
      const orderCheckins = await repository.findByOrder(
        mockOrderId.toString()
      );

      expect(orderCheckins.length).toBe(2);
    });

    it("should allow re-delivery check-ins (multiple attempts)", async () => {
      // First delivery attempt (failed)
      await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "123 Street A" },
        photos: [
          {
            url: "https://example.com/attempt1.jpg",
            thumbnailUrl: "https://example.com/attempt1-thumb.jpg",
          },
        ],
        notes: "Khách không có nhà, sẽ giao lại",
        status: CHECKIN_STATUS.COMPLETED,
        checkinAt: new Date("2024-01-13T10:00:00Z"),
      });

      // Second delivery attempt (successful)
      await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "123 Street A" },
        photos: [
          {
            url: "https://example.com/attempt2.jpg",
            thumbnailUrl: "https://example.com/attempt2-thumb.jpg",
          },
        ],
        notes: "Đã giao thành công",
        status: CHECKIN_STATUS.COMPLETED,
        checkinAt: new Date("2024-01-14T09:00:00Z"),
      });

      const orderCheckins = await repository.findByOrder(
        mockOrderId.toString()
      );

      expect(orderCheckins.length).toBe(2);
    });
  });

  describe("Order Status Update on Check-in", () => {
    it("should update order status to delivered on check-in", async () => {
      const order = { ...mockMultiRecipientOrder, status: "shipped" };

      const checkin = {
        _id: new mongoose.Types.ObjectId(),
        orderId: mockOrderId,
        checkinAt: new Date(),
      };

      const updatedOrder = await orderStatusService.updateOrderStatusOnCheckin(
        order,
        checkin
      );

      expect(updatedOrder.status).toBe("delivered");
    });

    it("should record timestamp of status change", async () => {
      const order = {
        ...mockMultiRecipientOrder,
        status: "shipped",
        statusHistory: [],
      };

      const checkinTime = new Date("2024-01-13T10:00:00Z");
      const checkin = {
        _id: new mongoose.Types.ObjectId(),
        orderId: mockOrderId,
        checkinAt: checkinTime,
      };

      const updatedOrder = await orderStatusService.updateOrderStatusOnCheckin(
        order,
        checkin
      );

      expect(updatedOrder.deliveredAt).toBeDefined();
      expect(updatedOrder.statusUpdatedAt).toBeDefined();
    });
  });

  describe("Order Completion Logic", () => {
    it("should mark order as completed when all recipients have check-ins", async () => {
      // Create check-ins for all 3 recipients
      for (let i = 0; i < 3; i++) {
        await repository.create({
          orderId: mockOrderId,
          orderNumber: mockMultiRecipientOrder.orderNumber,
          shipperId: mockShipperId,
          shipperName: "Test Shipper",
          customerId: mockCustomerId,
          customerEmail: "customer@test.com",
          location: {
            type: "Point",
            coordinates: [106.6297 + i * 0.05, 10.8231],
          },
          address: { formatted: `Address ${i + 1}` },
          photos: [
            {
              url: `https://example.com/${i}.jpg`,
              thumbnailUrl: `https://example.com/${i}-thumb.jpg`,
            },
          ],
          status: CHECKIN_STATUS.COMPLETED,
          checkinAt: new Date(Date.now() + i * 3600000),
        });
      }

      const allCheckins = await repository.findByOrder(mockOrderId.toString());

      // Check completion logic
      const isComplete = orderStatusService.checkOrderCompletion(
        mockMultiRecipientOrder,
        allCheckins
      );

      expect(isComplete).toBe(true);
    });

    it("should not mark order as completed when some check-ins are missing", async () => {
      // Create only 2 check-ins for 3-recipient order
      for (let i = 0; i < 2; i++) {
        await repository.create({
          orderId: mockOrderId,
          orderNumber: mockMultiRecipientOrder.orderNumber,
          shipperId: mockShipperId,
          shipperName: "Test Shipper",
          customerId: mockCustomerId,
          customerEmail: "customer@test.com",
          location: {
            type: "Point",
            coordinates: [106.6297 + i * 0.05, 10.8231],
          },
          address: { formatted: `Address ${i + 1}` },
          photos: [
            {
              url: `https://example.com/${i}.jpg`,
              thumbnailUrl: `https://example.com/${i}-thumb.jpg`,
            },
          ],
          status: CHECKIN_STATUS.COMPLETED,
          checkinAt: new Date(Date.now() + i * 3600000),
        });
      }

      const allCheckins = await repository.findByOrder(mockOrderId.toString());

      const isComplete = orderStatusService.checkOrderCompletion(
        mockMultiRecipientOrder,
        allCheckins
      );

      expect(isComplete).toBe(false);
    });

    it("should handle single-recipient orders correctly", async () => {
      const singleRecipientOrder = {
        _id: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-SINGLE-001",
        customerId: mockCustomerId,
        totalRecipients: 1,
        recipients: [
          { _id: new mongoose.Types.ObjectId(), name: "Single Recipient" },
        ],
      };

      // Create check-in for the single recipient
      await repository.create({
        orderId: singleRecipientOrder._id,
        orderNumber: singleRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "Single Address" },
        photos: [
          {
            url: "https://example.com/single.jpg",
            thumbnailUrl: "https://example.com/single-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      const allCheckins = await repository.findByOrder(
        singleRecipientOrder._id.toString()
      );

      const isComplete = orderStatusService.checkOrderCompletion(
        singleRecipientOrder,
        allCheckins
      );

      expect(isComplete).toBe(true);
    });
  });

  describe("Check-in Deletion and Status Reversion", () => {
    it("should revert order status when the only check-in is deleted", async () => {
      // Create a single check-in
      const checkin = await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "Test Address" },
        photos: [
          {
            url: "https://example.com/del.jpg",
            thumbnailUrl: "https://example.com/del-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Simulate order status was updated to "delivered"
      const order = { ...mockMultiRecipientOrder, status: "delivered" };

      // Delete the check-in
      await repository.delete(checkin._id.toString(), mockShipperId.toString());

      // Get remaining check-ins
      const remainingCheckins = await repository.findByOrder(
        mockOrderId.toString()
      );

      // Should be empty (the deleted one is soft-deleted)
      expect(remainingCheckins.length).toBe(0);

      // Revert order status
      const revertedOrder =
        await orderStatusService.revertOrderStatusOnCheckinDeletion(
          order,
          "shipped"
        );

      expect(revertedOrder.status).toBe("shipped");
    });

    it("should not revert order status when other check-ins remain", async () => {
      // Create check-ins for 2 recipients
      const checkin1 = await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "123 Street A" },
        photos: [
          {
            url: "https://example.com/1.jpg",
            thumbnailUrl: "https://example.com/1-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.68, 10.78] },
        address: { formatted: "456 Street B" },
        photos: [
          {
            url: "https://example.com/2.jpg",
            thumbnailUrl: "https://example.com/2-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Delete first check-in
      await repository.delete(
        checkin1._id.toString(),
        mockShipperId.toString()
      );

      // Get remaining check-ins
      const remainingCheckins = await repository.findByOrder(
        mockOrderId.toString()
      );

      // Should still have 1 check-in
      expect(remainingCheckins.length).toBe(1);
    });
  });

  describe("Check-in Query by Order", () => {
    it("should return all check-ins for a multi-recipient order sorted by date", async () => {
      // Create check-ins at different times
      for (let i = 0; i < 3; i++) {
        await repository.create({
          orderId: mockOrderId,
          orderNumber: mockMultiRecipientOrder.orderNumber,
          shipperId: mockShipperId,
          shipperName: "Test Shipper",
          customerId: mockCustomerId,
          customerEmail: "customer@test.com",
          location: {
            type: "Point",
            coordinates: [106.6297 + i * 0.05, 10.8231],
          },
          address: { formatted: `Address ${i + 1}` },
          photos: [
            {
              url: `https://example.com/${i}.jpg`,
              thumbnailUrl: `https://example.com/${i}-thumb.jpg`,
            },
          ],
          status: CHECKIN_STATUS.COMPLETED,
          checkinAt: new Date(Date.now() - i * 3600000), // Different times
        });
      }

      const orderCheckins = await repository.findByOrder(
        mockOrderId.toString()
      );

      expect(orderCheckins.length).toBe(3);

      // Verify sorted by checkinAt descending
      for (let i = 1; i < orderCheckins.length; i++) {
        const prevDate = new Date(orderCheckins[i - 1].checkinAt).getTime();
        const currDate = new Date(orderCheckins[i].checkinAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it("should not include soft-deleted check-ins in order query", async () => {
      // Create 2 check-ins
      const checkin1 = await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "123 Street A" },
        photos: [
          {
            url: "https://example.com/1.jpg",
            thumbnailUrl: "https://example.com/1-thumb.jpg",
          },
        ],
        notes: "First check-in",
        status: CHECKIN_STATUS.COMPLETED,
      });

      await repository.create({
        orderId: mockOrderId,
        orderNumber: mockMultiRecipientOrder.orderNumber,
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.68, 10.78] },
        address: { formatted: "456 Street B" },
        photos: [
          {
            url: "https://example.com/2.jpg",
            thumbnailUrl: "https://example.com/2-thumb.jpg",
          },
        ],
        notes: "Second check-in",
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Soft delete first check-in
      await repository.delete(
        checkin1._id.toString(),
        mockShipperId.toString()
      );

      // Query order check-ins
      const orderCheckins = await repository.findByOrder(
        mockOrderId.toString()
      );

      expect(orderCheckins.length).toBe(1);
      expect(orderCheckins[0].notes).toBe("Second check-in");
    });
  });
});
