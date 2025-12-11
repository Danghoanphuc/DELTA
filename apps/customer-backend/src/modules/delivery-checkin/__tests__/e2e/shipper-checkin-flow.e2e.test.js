/**
 * E2E Test: Shipper Check-in Flow
 *
 * Task 21: Integration Testing - End-to-End Flows
 * Tests the complete shipper check-in workflow from authentication to check-in creation
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import {
  DeliveryCheckin,
  CHECKIN_STATUS,
} from "../../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../../delivery-checkin.repository.js";

describe("E2E: Shipper Check-in Flow", () => {
  let repository;

  // Test data
  const mockShipperId = new mongoose.Types.ObjectId();
  const mockCustomerId = new mongoose.Types.ObjectId();
  const mockOrderId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    repository = new DeliveryCheckinRepository();
  });

  beforeEach(async () => {
    await DeliveryCheckin.deleteMany({});
  });

  describe("Complete Shipper Check-in Workflow", () => {
    it("should create check-in with all required data", async () => {
      const checkinData = {
        orderId: mockOrderId,
        orderNumber: "ORD-E2E-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: {
          type: "Point",
          coordinates: [106.6297, 10.8231],
        },
        address: {
          formatted: "123 Nguyen Hue, District 1, Ho Chi Minh City",
          street: "123 Nguyen Hue",
          ward: "Ben Nghe",
          district: "District 1",
          city: "Ho Chi Minh City",
          country: "Vietnam",
        },
        gpsMetadata: {
          accuracy: 10,
          altitude: 50,
          heading: 180,
          speed: 0,
          source: "device",
        },
        photos: [
          {
            url: "https://cdn.example.com/photos/test-photo-1.jpg",
            thumbnailUrl: "https://cdn.example.com/thumbnails/test-photo-1.jpg",
            filename: "test-photo-1.jpg",
            size: 1024000,
            mimeType: "image/jpeg",
          },
        ],
        notes: "Đã giao hàng thành công. Khách hàng đã nhận.",
        status: CHECKIN_STATUS.COMPLETED,
      };

      const checkin = await repository.create(checkinData);

      // Verify check-in was created with all required data
      expect(checkin).toBeDefined();
      expect(checkin._id).toBeDefined();
      expect(checkin.orderId.toString()).toBe(mockOrderId.toString());
      expect(checkin.shipperId.toString()).toBe(mockShipperId.toString());
      expect(checkin.shipperName).toBe("Test Shipper");
      expect(checkin.customerId.toString()).toBe(mockCustomerId.toString());
      expect(checkin.customerEmail).toBe("customer@test.com");
      expect(checkin.status).toBe(CHECKIN_STATUS.COMPLETED);

      // Verify GPS data was stored
      expect(checkin.location.type).toBe("Point");
      expect(checkin.location.coordinates).toEqual([106.6297, 10.8231]);
      expect(checkin.gpsMetadata.accuracy).toBe(10);
      expect(checkin.gpsMetadata.source).toBe("device");

      // Verify address was stored
      expect(checkin.address.formatted).toBe(
        "123 Nguyen Hue, District 1, Ho Chi Minh City"
      );
      expect(checkin.address.city).toBe("Ho Chi Minh City");
      expect(checkin.address.country).toBe("Vietnam");

      // Verify notes were stored
      expect(checkin.notes).toBe(
        "Đã giao hàng thành công. Khách hàng đã nhận."
      );

      // Verify photos were stored
      expect(checkin.photos).toHaveLength(1);
      expect(checkin.photos[0].url).toContain(
        "https://cdn.example.com/photos/"
      );
    });

    it("should handle check-in with multiple photos", async () => {
      const checkinData = {
        orderId: mockOrderId,
        orderNumber: "ORD-MULTI-PHOTO-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "Test Address" },
        photos: [
          {
            url: "https://example.com/1.jpg",
            thumbnailUrl: "https://example.com/1-thumb.jpg",
            mimeType: "image/jpeg",
          },
          {
            url: "https://example.com/2.png",
            thumbnailUrl: "https://example.com/2-thumb.png",
            mimeType: "image/png",
          },
          {
            url: "https://example.com/3.webp",
            thumbnailUrl: "https://example.com/3-thumb.webp",
            mimeType: "image/webp",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      };

      const checkin = await repository.create(checkinData);

      expect(checkin.photos).toHaveLength(3);
      expect(checkin.photos[0].mimeType).toBe("image/jpeg");
      expect(checkin.photos[1].mimeType).toBe("image/png");
      expect(checkin.photos[2].mimeType).toBe("image/webp");
    });

    it("should reject check-in without required fields", async () => {
      const invalidCheckinData = {
        // Missing orderId, shipperId, etc.
        notes: "Invalid check-in",
      };

      await expect(repository.create(invalidCheckinData)).rejects.toThrow();
    });
  });

  describe("Shipper History Flow", () => {
    it("should allow shipper to view their check-in history", async () => {
      // Create multiple check-ins for the shipper
      await repository.create({
        orderId: mockOrderId,
        orderNumber: "ORD-HIST-001",
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
      });

      await repository.create({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-HIST-002",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.63, 10.8235] },
        address: { formatted: "Address 2" },
        photos: [
          {
            url: "https://example.com/2.jpg",
            thumbnailUrl: "https://example.com/2-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Get shipper history
      const checkins = await repository.findByShipper(mockShipperId.toString());

      expect(checkins).toBeDefined();
      expect(checkins.length).toBe(2);

      // Verify check-ins are sorted by date (newest first)
      const dates = checkins.map((c) => new Date(c.checkinAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });

    it("should allow shipper to delete their own check-in", async () => {
      const checkin = await repository.create({
        orderId: mockOrderId,
        orderNumber: "ORD-DEL-001",
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

      // Delete the check-in
      await repository.delete(checkin._id.toString(), mockShipperId.toString());

      // Verify soft delete
      const deletedCheckin = await DeliveryCheckin.findById(checkin._id);
      expect(deletedCheckin.isDeleted).toBe(true);
      expect(deletedCheckin.deletedAt).toBeDefined();
      expect(deletedCheckin.deletedBy.toString()).toBe(
        mockShipperId.toString()
      );

      // Verify it doesn't appear in history
      const history = await repository.findByShipper(mockShipperId.toString());
      expect(
        history.find((c) => c._id.toString() === checkin._id.toString())
      ).toBeUndefined();
    });

    it("should not return other shipper's check-ins in history", async () => {
      const otherShipperId = new mongoose.Types.ObjectId();

      // Create check-in for this shipper
      await repository.create({
        orderId: mockOrderId,
        orderNumber: "ORD-THIS-001",
        shipperId: mockShipperId,
        shipperName: "This Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "This Address" },
        photos: [
          {
            url: "https://example.com/this.jpg",
            thumbnailUrl: "https://example.com/this-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Create check-in for other shipper
      await repository.create({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-OTHER-001",
        shipperId: otherShipperId,
        shipperName: "Other Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.68, 10.78] },
        address: { formatted: "Other Address" },
        photos: [
          {
            url: "https://example.com/other.jpg",
            thumbnailUrl: "https://example.com/other-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      });

      // Get this shipper's history
      const history = await repository.findByShipper(mockShipperId.toString());

      expect(history.length).toBe(1);
      expect(history[0].shipperName).toBe("This Shipper");
    });
  });

  describe("GPS Validation", () => {
    it("should store GPS metadata correctly", async () => {
      const checkinData = {
        orderId: mockOrderId,
        orderNumber: "ORD-GPS-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "GPS Test Address" },
        gpsMetadata: {
          accuracy: 5,
          altitude: 100,
          heading: 90,
          speed: 10,
          source: "device",
          timestamp: new Date(),
        },
        photos: [
          {
            url: "https://example.com/gps.jpg",
            thumbnailUrl: "https://example.com/gps-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      };

      const checkin = await repository.create(checkinData);

      expect(checkin.gpsMetadata).toBeDefined();
      expect(checkin.gpsMetadata.accuracy).toBe(5);
      expect(checkin.gpsMetadata.altitude).toBe(100);
      expect(checkin.gpsMetadata.heading).toBe(90);
      expect(checkin.gpsMetadata.speed).toBe(10);
      expect(checkin.gpsMetadata.source).toBe("device");
    });

    it("should handle check-in with browser GPS source", async () => {
      const checkinData = {
        orderId: mockOrderId,
        orderNumber: "ORD-BROWSER-GPS-001",
        shipperId: mockShipperId,
        shipperName: "Test Shipper",
        customerId: mockCustomerId,
        customerEmail: "customer@test.com",
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        address: { formatted: "Browser GPS Address" },
        gpsMetadata: {
          accuracy: 50,
          source: "browser",
        },
        photos: [
          {
            url: "https://example.com/browser.jpg",
            thumbnailUrl: "https://example.com/browser-thumb.jpg",
          },
        ],
        status: CHECKIN_STATUS.COMPLETED,
      };

      const checkin = await repository.create(checkinData);

      expect(checkin.gpsMetadata.source).toBe("browser");
      expect(checkin.gpsMetadata.accuracy).toBe(50);
    });
  });
});
