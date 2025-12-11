/**
 * Property-Based Tests for GPS Accuracy Validation
 *
 * Tests correctness properties for GPS coordinate accuracy validation
 */

import fc from "fast-check";
import { GoongGeocodingService } from "../../../services/goong-geocoding.service.js";

describe("GPS Accuracy Validation - Property-Based Tests", () => {
  let service;

  beforeAll(() => {
    service = new GoongGeocodingService();
  });

  /**
   * **Feature: delivery-checkin-system, Property 15: GPS Accuracy Validation**
   * **Validates: Requirements 4.3**
   *
   * Property: For any GPS coordinates with accuracy below 50 meters, the system SHALL accept
   * the coordinates as valid.
   */
  describe("Property 15: GPS Accuracy Validation", () => {
    /**
     * Custom arbitrary for valid latitude (-90 to 90)
     */
    const latitude = () => fc.double({ min: -90, max: 90, noNaN: true });

    /**
     * Custom arbitrary for valid longitude (-180 to 180)
     */
    const longitude = () => fc.double({ min: -180, max: 180, noNaN: true });

    /**
     * Custom arbitrary for GPS accuracy below threshold (0 to 50 meters)
     */
    const accuracyBelowThreshold = () =>
      fc.double({ min: 0, max: 50, noNaN: true, noDefaultInfinity: true });

    /**
     * Custom arbitrary for GPS accuracy above threshold (50.001 to 1000 meters)
     */
    const accuracyAboveThreshold = () =>
      fc.double({
        min: 50.001,
        max: 1000,
        noNaN: true,
        noDefaultInfinity: true,
      });

    it("should accept coordinates with accuracy below 50 meters as valid", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
            accuracy: accuracyBelowThreshold(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid with no warning
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeNull();
            expect(result.accuracy).toBe(gpsData.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should accept coordinates with accuracy above 50 meters but provide warning", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
            accuracy: accuracyAboveThreshold(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid but with warning
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeTruthy();
            expect(result.warning).toContain("Độ chính xác GPS thấp");
            expect(result.warning).toContain(
              `${Math.round(gpsData.accuracy)}m`
            );
            expect(result.accuracy).toBe(gpsData.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should accept coordinates with no accuracy data but provide warning", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates without accuracy
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid but with warning
            expect(result.isValid).toBe(true);
            expect(result.warning).toBe("Không có thông tin độ chính xác GPS");
            expect(result.accuracy).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject coordinates with invalid latitude range", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: fc.oneof(
              fc.double({ min: -1000, max: -90.001, noNaN: true }),
              fc.double({ min: 90.001, max: 1000, noNaN: true })
            ),
            longitude: longitude(),
            accuracy: accuracyBelowThreshold(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates with invalid latitude
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be invalid
            expect(result.isValid).toBe(false);
            expect(result.warning).toBe("Tọa độ GPS không hợp lệ");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject coordinates with invalid longitude range", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: fc.oneof(
              fc.double({ min: -1000, max: -180.001, noNaN: true }),
              fc.double({ min: 180.001, max: 1000, noNaN: true })
            ),
            accuracy: accuracyBelowThreshold(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates with invalid longitude
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be invalid
            expect(result.isValid).toBe(false);
            expect(result.warning).toBe("Tọa độ GPS không hợp lệ");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of exactly 50 meters accuracy", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
          }),
          async (coords) => {
            // Arrange: GPS data with exactly 50 meters accuracy
            const gpsData = {
              ...coords,
              accuracy: 50,
            };

            // Act: Validate coordinates
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid with no warning (50 is at threshold)
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeNull();
            expect(result.accuracy).toBe(50);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of just above 50 meters accuracy", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
          }),
          async (coords) => {
            // Arrange: GPS data with just above 50 meters accuracy
            const gpsData = {
              ...coords,
              accuracy: 50.001,
            };

            // Act: Validate coordinates
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid but with warning
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeTruthy();
            expect(result.warning).toContain("Độ chính xác GPS thấp");
            expect(result.accuracy).toBe(50.001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of coordinates at latitude extremes", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: fc.constantFrom(-90, 90),
            longitude: longitude(),
            accuracy: accuracyBelowThreshold(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates at latitude extremes
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeNull();
            expect(result.accuracy).toBe(gpsData.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of coordinates at longitude extremes", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: fc.constantFrom(-180, 180),
            accuracy: accuracyBelowThreshold(),
          }),
          async (gpsData) => {
            // Act: Validate coordinates at longitude extremes
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeNull();
            expect(result.accuracy).toBe(gpsData.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle very high accuracy values (poor GPS signal)", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
            accuracy: fc.double({
              min: 100,
              max: 10000,
              noNaN: true,
              noDefaultInfinity: true,
            }),
          }),
          async (gpsData) => {
            // Act: Validate coordinates with very high accuracy (poor signal)
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid but with warning
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeTruthy();
            expect(result.warning).toContain("Độ chính xác GPS thấp");
            expect(result.accuracy).toBe(gpsData.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle very low accuracy values (excellent GPS signal)", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
            accuracy: fc.double({
              min: 0.001,
              max: 10,
              noNaN: true,
              noDefaultInfinity: true,
            }),
          }),
          async (gpsData) => {
            // Act: Validate coordinates with very low accuracy (excellent signal)
            const result = service.validateCoordinates(gpsData);

            // Assert: Should be valid with no warning
            expect(result.isValid).toBe(true);
            expect(result.warning).toBeNull();
            expect(result.accuracy).toBe(gpsData.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should consistently validate the same coordinates", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            latitude: latitude(),
            longitude: longitude(),
            accuracy: fc.double({
              min: 0,
              max: 1000,
              noNaN: true,
              noDefaultInfinity: true,
            }),
          }),
          async (gpsData) => {
            // Act: Validate same coordinates multiple times
            const result1 = service.validateCoordinates(gpsData);
            const result2 = service.validateCoordinates(gpsData);
            const result3 = service.validateCoordinates(gpsData);

            // Assert: Results should be identical
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
            expect(result1.isValid).toBe(result2.isValid);
            expect(result1.warning).toBe(result2.warning);
            expect(result1.accuracy).toBe(result2.accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return correct accuracy threshold", () => {
      // Act: Get accuracy threshold
      const threshold = service.getAccuracyThreshold();

      // Assert: Should be 50 meters
      expect(threshold).toBe(50);
    });
  });
});
