// Property Test: Thread Participants
// Feature: delivery-checkin-system, Property 13: Thread Participants

import fc from "fast-check";
import mongoose from "mongoose";
import { ThreadIntegrationService } from "../thread-integration.service.js";

/**
 * Custom arbitrary to generate valid MongoDB ObjectId hex strings
 * ObjectId is 24 hex characters (12 bytes)
 */
const objectIdHexArb = () =>
  fc
    .array(
      fc.integer({ min: 0, max: 15 }).map((n) => n.toString(16)),
      { minLength: 24, maxLength: 24 }
    )
    .map((arr) => arr.join(""));

describe("Property 13: Thread Participants", () => {
  let service;

  beforeAll(() => {
    service = new ThreadIntegrationService();
  });

  /**
   * Property: For any check-in thread, both the customer and shipper
   * SHALL be added as thread participants.
   *
   * Validates: Requirements 3.6
   */
  test("thread includes both customer and shipper as participants", () => {
    fc.assert(
      fc.property(
        objectIdHexArb(),
        objectIdHexArb(),
        fc
          .string({ minLength: 5, maxLength: 20 })
          .filter((s) => s.trim() && /^[A-Z0-9-]+$/i.test(s)),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim()),
        fc.string({ minLength: 5, maxLength: 200 }).filter((s) => s.trim()),
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),

        (
          shipperIdHex,
          customerIdHex,
          orderNumber,
          shipperName,
          address,
          checkinAt
        ) => {
          // Create valid ObjectIds from hex strings
          const shipperId = new mongoose.Types.ObjectId(shipperIdHex);
          const customerId = new mongoose.Types.ObjectId(customerIdHex);

          const checkin = {
            _id: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId(),
            orderNumber,
            shipperId,
            shipperName,
            customerId,
            customerEmail: "customer@example.com",
            address: { formatted: address },
            checkinAt,
            notes: "",
            gpsMetadata: {},
            location: { type: "Point", coordinates: [106.0, 10.0] },
            photos: [],
          };

          const threadData = service.prepareThreadData(checkin);

          // Assert: participants array is defined and has exactly 2 members
          expect(threadData.participants).toBeDefined();
          expect(threadData.participants).toHaveLength(2);

          // Assert: shipper is a participant with correct role
          const shipperParticipant = threadData.participants.find(
            (p) => p.userId.toString() === shipperId.toString()
          );
          expect(shipperParticipant).toBeDefined();
          expect(shipperParticipant.role).toBe("member");
          expect(shipperParticipant.isVisible).toBe(true);
          expect(shipperParticipant.joinedAt).toBeInstanceOf(Date);

          // Assert: customer is a participant with correct role
          const customerParticipant = threadData.participants.find(
            (p) => p.userId.toString() === customerId.toString()
          );
          expect(customerParticipant).toBeDefined();
          expect(customerParticipant.role).toBe("member");
          expect(customerParticipant.isVisible).toBe(true);
          expect(customerParticipant.joinedAt).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any check-in, the thread data SHALL include GPS coordinates
   * embedded in the thread metadata.
   *
   * Validates: Requirements 3.4
   */
  test("thread metadata includes GPS coordinates", () => {
    fc.assert(
      fc.property(
        // Generate random longitude (-180 to 180)
        fc.float({ min: -180, max: 180, noNaN: true }),
        // Generate random latitude (-90 to 90)
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc
          .string({ minLength: 5, maxLength: 20 })
          .filter((s) => s.trim() && /^[A-Z0-9-]+$/i.test(s)),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim()),
        fc.string({ minLength: 5, maxLength: 200 }).filter((s) => s.trim()),

        (longitude, latitude, orderNumber, shipperName, address) => {
          const checkin = {
            _id: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId(),
            orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: "customer@example.com",
            address: { formatted: address },
            checkinAt: new Date(),
            notes: "",
            gpsMetadata: {},
            location: { type: "Point", coordinates: [longitude, latitude] },
            photos: [],
          };

          const threadData = service.prepareThreadData(checkin);

          // Assert: GPS coordinates are embedded in metadata
          expect(threadData.context).toBeDefined();
          expect(threadData.context.metadata).toBeDefined();
          expect(threadData.context.metadata.location).toBeDefined();
          expect(threadData.context.metadata.location.type).toBe("Point");
          expect(threadData.context.metadata.location.coordinates).toEqual([
            longitude,
            latitude,
          ]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
