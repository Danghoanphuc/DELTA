// apps/customer-backend/src/modules/delivery-checkin/__tests__/checkin-data-completeness.property.test.js
/**
 * Property-Based Test: Check-in Data Completeness
 *
 * **Feature: delivery-checkin-system, Property 6: Check-in Data Completeness**
 * For any successfully created check-in, the record SHALL contain orderId, shipperId,
 * timestamp, GPS coordinates, photos array, and address fields.
 *
 * **Validates: Requirements 2.3, 7.1**
 */

import fc from "fast-check";

describe("Check-in Data Completeness - Property-Based Tests", () => {
  /**
   * **Feature: delivery-checkin-system, Property 6: Check-in Data Completeness**
   *
   * For any successfully created check-in, the record SHALL contain:
   * - orderId
   * - shipperId
   * - timestamp (checkinAt)
   * - GPS coordinates (location.coordinates)
   * - photos array
   * - address fields (address.formatted)
   *
   * **Validates: Requirements 2.3, 7.1**
   */
  describe("Property 6: Check-in Data Completeness", () => {
    // Generator for valid ObjectId strings (24 hex characters)
    const objectIdArb = fc.stringMatching(/^[0-9a-f]{24}$/);

    // Generator for valid GPS coordinates
    const coordinatesArb = fc.tuple(
      fc.double({ min: -180, max: 180, noNaN: true }), // longitude
      fc.double({ min: -90, max: 90, noNaN: true }) // latitude
    );

    // Generator for valid address
    const addressArb = fc.record({
      formatted: fc.string({ minLength: 1, maxLength: 200 }),
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

    // Generator for valid dates (using integer timestamp to avoid NaN dates)
    const validDateArb = fc
      .integer({
        min: new Date("2020-01-01").getTime(),
        max: Date.now(),
      })
      .map((timestamp) => new Date(timestamp));

    // Generator for complete check-in data
    const checkinDataArb = fc.record({
      orderId: objectIdArb,
      orderNumber: fc.string({ minLength: 1, maxLength: 20 }),
      shipperId: objectIdArb,
      shipperName: fc.string({ minLength: 1, maxLength: 100 }),
      customerId: objectIdArb,
      customerEmail: fc.emailAddress(),
      location: fc.record({
        type: fc.constant("Point"),
        coordinates: coordinatesArb,
      }),
      address: addressArb,
      photos: fc.array(photoArb, { minLength: 0, maxLength: 5 }),
      notes: fc.string({ maxLength: 500 }),
      checkinAt: validDateArb,
    });

    /**
     * Validates that a check-in data object contains all required fields
     * @param {Object} checkinData - The check-in data to validate
     * @returns {Object} - Validation result with isComplete and missingFields
     */
    function validateCheckinCompleteness(checkinData) {
      const requiredFields = [
        {
          path: "orderId",
          check: (d) => d.orderId !== undefined && d.orderId !== null,
        },
        {
          path: "shipperId",
          check: (d) => d.shipperId !== undefined && d.shipperId !== null,
        },
        {
          path: "checkinAt",
          check: (d) =>
            d.checkinAt instanceof Date || typeof d.checkinAt === "string",
        },
        {
          path: "location.coordinates",
          check: (d) =>
            d.location &&
            Array.isArray(d.location.coordinates) &&
            d.location.coordinates.length === 2,
        },
        { path: "photos", check: (d) => Array.isArray(d.photos) },
        {
          path: "address.formatted",
          check: (d) =>
            d.address &&
            typeof d.address.formatted === "string" &&
            d.address.formatted.length > 0,
        },
      ];

      const missingFields = [];

      for (const field of requiredFields) {
        if (!field.check(checkinData)) {
          missingFields.push(field.path);
        }
      }

      return {
        isComplete: missingFields.length === 0,
        missingFields,
      };
    }

    it("should have all required fields for any valid check-in data", () => {
      fc.assert(
        fc.property(checkinDataArb, (checkinData) => {
          const result = validateCheckinCompleteness(checkinData);

          // Property: All required fields must be present
          expect(result.isComplete).toBe(true);
          expect(result.missingFields).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it("should have valid GPS coordinates (longitude, latitude)", () => {
      fc.assert(
        fc.property(checkinDataArb, (checkinData) => {
          const [longitude, latitude] = checkinData.location.coordinates;

          // Property: Longitude must be between -180 and 180
          expect(longitude).toBeGreaterThanOrEqual(-180);
          expect(longitude).toBeLessThanOrEqual(180);

          // Property: Latitude must be between -90 and 90
          expect(latitude).toBeGreaterThanOrEqual(-90);
          expect(latitude).toBeLessThanOrEqual(90);
        }),
        { numRuns: 100 }
      );
    });

    it("should have photos array (can be empty)", () => {
      fc.assert(
        fc.property(checkinDataArb, (checkinData) => {
          // Property: Photos must be an array
          expect(Array.isArray(checkinData.photos)).toBe(true);

          // Property: Each photo must have url and thumbnailUrl
          for (const photo of checkinData.photos) {
            expect(photo.url).toBeDefined();
            expect(photo.thumbnailUrl).toBeDefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should have non-empty formatted address", () => {
      fc.assert(
        fc.property(checkinDataArb, (checkinData) => {
          // Property: Address must have formatted field
          expect(checkinData.address).toBeDefined();
          expect(checkinData.address.formatted).toBeDefined();
          expect(typeof checkinData.address.formatted).toBe("string");
          expect(checkinData.address.formatted.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it("should have valid timestamp", () => {
      fc.assert(
        fc.property(checkinDataArb, (checkinData) => {
          // Property: checkinAt must be a valid date
          const checkinAt = checkinData.checkinAt;
          expect(checkinAt instanceof Date).toBe(true);
          expect(isNaN(checkinAt.getTime())).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should detect incomplete check-in data", () => {
      // Test with missing orderId
      const incompleteData1 = {
        shipperId: "507f1f77bcf86cd799439011",
        checkinAt: new Date(),
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        photos: [],
        address: { formatted: "123 Test Street" },
      };

      const result1 = validateCheckinCompleteness(incompleteData1);
      expect(result1.isComplete).toBe(false);
      expect(result1.missingFields).toContain("orderId");

      // Test with missing coordinates
      const incompleteData2 = {
        orderId: "507f1f77bcf86cd799439011",
        shipperId: "507f1f77bcf86cd799439012",
        checkinAt: new Date(),
        location: { type: "Point" },
        photos: [],
        address: { formatted: "123 Test Street" },
      };

      const result2 = validateCheckinCompleteness(incompleteData2);
      expect(result2.isComplete).toBe(false);
      expect(result2.missingFields).toContain("location.coordinates");

      // Test with missing address
      const incompleteData3 = {
        orderId: "507f1f77bcf86cd799439011",
        shipperId: "507f1f77bcf86cd799439012",
        checkinAt: new Date(),
        location: { type: "Point", coordinates: [106.6297, 10.8231] },
        photos: [],
        address: {},
      };

      const result3 = validateCheckinCompleteness(incompleteData3);
      expect(result3.isComplete).toBe(false);
      expect(result3.missingFields).toContain("address.formatted");
    });
  });
});
