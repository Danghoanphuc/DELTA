/**
 * Property-Based Tests for Geospatial Bounds Query
 *
 * Tests correctness properties for geographic bounds filtering of check-ins
 */

import fc from "fast-check";
import { DeliveryCheckin } from "../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../delivery-checkin.repository.js";
import mongoose from "mongoose";

describe("Geospatial Bounds Query - Property-Based Tests", () => {
  let repository;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag-test";

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    repository = new DeliveryCheckinRepository();
  });

  afterAll(async () => {
    // Clean up and close connection
    await DeliveryCheckin.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    // Clean up before each test
    await DeliveryCheckin.deleteMany({});
  });

  /**
   * **Feature: delivery-checkin-system, Property 26: Geospatial Bounds Query**
   * **Validates: Requirements 7.6**
   *
   * Property: For any geographic bounds query, the returned check-ins SHALL have GPS coordinates
   * within the specified minLng, minLat, maxLng, maxLat bounds.
   */
  describe("Property 26: Geospatial Bounds Query", () => {
    /**
     * Custom arbitrary for valid longitude (-180 to 180)
     */
    const longitude = () => fc.double({ min: -180, max: 180, noNaN: true });

    /**
     * Custom arbitrary for valid latitude (-90 to 90)
     */
    const latitude = () => fc.double({ min: -90, max: 90, noNaN: true });

    /**
     * Custom arbitrary for valid geographic bounds
     * Ensures minLng < maxLng and minLat < maxLat
     */
    const geographicBounds = () =>
      fc
        .tuple(longitude(), longitude(), latitude(), latitude())
        .filter(([lng1, lng2, lat1, lat2]) => {
          // Ensure valid bounds (min < max)
          return lng1 < lng2 && lat1 < lat2;
        })
        .map(([lng1, lng2, lat1, lat2]) => ({
          minLng: lng1,
          maxLng: lng2,
          minLat: lat1,
          maxLat: lat2,
        }));

    /**
     * Custom arbitrary for coordinates within specific bounds
     */
    const coordinatesWithinBounds = (bounds) =>
      fc.record({
        lng: fc.double({
          min: bounds.minLng,
          max: bounds.maxLng,
          noNaN: true,
        }),
        lat: fc.double({
          min: bounds.minLat,
          max: bounds.maxLat,
          noNaN: true,
        }),
      });

    /**
     * Custom arbitrary for coordinates outside specific bounds
     */
    const coordinatesOutsideBounds = (bounds) => {
      const generators = [];

      // Longitude too low (if possible)
      if (bounds.minLng > -180 && bounds.minLng - 0.001 >= -180) {
        generators.push(
          fc.record({
            lng: fc.double({
              min: -180,
              max: bounds.minLng - 0.001,
              noNaN: true,
            }),
            lat: latitude(),
          })
        );
      }

      // Longitude too high (if possible)
      if (bounds.maxLng < 180 && bounds.maxLng + 0.001 <= 180) {
        generators.push(
          fc.record({
            lng: fc.double({
              min: bounds.maxLng + 0.001,
              max: 180,
              noNaN: true,
            }),
            lat: latitude(),
          })
        );
      }

      // Latitude too low (if possible)
      if (bounds.minLat > -90 && bounds.minLat - 0.001 >= -90) {
        generators.push(
          fc.record({
            lng: longitude(),
            lat: fc.double({
              min: -90,
              max: bounds.minLat - 0.001,
              noNaN: true,
            }),
          })
        );
      }

      // Latitude too high (if possible)
      if (bounds.maxLat < 90 && bounds.maxLat + 0.001 <= 90) {
        generators.push(
          fc.record({
            lng: longitude(),
            lat: fc.double({
              min: bounds.maxLat + 0.001,
              max: 90,
              noNaN: true,
            }),
          })
        );
      }

      // If no generators are possible (bounds cover entire world), return a constant
      if (generators.length === 0) {
        return fc.constant({ lng: 0, lat: 0 }).filter(() => false); // Always fails filter
      }

      return fc.oneof(...generators).filter((coords) => {
        // Ensure coordinates are actually outside bounds
        return (
          coords.lng < bounds.minLng ||
          coords.lng > bounds.maxLng ||
          coords.lat < bounds.minLat ||
          coords.lat > bounds.maxLat
        );
      });
    };

    it("should return only check-ins within specified bounds", async () => {
      await fc.assert(
        fc.asyncProperty(
          geographicBounds(),
          fc.array(
            coordinatesWithinBounds({
              minLng: -180,
              maxLng: 180,
              minLat: -90,
              maxLat: 90,
            }),
            {
              minLength: 1,
              maxLength: 20,
            }
          ),
          async (bounds, allCoordinates) => {
            // Arrange: Create check-ins with various coordinates
            const checkins = [];

            for (const coords of allCoordinates) {
              const checkin = await DeliveryCheckin.create({
                orderId: new mongoose.Types.ObjectId(),
                orderNumber: `ORD-${Date.now()}-${Math.random()}`,
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper",
                customerId: new mongoose.Types.ObjectId(),
                customerEmail: "customer@test.com",
                location: {
                  type: "Point",
                  coordinates: [coords.lng, coords.lat],
                },
                address: {
                  formatted: "Test Address",
                },
                photos: [
                  {
                    url: "https://example.com/photo.jpg",
                    thumbnailUrl: "https://example.com/thumb.jpg",
                  },
                ],
                status: "completed",
                isDeleted: false,
              });
              checkins.push({ checkin, coords });
            }

            // Act: Query check-ins within bounds
            const results = await repository.findWithinBounds(bounds);

            // Assert: All returned check-ins should be within bounds
            for (const result of results) {
              const [lng, lat] = result.location.coordinates;

              expect(lng).toBeGreaterThanOrEqual(bounds.minLng);
              expect(lng).toBeLessThanOrEqual(bounds.maxLng);
              expect(lat).toBeGreaterThanOrEqual(bounds.minLat);
              expect(lat).toBeLessThanOrEqual(bounds.maxLat);
            }

            // Assert: Check that we're not missing any check-ins that should be included
            const expectedCount = checkins.filter(({ coords }) => {
              return (
                coords.lng >= bounds.minLng &&
                coords.lng <= bounds.maxLng &&
                coords.lat >= bounds.minLat &&
                coords.lat <= bounds.maxLat
              );
            }).length;

            expect(results.length).toBe(expectedCount);

            // Cleanup
            await DeliveryCheckin.deleteMany({
              _id: { $in: checkins.map((c) => c.checkin._id) },
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should exclude check-ins outside specified bounds", async () => {
      await fc.assert(
        fc.asyncProperty(
          geographicBounds(),
          fc.array(
            coordinatesWithinBounds({
              minLng: -180,
              maxLng: 180,
              minLat: -90,
              maxLat: 90,
            }),
            {
              minLength: 1,
              maxLength: 10,
            }
          ),
          async (bounds, insideCoords) => {
            // Generate outside coordinates based on the bounds
            const outsideCoords = await fc.sample(
              coordinatesOutsideBounds(bounds),
              { numRuns: Math.min(insideCoords.length, 10) }
            );

            // Arrange: Create check-ins inside and outside bounds
            const insideCheckins = [];
            const outsideCheckins = [];

            // Create check-ins inside bounds
            for (const coords of insideCoords) {
              // Only create if coordinates are within bounds
              if (
                coords.lng >= bounds.minLng &&
                coords.lng <= bounds.maxLng &&
                coords.lat >= bounds.minLat &&
                coords.lat <= bounds.maxLat
              ) {
                const checkin = await DeliveryCheckin.create({
                  orderId: new mongoose.Types.ObjectId(),
                  orderNumber: `ORD-IN-${Date.now()}-${Math.random()}`,
                  shipperId: new mongoose.Types.ObjectId(),
                  shipperName: "Test Shipper Inside",
                  customerId: new mongoose.Types.ObjectId(),
                  customerEmail: "inside@test.com",
                  location: {
                    type: "Point",
                    coordinates: [coords.lng, coords.lat],
                  },
                  address: {
                    formatted: "Inside Address",
                  },
                  photos: [
                    {
                      url: "https://example.com/inside.jpg",
                      thumbnailUrl: "https://example.com/inside-thumb.jpg",
                    },
                  ],
                  status: "completed",
                  isDeleted: false,
                });
                insideCheckins.push(checkin);
              }
            }

            // Create check-ins outside bounds
            for (const coords of outsideCoords) {
              const checkin = await DeliveryCheckin.create({
                orderId: new mongoose.Types.ObjectId(),
                orderNumber: `ORD-OUT-${Date.now()}-${Math.random()}`,
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper Outside",
                customerId: new mongoose.Types.ObjectId(),
                customerEmail: "outside@test.com",
                location: {
                  type: "Point",
                  coordinates: [coords.lng, coords.lat],
                },
                address: {
                  formatted: "Outside Address",
                },
                photos: [
                  {
                    url: "https://example.com/outside.jpg",
                    thumbnailUrl: "https://example.com/outside-thumb.jpg",
                  },
                ],
                status: "completed",
                isDeleted: false,
              });
              outsideCheckins.push(checkin);
            }

            // Act: Query check-ins within bounds
            const results = await repository.findWithinBounds(bounds);

            // Assert: Results should only contain inside check-ins
            expect(results.length).toBe(insideCheckins.length);

            // Assert: No outside check-ins should be in results
            const resultIds = results.map((r) => r._id.toString());
            for (const outsideCheckin of outsideCheckins) {
              expect(resultIds).not.toContain(outsideCheckin._id.toString());
            }

            // Assert: All inside check-ins should be in results
            for (const insideCheckin of insideCheckins) {
              expect(resultIds).toContain(insideCheckin._id.toString());
            }

            // Cleanup
            await DeliveryCheckin.deleteMany({
              _id: {
                $in: [
                  ...insideCheckins.map((c) => c._id),
                  ...outsideCheckins.map((c) => c._id),
                ],
              },
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should not return soft-deleted check-ins even if within bounds", async () => {
      await fc.assert(
        fc.asyncProperty(
          geographicBounds(),
          fc.array(
            coordinatesWithinBounds({
              minLng: -180,
              maxLng: 180,
              minLat: -90,
              maxLat: 90,
            }),
            {
              minLength: 2,
              maxLength: 10,
            }
          ),
          async (bounds, allCoords) => {
            // Filter coordinates to only those within bounds
            const coordsInBounds = allCoords.filter(
              (coords) =>
                coords.lng >= bounds.minLng &&
                coords.lng <= bounds.maxLng &&
                coords.lat >= bounds.minLat &&
                coords.lat <= bounds.maxLat
            );

            if (coordsInBounds.length < 2) {
              // Skip if we don't have enough coordinates in bounds
              return;
            }

            // Arrange: Create check-ins within bounds
            const checkins = [];
            for (const coords of coordsInBounds) {
              const checkin = await DeliveryCheckin.create({
                orderId: new mongoose.Types.ObjectId(),
                orderNumber: `ORD-${Date.now()}-${Math.random()}`,
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: "Test Shipper",
                customerId: new mongoose.Types.ObjectId(),
                customerEmail: "customer@test.com",
                location: {
                  type: "Point",
                  coordinates: [coords.lng, coords.lat],
                },
                address: {
                  formatted: "Test Address",
                },
                photos: [
                  {
                    url: "https://example.com/photo.jpg",
                    thumbnailUrl: "https://example.com/thumb.jpg",
                  },
                ],
                status: "completed",
                isDeleted: false,
              });
              checkins.push(checkin);
            }

            // Soft delete half of the check-ins
            const toDelete = checkins.slice(0, Math.floor(checkins.length / 2));
            for (const checkin of toDelete) {
              await repository.delete(
                checkin._id.toString(),
                new mongoose.Types.ObjectId().toString()
              );
            }

            // Act: Query check-ins within bounds
            const results = await repository.findWithinBounds(bounds);

            // Assert: Results should not contain deleted check-ins
            const resultIds = results.map((r) => r._id.toString());
            for (const deletedCheckin of toDelete) {
              expect(resultIds).not.toContain(deletedCheckin._id.toString());
            }

            // Assert: Results should contain non-deleted check-ins
            const notDeleted = checkins.slice(Math.floor(checkins.length / 2));
            expect(results.length).toBe(notDeleted.length);

            // Cleanup
            await DeliveryCheckin.deleteMany({
              _id: { $in: checkins.map((c) => c._id) },
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of bounds at coordinate extremes", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            // Test various extreme bounds
            { minLng: -180, maxLng: -170, minLat: -90, maxLat: -80 }, // Southwest corner
            { minLng: 170, maxLng: 180, minLat: -90, maxLat: -80 }, // Southeast corner
            { minLng: -180, maxLng: -170, minLat: 80, maxLat: 90 }, // Northwest corner
            { minLng: 170, maxLng: 180, minLat: 80, maxLat: 90 }, // Northeast corner
            { minLng: -10, maxLng: 10, minLat: -10, maxLat: 10 } // Around equator/prime meridian
          ),
          async (bounds) => {
            // Arrange: Create check-ins at various locations
            const testCoords = [
              {
                lng: (bounds.minLng + bounds.maxLng) / 2,
                lat: (bounds.minLat + bounds.maxLat) / 2,
              }, // Center
              { lng: bounds.minLng + 0.001, lat: bounds.minLat + 0.001 }, // Just inside min corner
              { lng: bounds.maxLng - 0.001, lat: bounds.maxLat - 0.001 }, // Just inside max corner
              { lng: bounds.minLng - 0.001, lat: bounds.minLat - 0.001 }, // Just outside min corner
              { lng: bounds.maxLng + 0.001, lat: bounds.maxLat + 0.001 }, // Just outside max corner
            ];

            const checkins = [];
            for (const coords of testCoords) {
              // Only create if coordinates are valid
              if (
                coords.lng >= -180 &&
                coords.lng <= 180 &&
                coords.lat >= -90 &&
                coords.lat <= 90
              ) {
                const checkin = await DeliveryCheckin.create({
                  orderId: new mongoose.Types.ObjectId(),
                  orderNumber: `ORD-EDGE-${Date.now()}-${Math.random()}`,
                  shipperId: new mongoose.Types.ObjectId(),
                  shipperName: "Test Shipper",
                  customerId: new mongoose.Types.ObjectId(),
                  customerEmail: "edge@test.com",
                  location: {
                    type: "Point",
                    coordinates: [coords.lng, coords.lat],
                  },
                  address: {
                    formatted: "Edge Case Address",
                  },
                  photos: [
                    {
                      url: "https://example.com/edge.jpg",
                      thumbnailUrl: "https://example.com/edge-thumb.jpg",
                    },
                  ],
                  status: "completed",
                  isDeleted: false,
                });
                checkins.push({ checkin, coords });
              }
            }

            // Act: Query check-ins within bounds
            const results = await repository.findWithinBounds(bounds);

            // Assert: Only check-ins within bounds should be returned
            for (const result of results) {
              const [lng, lat] = result.location.coordinates;
              expect(lng).toBeGreaterThanOrEqual(bounds.minLng);
              expect(lng).toBeLessThanOrEqual(bounds.maxLng);
              expect(lat).toBeGreaterThanOrEqual(bounds.minLat);
              expect(lat).toBeLessThanOrEqual(bounds.maxLat);
            }

            // Cleanup
            await DeliveryCheckin.deleteMany({
              _id: { $in: checkins.map((c) => c.checkin._id) },
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return empty array when no check-ins exist within bounds", async () => {
      await fc.assert(
        fc.asyncProperty(geographicBounds(), async (bounds) => {
          // Arrange: Ensure no check-ins exist
          await DeliveryCheckin.deleteMany({});

          // Act: Query check-ins within bounds
          const results = await repository.findWithinBounds(bounds);

          // Assert: Should return empty array
          expect(results).toEqual([]);
          expect(results.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });
  });
});
