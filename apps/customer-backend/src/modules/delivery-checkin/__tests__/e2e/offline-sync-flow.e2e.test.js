/**
 * E2E Test: Offline Sync Flow
 *
 * Task 21: Integration Testing - End-to-End Flows
 * Tests the offline queue and sync workflow for check-ins created
 * while the device is offline
 *
 * **Validates: Requirements 8.3, 8.4, 14.1, 14.2, 14.3, 14.4**
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import {
  DeliveryCheckin,
  CHECKIN_STATUS,
} from "../../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../../delivery-checkin.repository.js";

/**
 * OfflineQueueService - Simulates the frontend offline queue behavior
 */
class OfflineQueueService {
  constructor() {
    this.queue = [];
    this.isOnline = true;
  }

  setOnlineStatus(status) {
    this.isOnline = status;
  }

  addToQueue(checkinData) {
    const queuedItem = {
      id: new mongoose.Types.ObjectId().toString(),
      data: checkinData,
      queuedAt: new Date(),
      retryCount: 0,
      status: "pending",
    };
    this.queue.push(queuedItem);
    return queuedItem;
  }

  getQueue() {
    return this.queue.filter((item) => item.status === "pending");
  }

  markAsSynced(itemId) {
    const item = this.queue.find((i) => i.id === itemId);
    if (item) {
      item.status = "synced";
      item.syncedAt = new Date();
    }
  }

  markAsFailed(itemId, error) {
    const item = this.queue.find((i) => i.id === itemId);
    if (item) {
      item.status = "failed";
      item.error = error;
      item.retryCount++;
    }
  }

  clearSynced() {
    this.queue = this.queue.filter((item) => item.status !== "synced");
  }
}

describe("E2E: Offline Sync Flow", () => {
  let repository;
  let offlineQueue;

  // Test data
  const mockShipperId = new mongoose.Types.ObjectId();
  const mockCustomerId = new mongoose.Types.ObjectId();
  const mockOrderId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    repository = new DeliveryCheckinRepository();
    offlineQueue = new OfflineQueueService();
  });

  beforeEach(async () => {
    await DeliveryCheckin.deleteMany({});
    offlineQueue.queue = [];
    offlineQueue.isOnline = true;
  });

  describe("Offline Queue Management", () => {
    it("should queue check-in when offline", () => {
      offlineQueue.setOnlineStatus(false);

      const checkinData = {
        orderId: mockOrderId,
        orderNumber: "ORD-OFFLINE-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "123 Test Street" },
        photos: [{ localUri: "file:///photo1.jpg" }],
        notes: "Queued while offline",
      };

      const queuedItem = offlineQueue.addToQueue(checkinData);

      expect(queuedItem).toBeDefined();
      expect(queuedItem.id).toBeDefined();
      expect(queuedItem.status).toBe("pending");
      expect(queuedItem.queuedAt).toBeDefined();
      expect(offlineQueue.getQueue().length).toBe(1);
    });

    it("should maintain queue order (FIFO)", () => {
      offlineQueue.setOnlineStatus(false);

      offlineQueue.addToQueue({
        orderNumber: "ORD-OFFLINE-001",
        notes: "First",
      });
      offlineQueue.addToQueue({
        orderNumber: "ORD-OFFLINE-002",
        notes: "Second",
      });
      offlineQueue.addToQueue({
        orderNumber: "ORD-OFFLINE-003",
        notes: "Third",
      });

      const queue = offlineQueue.getQueue();

      expect(queue.length).toBe(3);
      expect(queue[0].data.notes).toBe("First");
      expect(queue[1].data.notes).toBe("Second");
      expect(queue[2].data.notes).toBe("Third");
    });

    it("should track retry count for failed syncs", () => {
      const queuedItem = offlineQueue.addToQueue({
        orderNumber: "ORD-RETRY-001",
      });

      // Simulate failed sync attempts
      offlineQueue.markAsFailed(queuedItem.id, "Network error");
      expect(offlineQueue.queue[0].retryCount).toBe(1);

      offlineQueue.queue[0].status = "pending"; // Reset for retry
      offlineQueue.markAsFailed(queuedItem.id, "Network error");
      expect(offlineQueue.queue[0].retryCount).toBe(2);
    });
  });

  describe("Sync When Online", () => {
    it("should sync queued check-ins when connection is restored", async () => {
      // Queue check-ins while offline
      offlineQueue.setOnlineStatus(false);

      const checkinData1 = {
        orderId: mockOrderId,
        orderNumber: "ORD-SYNC-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "Address 1" },
        photos: [
          {
            url: "https://example.com/1.jpg",
            thumbnailUrl: "https://example.com/1-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      };

      const checkinData2 = {
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-SYNC-002",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.68, 10.78] },
        address: { formatted: "Address 2" },
        photos: [
          {
            url: "https://example.com/2.jpg",
            thumbnailUrl: "https://example.com/2-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      };

      const queued1 = offlineQueue.addToQueue(checkinData1);
      const queued2 = offlineQueue.addToQueue(checkinData2);

      // Restore connection
      offlineQueue.setOnlineStatus(true);

      // Sync queued items
      const pendingItems = offlineQueue.getQueue();
      for (const item of pendingItems) {
        try {
          await repository.create(item.data);
          offlineQueue.markAsSynced(item.id);
        } catch (error) {
          offlineQueue.markAsFailed(item.id, error.message);
        }
      }

      // Verify check-ins were created
      const allCheckins = await DeliveryCheckin.find({});
      expect(allCheckins.length).toBe(2);

      // Verify queue items are marked as synced
      expect(offlineQueue.queue.find((i) => i.id === queued1.id).status).toBe(
        "synced"
      );
      expect(offlineQueue.queue.find((i) => i.id === queued2.id).status).toBe(
        "synced"
      );
    });

    it("should handle partial sync failures gracefully", async () => {
      offlineQueue.setOnlineStatus(false);

      // Valid check-in
      const validCheckin = offlineQueue.addToQueue({
        orderId: mockOrderId,
        orderNumber: "ORD-VALID-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "Valid Address" },
        photos: [
          {
            url: "https://example.com/valid.jpg",
            thumbnailUrl: "https://example.com/valid-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Invalid check-in (missing required field)
      const invalidCheckin = offlineQueue.addToQueue({
        orderId: mockOrderId,
        // Missing orderNumber - will fail validation
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.68, 10.78] },
        address: { formatted: "Invalid Address" },
        photos: [
          {
            url: "https://example.com/invalid.jpg",
            thumbnailUrl: "https://example.com/invalid-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Restore connection and sync
      offlineQueue.setOnlineStatus(true);

      const pendingItems = offlineQueue.getQueue();
      for (const item of pendingItems) {
        try {
          await repository.create(item.data);
          offlineQueue.markAsSynced(item.id);
        } catch (error) {
          offlineQueue.markAsFailed(item.id, error.message);
        }
      }

      // Valid check-in should be synced
      expect(
        offlineQueue.queue.find((i) => i.id === validCheckin.id).status
      ).toBe("synced");

      // Invalid check-in should be marked as failed
      expect(
        offlineQueue.queue.find((i) => i.id === invalidCheckin.id).status
      ).toBe("failed");

      // Only valid check-in should be in database
      const allCheckins = await DeliveryCheckin.find({});
      expect(allCheckins.length).toBe(1);
      expect(allCheckins[0].orderNumber).toBe("ORD-VALID-001");
    });
  });

  describe("Error Recovery", () => {
    it("should save check-in draft locally when network fails", () => {
      offlineQueue.setOnlineStatus(false);

      const draftCheckin = {
        orderId: mockOrderId,
        orderNumber: "ORD-DRAFT-001",
        shipperId: mockShipperId,
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        notes: "Draft saved locally",
        isDraft: true,
      };

      const queuedItem = offlineQueue.addToQueue(draftCheckin);

      expect(queuedItem).toBeDefined();
      expect(queuedItem.data.isDraft).toBe(true);
    });

    it("should proceed with check-in when geocoding fails", async () => {
      // Simulate Goong.io API failure - use coordinates only
      const checkinWithoutGeocode = {
        orderId: mockOrderId,
        orderNumber: "ORD-NO-GEOCODE-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: {
          formatted: "10.8231, 106.6297", // Fallback to coordinates
        },
        photos: [
          {
            url: "https://example.com/1.jpg",
            thumbnailUrl: "https://example.com/1-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      };

      const checkin = await repository.create(checkinWithoutGeocode);

      expect(checkin).toBeDefined();
      expect(checkin.address.formatted).toContain("10.8231");
    });
  });

  describe("Sync Status Indicator", () => {
    it("should track sync status for each queued item", () => {
      const item1 = offlineQueue.addToQueue({ orderNumber: "ORD-1" });
      const item2 = offlineQueue.addToQueue({ orderNumber: "ORD-2" });
      const item3 = offlineQueue.addToQueue({ orderNumber: "ORD-3" });

      offlineQueue.markAsSynced(item1.id);
      offlineQueue.markAsFailed(item2.id, "Network error");
      // item3 remains pending

      const statuses = offlineQueue.queue.map((i) => ({
        id: i.id,
        status: i.status,
      }));

      expect(statuses.find((s) => s.id === item1.id).status).toBe("synced");
      expect(statuses.find((s) => s.id === item2.id).status).toBe("failed");
      expect(statuses.find((s) => s.id === item3.id).status).toBe("pending");
    });

    it("should clear synced items from queue", () => {
      const item1 = offlineQueue.addToQueue({ orderNumber: "ORD-1" });
      const item2 = offlineQueue.addToQueue({ orderNumber: "ORD-2" });

      offlineQueue.markAsSynced(item1.id);

      offlineQueue.clearSynced();

      expect(offlineQueue.queue.length).toBe(1);
      expect(offlineQueue.queue[0].id).toBe(item2.id);
    });
  });
});
