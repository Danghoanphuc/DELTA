// apps/customer-backend/src/modules/delivery-checkin/__tests__/thread-creation.property.test.js
/**
 * Property-Based Test: Thread Creation on Check-in
 *
 * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
 * For any created check-in, the system SHALL automatically create a corresponding
 * thread with type "delivery_checkin" linked to the order.
 *
 * **Validates: Requirements 3.1, 3.5**
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { ThreadIntegrationService } from "../thread-integration.service.js";

describe("Property 9: Thread Creation on Check-in", () => {
  let service;

  beforeAll(() => {
    service = new ThreadIntegrationService();
  });

  // Generator for valid ObjectId strings (24 hex characters)
  const objectIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);

  // Generator for valid GPS coordinates
  const coordinatesArb = fc.tuple(
    fc.double({ min: 102, max: 110, noNaN: true }), // Vietnam longitude range
    fc.double({ min: 8, max: 24, noNaN: true }) // Vietnam latitude range
  );

  // Generator for valid address
  const addressArb = fc.record({
    formatted: fc
      .string({ minLength: 5, maxLength: 200 })
      .filter((s) => s.trim().length > 0),
    street: fc.string({ maxLength: 100 }),
    ward: fc.string({ maxLength: 100 }),
    district: fc.string({ maxLength: 100 }),
    city: fc.string({ maxLength: 100 }),
    country: fc.constant("Vietnam"),
  });

  // Generator for photo objects
  const photoArb = fc.record({
    url: fc.webUrl(),
    thumbnailUrl: fc.webUrl(),
    filename: fc.string({ minLength: 1, maxLength: 50 }),
    size: fc.integer({ min: 1, max: 5000000 }),
    mimeType: fc.constantFrom("image/jpeg", "image/png", "image/webp"),
    width: fc.integer({ min: 100, max: 4000 }),
    height: fc.integer({ min: 100, max: 4000 }),
  });

  // Generator for valid dates
  const validDateArb = fc
    .integer({
      min: new Date("2020-01-01").getTime(),
      max: Date.now(),
    })
    .map((timestamp) => new Date(timestamp));

  // Generator for complete check-in data
  const checkinDataArb = fc.record({
    _id: objectIdArb.map((id) => new mongoose.Types.ObjectId(id)),
    orderId: objectIdArb.map((id) => new mongoose.Types.ObjectId(id)),
    orderNumber: fc
      .string({ minLength: 5, maxLength: 20 })
      .filter((s) => s.trim().length > 0 && /^[A-Z0-9-]+$/i.test(s)),
    shipperId: objectIdArb.map((id) => new mongoose.Types.ObjectId(id)),
    shipperName: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0),
    customerId: objectIdArb.map((id) => new mongoose.Types.ObjectId(id)),
    customerEmail: fc.emailAddress(),
    location: fc.record({
      type: fc.constant("Point"),
      coordinates: coordinatesArb,
    }),
    address: addressArb,
    photos: fc.array(photoArb, { minLength: 0, maxLength: 5 }),
    notes: fc.string({ maxLength: 500 }),
    checkinAt: validDateArb,
    gpsMetadata: fc.record({
      accuracy: fc.option(fc.double({ min: 0, max: 100, noNaN: true }), {
        nil: undefined,
      }),
    }),
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: For any check-in, prepareThreadData SHALL return thread data
   * that is linked to the order via context.referenceId
   *
   * **Validates: Requirements 3.1**
   */
  it("should create thread data linked to the order for any valid check-in", () => {
    fc.assert(
      fc.property(checkinDataArb, (checkin) => {
        // Act: Prepare thread data
        const threadData = service.prepareThreadData(checkin);

        // Assert: Thread data is created
        expect(threadData).toBeDefined();

        // Assert: Thread is linked to the order via context.referenceId
        expect(threadData.context).toBeDefined();
        expect(threadData.context.referenceId).toBe(checkin.orderId.toString());
        expect(threadData.context.referenceType).toBe("ORDER");

        // Assert: Thread metadata contains checkinId
        expect(threadData.context.metadata).toBeDefined();
        expect(threadData.context.metadata.checkinId).toBe(
          checkin._id.toString()
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: For any check-in, the created thread SHALL have type "delivery_checkin"
   * indicated by the tags array
   *
   * **Validates: Requirements 3.5**
   */
  it("should set thread type as 'delivery_checkin' via tags for any valid check-in", () => {
    fc.assert(
      fc.property(checkinDataArb, (checkin) => {
        // Act: Prepare thread data
        const threadData = service.prepareThreadData(checkin);

        // Assert: Thread has tags array
        expect(threadData.tags).toBeDefined();
        expect(Array.isArray(threadData.tags)).toBe(true);

        // Assert: Tags include "delivery_checkin" type
        expect(threadData.tags).toContain("delivery_checkin");

        // Assert: Tags include "order" for categorization
        expect(threadData.tags).toContain("order");

        // Assert: Tags include the order number for searchability
        expect(threadData.tags).toContain(checkin.orderNumber);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: For any check-in, the thread SHALL have a title containing the order number
   *
   * **Validates: Requirements 3.1**
   */
  it("should create thread with title containing order number", () => {
    fc.assert(
      fc.property(checkinDataArb, (checkin) => {
        // Act: Prepare thread data
        const threadData = service.prepareThreadData(checkin);

        // Assert: Thread has title
        expect(threadData.title).toBeDefined();
        expect(typeof threadData.title).toBe("string");

        // Assert: Title contains order number
        expect(threadData.title).toContain(checkin.orderNumber);

        // Assert: Title follows expected format "Giao hàng - {orderNumber}"
        expect(threadData.title).toBe(`Giao hàng - ${checkin.orderNumber}`);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: For any check-in, the thread metadata SHALL contain GPS coordinates
   *
   * **Validates: Requirements 3.4 (GPS coordinates embedded in metadata)**
   */
  it("should embed GPS coordinates in thread metadata", () => {
    fc.assert(
      fc.property(checkinDataArb, (checkin) => {
        // Act: Prepare thread data
        const threadData = service.prepareThreadData(checkin);

        // Assert: Thread metadata contains location
        expect(threadData.context.metadata.location).toBeDefined();
        expect(threadData.context.metadata.location.type).toBe("Point");
        expect(threadData.context.metadata.location.coordinates).toEqual(
          checkin.location.coordinates
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: For any check-in, the thread metadata SHALL contain the address
   *
   * **Validates: Requirements 3.1**
   */
  it("should include address in thread metadata", () => {
    fc.assert(
      fc.property(checkinDataArb, (checkin) => {
        // Act: Prepare thread data
        const threadData = service.prepareThreadData(checkin);

        // Assert: Thread metadata contains address
        expect(threadData.context.metadata.address).toBeDefined();
        expect(threadData.context.metadata.address).toBe(
          checkin.address.formatted
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: For any check-in, the thread metadata SHALL contain the check-in timestamp
   *
   * **Validates: Requirements 3.1**
   */
  it("should include check-in timestamp in thread metadata", () => {
    fc.assert(
      fc.property(checkinDataArb, (checkin) => {
        // Act: Prepare thread data
        const threadData = service.prepareThreadData(checkin);

        // Assert: Thread metadata contains checkinAt timestamp
        expect(threadData.context.metadata.checkinAt).toBeDefined();
        expect(threadData.context.metadata.checkinAt).toEqual(
          checkin.checkinAt
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 9: Thread Creation on Check-in**
   *
   * Test: Thread data preparation should fail for check-ins missing required fields
   */
  it("should throw ValidationException for check-in missing orderId", () => {
    const invalidCheckin = {
      _id: new mongoose.Types.ObjectId(),
      // orderId is missing
      orderNumber: "ORD-001",
      shipperId: new mongoose.Types.ObjectId(),
      shipperName: "Test Shipper",
      customerId: new mongoose.Types.ObjectId(),
      customerEmail: "test@example.com",
      location: { type: "Point", coordinates: [106.0, 10.0] },
      address: { formatted: "123 Test Street" },
      photos: [],
      notes: "",
      checkinAt: new Date(),
      gpsMetadata: {},
    };

    expect(() => service.prepareThreadData(invalidCheckin)).toThrow(
      "Check-in must have an orderId"
    );
  });

  it("should throw ValidationException for check-in missing shipperId", () => {
    const invalidCheckin = {
      _id: new mongoose.Types.ObjectId(),
      orderId: new mongoose.Types.ObjectId(),
      orderNumber: "ORD-001",
      // shipperId is missing
      shipperName: "Test Shipper",
      customerId: new mongoose.Types.ObjectId(),
      customerEmail: "test@example.com",
      location: { type: "Point", coordinates: [106.0, 10.0] },
      address: { formatted: "123 Test Street" },
      photos: [],
      notes: "",
      checkinAt: new Date(),
      gpsMetadata: {},
    };

    expect(() => service.prepareThreadData(invalidCheckin)).toThrow(
      "Check-in must have a shipperId"
    );
  });

  it("should throw ValidationException for check-in missing customerId", () => {
    const invalidCheckin = {
      _id: new mongoose.Types.ObjectId(),
      orderId: new mongoose.Types.ObjectId(),
      orderNumber: "ORD-001",
      shipperId: new mongoose.Types.ObjectId(),
      shipperName: "Test Shipper",
      // customerId is missing
      customerEmail: "test@example.com",
      location: { type: "Point", coordinates: [106.0, 10.0] },
      address: { formatted: "123 Test Street" },
      photos: [],
      notes: "",
      checkinAt: new Date(),
      gpsMetadata: {},
    };

    expect(() => service.prepareThreadData(invalidCheckin)).toThrow(
      "Check-in must have a customerId"
    );
  });
});
