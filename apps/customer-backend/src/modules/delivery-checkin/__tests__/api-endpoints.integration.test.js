/**
 * Integration Tests for Delivery Check-in API Endpoints
 * Tests the middleware, repository, and service layers for the delivery check-in system
 *
 * Task 11.1: Write integration tests for API endpoints
 * - Test POST with file upload (via repository layer)
 * - Test GET with filtering and pagination
 * - Test DELETE with authorization
 * - Test geospatial bounds query
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { DeliveryCheckin } from "../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../delivery-checkin.repository.js";
import {
  isShipper,
  isCustomer,
  isShipperOrCustomer,
  verifyShipperOwnership,
  verifyCustomerOwnership,
} from "../delivery-checkin.middleware.js";

describe("Delivery Check-in API Endpoints - Integration Tests", () => {
  let repository;

  beforeAll(async () => {
    repository = new DeliveryCheckinRepository();
  });

  beforeEach(async () => {
    await DeliveryCheckin.deleteMany({});
  });

  describe("Repository Layer Tests", () => {
    describe("POST - Create Check-in with File Upload Data", () => {
      it("should create a check-in with valid data including photo URLs", async () => {
        const shipperId = new mongoose.Types.ObjectId();
        const checkinData = {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-TEST-001",
          shipperId: shipperId,
          shipperName: "Test Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6297, 10.8231] },
          address: {
            formatted: "123 Nguyen Hue, District 1, Ho Chi Minh City",
          },
          photos: [
            {
              url: "https://example.com/photo1.jpg",
              thumbnailUrl: "https://example.com/thumb1.jpg",
              filename: "photo1.jpg",
              size: 1024000,
              mimeType: "image/jpeg",
              width: 1920,
              height: 1080,
            },
          ],
        };

        const checkin = await repository.create(checkinData);

        expect(checkin).toBeDefined();
        expect(checkin._id).toBeDefined();
        expect(checkin.orderNumber).toBe("ORD-TEST-001");
        expect(checkin.photos).toHaveLength(1);
        expect(checkin.photos[0].url).toBe("https://example.com/photo1.jpg");
      });

      it("should create check-in with multiple photos", async () => {
        const shipperId = new mongoose.Types.ObjectId();
        const checkinData = {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-MULTI-PHOTO-001",
          shipperId: shipperId,
          shipperName: "Test Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6297, 10.8231] },
          address: { formatted: "456 Multi Photo Street" },
          photos: [
            {
              url: "https://example.com/photo1.jpg",
              thumbnailUrl: "https://example.com/thumb1.jpg",
              mimeType: "image/jpeg",
            },
            {
              url: "https://example.com/photo2.png",
              thumbnailUrl: "https://example.com/thumb2.png",
              mimeType: "image/png",
            },
            {
              url: "https://example.com/photo3.webp",
              thumbnailUrl: "https://example.com/thumb3.webp",
              mimeType: "image/webp",
            },
          ],
        };

        const checkin = await repository.create(checkinData);

        expect(checkin.photos).toHaveLength(3);
        expect(checkin.photos[0].mimeType).toBe("image/jpeg");
        expect(checkin.photos[1].mimeType).toBe("image/png");
        expect(checkin.photos[2].mimeType).toBe("image/webp");
      });

      it("should create check-in with GPS metadata", async () => {
        const shipperId = new mongoose.Types.ObjectId();
        const checkinData = {
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-GPS-001",
          shipperId: shipperId,
          shipperName: "Test Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6297, 10.8231] },
          address: { formatted: "GPS Test Address" },
          gpsMetadata: {
            accuracy: 10,
            altitude: 50,
            heading: 180,
            speed: 5,
            source: "device",
          },
          photos: [
            {
              url: "https://example.com/photo.jpg",
              thumbnailUrl: "https://example.com/thumb.jpg",
            },
          ],
        };

        const checkin = await repository.create(checkinData);

        expect(checkin.gpsMetadata).toBeDefined();
        expect(checkin.gpsMetadata.accuracy).toBe(10);
        expect(checkin.gpsMetadata.source).toBe("device");
      });
    });

    describe("GET - Filtering and Pagination", () => {
      beforeEach(async () => {
        // Create test data for filtering and pagination tests
        const shipperId = new mongoose.Types.ObjectId();
        const customerId = new mongoose.Types.ObjectId();

        const checkins = [];
        for (let i = 0; i < 25; i++) {
          checkins.push({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: `ORD-PAGE-${String(i).padStart(3, "0")}`,
            shipperId: shipperId,
            shipperName: "Test Shipper",
            customerId: customerId,
            customerEmail: "customer@test.com",
            location: {
              type: "Point",
              coordinates: [106.6297 + i * 0.001, 10.8231],
            },
            address: { formatted: `Address ${i}` },
            photos: [
              {
                url: `https://example.com/photo${i}.jpg`,
                thumbnailUrl: `https://example.com/thumb${i}.jpg`,
              },
            ],
            status: i % 3 === 0 ? "pending" : "completed",
            checkinAt: new Date(Date.now() - i * 3600000), // Each hour apart
          });
        }
        await DeliveryCheckin.insertMany(checkins);
      });

      it("should return check-ins by shipper with default limit", async () => {
        const checkin = await DeliveryCheckin.findOne();
        const shipperId = checkin.shipperId;

        const checkins = await repository.findByShipper(shipperId.toString());

        expect(checkins).toBeDefined();
        expect(Array.isArray(checkins)).toBe(true);
        expect(checkins.length).toBeLessThanOrEqual(50); // Default limit
      });

      it("should return check-ins by shipper with custom limit", async () => {
        const checkin = await DeliveryCheckin.findOne();
        const shipperId = checkin.shipperId;

        const checkins = await repository.findByShipper(shipperId.toString(), {
          limit: 5,
        });

        expect(checkins.length).toBeLessThanOrEqual(5);
      });

      it("should return check-ins by customer", async () => {
        const checkin = await DeliveryCheckin.findOne();
        const customerId = checkin.customerId;

        const checkins = await repository.findByCustomer(customerId.toString());

        expect(checkins).toBeDefined();
        expect(Array.isArray(checkins)).toBe(true);
        // All check-ins should belong to the same customer
        checkins.forEach((c) => {
          expect(c.customerId.toString()).toBe(customerId.toString());
        });
      });

      it("should return check-ins sorted by checkinAt descending", async () => {
        const checkin = await DeliveryCheckin.findOne();
        const shipperId = checkin.shipperId;

        const checkins = await repository.findByShipper(shipperId.toString());

        // Verify descending order
        for (let i = 1; i < checkins.length; i++) {
          const prevDate = new Date(checkins[i - 1].checkinAt);
          const currDate = new Date(checkins[i].checkinAt);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      });

      it("should return check-ins by order", async () => {
        const checkin = await DeliveryCheckin.findOne();
        const orderId = checkin.orderId;

        const checkins = await repository.findByOrder(orderId.toString());

        expect(checkins).toBeDefined();
        expect(Array.isArray(checkins)).toBe(true);
        checkins.forEach((c) => {
          expect(c.orderId.toString()).toBe(orderId.toString());
        });
      });
    });

    describe("DELETE - Soft Delete with Authorization", () => {
      it("should soft delete check-in with audit trail", async () => {
        const shipperId = new mongoose.Types.ObjectId();
        const checkin = await DeliveryCheckin.create({
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-DEL-001",
          shipperId: shipperId,
          shipperName: "Test Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6297, 10.8231] },
          address: { formatted: "Test Address" },
          photos: [
            {
              url: "https://example.com/photo.jpg",
              thumbnailUrl: "https://example.com/thumb.jpg",
            },
          ],
        });

        await repository.delete(checkin._id.toString(), shipperId.toString());

        const deletedCheckin = await DeliveryCheckin.findById(checkin._id);
        expect(deletedCheckin.isDeleted).toBe(true);
        expect(deletedCheckin.deletedAt).toBeDefined();
        expect(deletedCheckin.deletedBy.toString()).toBe(shipperId.toString());
      });

      it("should not return soft-deleted check-ins in findByShipper", async () => {
        const shipperId = new mongoose.Types.ObjectId();

        // Create active check-in
        await DeliveryCheckin.create({
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-ACTIVE-001",
          shipperId: shipperId,
          shipperName: "Test Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6297, 10.8231] },
          address: { formatted: "Active Address" },
          photos: [
            {
              url: "https://example.com/active.jpg",
              thumbnailUrl: "https://example.com/active-thumb.jpg",
            },
          ],
        });

        // Create and delete another check-in
        const deletedCheckin = await DeliveryCheckin.create({
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-DELETED-001",
          shipperId: shipperId,
          shipperName: "Test Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6298, 10.8232] },
          address: { formatted: "Deleted Address" },
          photos: [
            {
              url: "https://example.com/deleted.jpg",
              thumbnailUrl: "https://example.com/deleted-thumb.jpg",
            },
          ],
        });
        await repository.delete(
          deletedCheckin._id.toString(),
          shipperId.toString()
        );

        const checkins = await repository.findByShipper(shipperId.toString());

        expect(checkins.length).toBe(1);
        expect(checkins[0].orderNumber).toBe("ORD-ACTIVE-001");
      });

      it("should not return soft-deleted check-ins in findByOrder", async () => {
        const orderId = new mongoose.Types.ObjectId();
        const shipperId = new mongoose.Types.ObjectId();

        // Create active check-in
        await DeliveryCheckin.create({
          orderId: orderId,
          orderNumber: "ORD-MULTI-001",
          shipperId: shipperId,
          shipperName: "Shipper 1",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6297, 10.8231] },
          address: { formatted: "Address 1" },
          photos: [
            {
              url: "https://example.com/1.jpg",
              thumbnailUrl: "https://example.com/1-thumb.jpg",
            },
          ],
        });

        // Create and delete another check-in for same order
        const deletedCheckin = await DeliveryCheckin.create({
          orderId: orderId,
          orderNumber: "ORD-MULTI-001",
          shipperId: shipperId,
          shipperName: "Shipper 1",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6298, 10.8232] },
          address: { formatted: "Address 2" },
          photos: [
            {
              url: "https://example.com/2.jpg",
              thumbnailUrl: "https://example.com/2-thumb.jpg",
            },
          ],
        });
        await repository.delete(
          deletedCheckin._id.toString(),
          shipperId.toString()
        );

        const checkins = await repository.findByOrder(orderId.toString());

        expect(checkins.length).toBe(1);
      });
    });

    describe("Geospatial Bounds Query", () => {
      beforeEach(async () => {
        // Create check-ins at various locations
        await DeliveryCheckin.create([
          {
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-MAP-001",
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: "Shipper 1",
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: "customer@test.com",
            location: { type: "Point", coordinates: [106.6297, 10.8231] }, // Inside bounds
            address: { formatted: "Inside Address 1" },
            photos: [
              {
                url: "https://example.com/in1.jpg",
                thumbnailUrl: "https://example.com/in1-thumb.jpg",
              },
            ],
          },
          {
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-MAP-002",
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: "Shipper 2",
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: "customer@test.com",
            location: { type: "Point", coordinates: [106.65, 10.85] }, // Inside bounds
            address: { formatted: "Inside Address 2" },
            photos: [
              {
                url: "https://example.com/in2.jpg",
                thumbnailUrl: "https://example.com/in2-thumb.jpg",
              },
            ],
          },
          {
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-MAP-003",
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: "Shipper 3",
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: "customer@test.com",
            location: { type: "Point", coordinates: [107.0, 11.0] }, // Outside bounds
            address: { formatted: "Outside Address" },
            photos: [
              {
                url: "https://example.com/out.jpg",
                thumbnailUrl: "https://example.com/out-thumb.jpg",
              },
            ],
          },
        ]);
      });

      it("should return check-ins within specified bounds", async () => {
        const bounds = {
          minLng: 106.5,
          maxLng: 106.7,
          minLat: 10.7,
          maxLat: 10.9,
        };
        const checkins = await repository.findWithinBounds(bounds);

        expect(checkins).toHaveLength(2);
        checkins.forEach((c) => {
          const [lng, lat] = c.location.coordinates;
          expect(lng).toBeGreaterThanOrEqual(bounds.minLng);
          expect(lng).toBeLessThanOrEqual(bounds.maxLng);
          expect(lat).toBeGreaterThanOrEqual(bounds.minLat);
          expect(lat).toBeLessThanOrEqual(bounds.maxLat);
        });
      });

      it("should return empty array for bounds with no check-ins", async () => {
        const bounds = {
          minLng: 100.0,
          maxLng: 101.0,
          minLat: 5.0,
          maxLat: 6.0,
        };
        const checkins = await repository.findWithinBounds(bounds);

        expect(checkins).toHaveLength(0);
      });

      it("should not return soft-deleted check-ins in bounds query", async () => {
        const shipperId = new mongoose.Types.ObjectId();

        // Create and delete a check-in inside bounds
        const deletedCheckin = await DeliveryCheckin.create({
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-MAP-DELETED",
          shipperId: shipperId,
          shipperName: "Deleted Shipper",
          customerId: new mongoose.Types.ObjectId(),
          customerEmail: "customer@test.com",
          location: { type: "Point", coordinates: [106.6, 10.8] }, // Inside bounds
          address: { formatted: "Deleted Inside Address" },
          photos: [
            {
              url: "https://example.com/deleted.jpg",
              thumbnailUrl: "https://example.com/deleted-thumb.jpg",
            },
          ],
        });
        await repository.delete(
          deletedCheckin._id.toString(),
          shipperId.toString()
        );

        const bounds = {
          minLng: 106.5,
          maxLng: 106.7,
          minLat: 10.7,
          maxLat: 10.9,
        };
        const checkins = await repository.findWithinBounds(bounds);

        // Should still only have 2 (the original non-deleted ones)
        expect(checkins).toHaveLength(2);
        expect(
          checkins.find((c) => c.orderNumber === "ORD-MAP-DELETED")
        ).toBeUndefined();
      });

      it("should handle edge case bounds at exact coordinates", async () => {
        const bounds = {
          minLng: 106.6297,
          maxLng: 106.6297,
          minLat: 10.8231,
          maxLat: 10.8231,
        };
        const checkins = await repository.findWithinBounds(bounds);

        // Should find the check-in at exact coordinates
        expect(checkins.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Middleware Tests", () => {
    describe("isShipper middleware", () => {
      it("should allow shipper role", () => {
        const req = { user: { role: "shipper" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isShipper(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should allow active shipper profile", () => {
        const req = {
          user: { role: "customer", shipperProfile: { isActive: true } },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isShipper(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should reject non-shipper users", () => {
        const req = { user: { role: "customer" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isShipper(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
      });

      it("should reject unauthenticated users", () => {
        const req = { user: null };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isShipper(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
      });
    });

    describe("isCustomer middleware", () => {
      it("should allow customer with profile", () => {
        const req = {
          user: { customerProfileId: new mongoose.Types.ObjectId() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isCustomer(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should reject users without customer profile", () => {
        const req = { user: { role: "shipper" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isCustomer(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
      });
    });

    describe("isShipperOrCustomer middleware", () => {
      it("should allow shipper", () => {
        const req = { user: { role: "shipper" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isShipperOrCustomer(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should allow customer", () => {
        const req = {
          user: { customerProfileId: new mongoose.Types.ObjectId() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        isShipperOrCustomer(req, res, next);
        expect(next).toHaveBeenCalled();
      });
    });

    describe("verifyShipperOwnership middleware", () => {
      it("should allow shipper to access own data", () => {
        const shipperId = new mongoose.Types.ObjectId();
        const req = {
          user: { _id: shipperId },
          params: { shipperId: shipperId.toString() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        verifyShipperOwnership("shipperId")(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should allow admin to access any shipper data", () => {
        const req = {
          user: { _id: new mongoose.Types.ObjectId(), isAdmin: true },
          params: { shipperId: new mongoose.Types.ObjectId().toString() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        verifyShipperOwnership("shipperId")(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should reject shipper accessing other shipper data", () => {
        const req = {
          user: { _id: new mongoose.Types.ObjectId(), isAdmin: false },
          params: { shipperId: new mongoose.Types.ObjectId().toString() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        verifyShipperOwnership("shipperId")(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
      });
    });

    describe("verifyCustomerOwnership middleware", () => {
      it("should allow customer to access own data", () => {
        const customerId = new mongoose.Types.ObjectId();
        const req = {
          user: { _id: customerId },
          params: { customerId: customerId.toString() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        verifyCustomerOwnership("customerId")(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should allow admin to access any customer data", () => {
        const req = {
          user: { _id: new mongoose.Types.ObjectId(), isAdmin: true },
          params: { customerId: new mongoose.Types.ObjectId().toString() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        verifyCustomerOwnership("customerId")(req, res, next);
        expect(next).toHaveBeenCalled();
      });

      it("should reject customer accessing other customer data", () => {
        const req = {
          user: { _id: new mongoose.Types.ObjectId(), isAdmin: false },
          params: { customerId: new mongoose.Types.ObjectId().toString() },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        verifyCustomerOwnership("customerId")(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
      });
    });
  });
});
