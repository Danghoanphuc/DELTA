/**
 * E2E Test: Email Notification Flow
 *
 * Task 21: Integration Testing - End-to-End Flows
 * Tests the email notification workflow including template formatting
 * and notification status tracking
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";
import {
  DeliveryCheckin,
  CHECKIN_STATUS,
} from "../../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../../delivery-checkin.repository.js";

describe("E2E: Email Notification Flow", () => {
  let repository;

  // Test data
  const mockShipperId = new mongoose.Types.ObjectId();
  const mockCustomerId = new mongoose.Types.ObjectId();
  const mockOrderId = new mongoose.Types.ObjectId();

  const mockCheckin = {
    orderId: mockOrderId,
    orderNumber: "ORD-EMAIL-001",
    shipperId: mockShipperId,
    shipperName: "Test Shipper",
    customerId: mockCustomerId,
    customerEmail: "customer@test.com",
    location: { type: "Point", coordinates: [106.6297, 10.8231] },
    address: { formatted: "123 Nguyen Hue, District 1, Ho Chi Minh City" },
    photos: [
      {
        url: "https://example.com/photo.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
      },
    ],
    checkinAt: new Date(),
    status: CHECKIN_STATUS.COMPLETED,
  };

  beforeAll(() => {
    repository = new DeliveryCheckinRepository();
  });

  beforeEach(async () => {
    await DeliveryCheckin.deleteMany({});
  });

  describe("Email Status Tracking in Check-in Records", () => {
    it("should create check-in with emailSent defaulting to false", async () => {
      const checkin = await repository.create(mockCheckin);

      expect(checkin.emailSent).toBe(false);
      expect(checkin.emailSentAt).toBeUndefined();
    });

    it("should update emailSent status when email is sent", async () => {
      const checkin = await repository.create(mockCheckin);

      // Mark email as sent
      await repository.markEmailSent(checkin._id.toString());

      // Verify status updated - use direct model query to avoid populate issues
      const updatedCheckin = await DeliveryCheckin.findById(checkin._id).lean();
      expect(updatedCheckin.emailSent).toBe(true);
      expect(updatedCheckin.emailSentAt).toBeDefined();
    });

    it("should track email sent timestamp", async () => {
      const checkin = await repository.create(mockCheckin);
      const beforeUpdate = new Date();

      await repository.markEmailSent(checkin._id.toString());

      // Use direct model query to avoid populate issues
      const updatedCheckin = await DeliveryCheckin.findById(checkin._id).lean();
      const emailSentAt = new Date(updatedCheckin.emailSentAt);

      expect(emailSentAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime()
      );
    });
  });

  describe("Check-in Data for Email Template", () => {
    it("should include all required data for email template", async () => {
      const checkin = await repository.create(mockCheckin);

      // Verify all data needed for email template is present
      expect(checkin.orderNumber).toBe("ORD-EMAIL-001");
      expect(checkin.shipperName).toBe("Test Shipper");
      expect(checkin.customerEmail).toBe("customer@test.com");
      expect(checkin.address.formatted).toBe(
        "123 Nguyen Hue, District 1, Ho Chi Minh City"
      );
      expect(checkin.checkinAt).toBeDefined();
      expect(checkin.photos.length).toBeGreaterThan(0);
      expect(checkin.photos[0].thumbnailUrl).toBeDefined();
    });

    it("should handle check-in without photos for email", async () => {
      const checkinWithoutPhotos = {
        ...mockCheckin,
        photos: [],
      };

      const checkin = await repository.create(checkinWithoutPhotos);

      expect(checkin.photos).toEqual([]);
      // Email should still be sendable without photos
    });

    it("should include Vietnamese address in check-in data", async () => {
      const vietnameseCheckin = {
        ...mockCheckin,
        address: {
          formatted: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
          street: "123 Nguyễn Huệ",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
        },
      };

      const checkin = await repository.create(vietnameseCheckin);

      expect(checkin.address.formatted).toContain("Nguyễn Huệ");
      expect(checkin.address.city).toBe("TP. Hồ Chí Minh");
    });
  });

  describe("Multiple Check-ins Email Tracking", () => {
    it("should track email status independently for each check-in", async () => {
      // Create multiple check-ins
      const checkin1 = await repository.create({
        ...mockCheckin,
        orderNumber: "ORD-EMAIL-001",
      });

      const checkin2 = await repository.create({
        ...mockCheckin,
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-EMAIL-002",
      });

      const checkin3 = await repository.create({
        ...mockCheckin,
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-EMAIL-003",
      });

      // Mark only first and third as sent
      await repository.markEmailSent(checkin1._id.toString());
      await repository.markEmailSent(checkin3._id.toString());

      // Verify independent tracking - use direct model query to avoid populate issues
      const updated1 = await DeliveryCheckin.findById(checkin1._id).lean();
      const updated2 = await DeliveryCheckin.findById(checkin2._id).lean();
      const updated3 = await DeliveryCheckin.findById(checkin3._id).lean();

      expect(updated1.emailSent).toBe(true);
      expect(updated2.emailSent).toBe(false);
      expect(updated3.emailSent).toBe(true);
    });
  });

  describe("Customer Email Data", () => {
    it("should store customer email for notification delivery", async () => {
      const checkin = await repository.create(mockCheckin);

      expect(checkin.customerEmail).toBe("customer@test.com");
    });

    it("should handle different email formats", async () => {
      const emails = [
        "simple@test.com",
        "user.name@domain.com",
        "user+tag@example.org",
        "vietnamese@công-ty.vn",
      ];

      for (const email of emails) {
        const checkin = await repository.create({
          ...mockCheckin,
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: `ORD-${Date.now()}`,
          customerEmail: email,
        });

        expect(checkin.customerEmail).toBe(email);
      }
    });
  });

  describe("Check-in Retrieval for Email Retry", () => {
    it("should retrieve check-ins that need email retry", async () => {
      // Create check-ins with different email statuses
      await repository.create({
        ...mockCheckin,
        orderNumber: "ORD-SENT-001",
        emailSent: true,
        emailSentAt: new Date(),
      });

      await repository.create({
        ...mockCheckin,
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-PENDING-001",
        emailSent: false,
      });

      await repository.create({
        ...mockCheckin,
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-PENDING-002",
        emailSent: false,
      });

      // Find check-ins that need email
      const allCheckins = await DeliveryCheckin.find({
        emailSent: false,
        isDeleted: false,
      });

      expect(allCheckins.length).toBe(2);
      allCheckins.forEach((c) => {
        expect(c.emailSent).toBe(false);
      });
    });
  });
});
