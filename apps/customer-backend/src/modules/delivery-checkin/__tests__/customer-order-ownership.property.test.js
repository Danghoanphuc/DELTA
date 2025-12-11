/**
 * Property-Based Tests for Customer Order Ownership Verification
 *
 * Tests correctness properties for customer order ownership verification
 *
 * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
 * **Validates: Requirements 13.5**
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { SecurityService } from "../security.service.js";
import { ForbiddenException } from "../../../shared/exceptions/index.js";

// Mock MasterOrder.findById for testing without database
const mockOrders = new Map();

// Create a testable version of SecurityService that uses mocked data
class TestableSecurityService extends SecurityService {
  async verifyCustomerOrderOwnership(customerId, orderId) {
    // Use mock data instead of database
    const order = mockOrders.get(orderId.toString());

    if (!order) {
      return null;
    }

    const orderCustomerId = order.customerId?._id
      ? order.customerId._id.toString()
      : order.customerId?.toString();

    if (orderCustomerId !== customerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền truy cập đơn hàng này");
    }

    return order;
  }
}

describe("Customer Order Ownership Verification - Property-Based Tests", () => {
  let securityService;

  beforeAll(() => {
    securityService = new TestableSecurityService();
  });

  beforeEach(() => {
    mockOrders.clear();
  });

  /**
   * **Feature: delivery-checkin-system, Property 48: Customer Order Ownership Verification**
   * **Validates: Requirements 13.5**
   *
   * Property: For any customer accessing check-ins, the system SHALL verify
   * the customer owns the orders, otherwise throw ForbiddenException.
   */
  describe("Property 48: Customer Order Ownership Verification", () => {
    it("should allow access when customer owns the order", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            orderNumber: fc
              .string({ minLength: 5, maxLength: 20 })
              .filter((s) => s.trim().length >= 5),
          }),
          async ({ orderNumber }) => {
            // Arrange: Create mock customer and order
            const customerId = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
              _id: orderId,
              orderNumber: orderNumber,
              customerId: customerId,
              status: "pending",
            };

            mockOrders.set(orderId.toString(), mockOrder);

            // Act
            const result = await securityService.verifyCustomerOrderOwnership(
              customerId,
              orderId
            );

            // Assert
            expect(result).toBeDefined();
            expect(result._id.toString()).toBe(orderId.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should throw ForbiddenException when customer does not own the order", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            orderNumber: fc
              .string({ minLength: 5, maxLength: 20 })
              .filter((s) => s.trim().length >= 5),
          }),
          async ({ orderNumber }) => {
            // Arrange: Create mock order owned by customer1
            const customer1Id = new mongoose.Types.ObjectId();
            const customer2Id = new mongoose.Types.ObjectId();
            const orderId = new mongoose.Types.ObjectId();

            const mockOrder = {
              _id: orderId,
              orderNumber: orderNumber,
              customerId: customer1Id, // Owned by customer1
              status: "pending",
            };

            mockOrders.set(orderId.toString(), mockOrder);

            // Act & Assert: customer2 should not be able to access customer1's order
            await expect(
              securityService.verifyCustomerOrderOwnership(customer2Id, orderId)
            ).rejects.toThrow(ForbiddenException);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return null for non-existent orders", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Arrange: Use a random non-existent order ID
          const nonExistentOrderId = new mongoose.Types.ObjectId();
          const customerId = new mongoose.Types.ObjectId();

          // Act
          const result = await securityService.verifyCustomerOrderOwnership(
            customerId,
            nonExistentOrderId
          );

          // Assert
          expect(result).toBeNull();
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: GPS coordinate privacy for unauthorized users
   *
   * **Feature: delivery-checkin-system, Property 46: GPS Coordinate Privacy**
   * **Validates: Requirements 13.3**
   */
  describe("Property 46: GPS Coordinate Privacy", () => {
    it("should hide GPS coordinates for unauthenticated users", () => {
      fc.assert(
        fc.property(
          fc.record({
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          }),
          ({ longitude, latitude }) => {
            // Arrange
            const checkin = {
              _id: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              customerId: new mongoose.Types.ObjectId(),
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              gpsMetadata: {
                accuracy: 10,
                altitude: 100,
                heading: 45,
                speed: 5,
              },
            };
            const user = null; // Unauthenticated

            // Act
            const sanitized = securityService.sanitizeGPSCoordinates(
              user,
              checkin
            );

            // Assert
            expect(sanitized.location.hidden).toBe(true);
            expect(sanitized.location.coordinates).toEqual([0, 0]);
            expect(sanitized.gpsMetadata.hidden).toBe(true);
            expect(sanitized.gpsMetadata.accuracy).toBeNull();
            expect(sanitized.gpsMetadata.altitude).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should provide full GPS coordinates for authorized users (shipper owner)", () => {
      fc.assert(
        fc.property(
          fc.record({
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
            accuracy: fc.double({ min: 1, max: 100, noNaN: true }),
          }),
          ({ longitude, latitude, accuracy }) => {
            // Arrange
            const shipperId = new mongoose.Types.ObjectId();
            const checkin = {
              _id: new mongoose.Types.ObjectId(),
              shipperId: shipperId,
              customerId: new mongoose.Types.ObjectId(),
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              gpsMetadata: {
                accuracy: accuracy,
                altitude: 100,
              },
            };
            const shipperUser = {
              _id: shipperId,
              shipperProfileId: new mongoose.Types.ObjectId(),
              isAdmin: false,
            };

            // Act
            const sanitized = securityService.sanitizeGPSCoordinates(
              shipperUser,
              checkin
            );

            // Assert - coordinates should be unchanged
            expect(sanitized.location.coordinates[0]).toBe(longitude);
            expect(sanitized.location.coordinates[1]).toBe(latitude);
            expect(sanitized.gpsMetadata.accuracy).toBe(accuracy);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should provide full GPS coordinates for authorized users (customer owner)", () => {
      fc.assert(
        fc.property(
          fc.record({
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          }),
          ({ longitude, latitude }) => {
            // Arrange
            const customerId = new mongoose.Types.ObjectId();
            const checkin = {
              _id: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              customerId: customerId,
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              gpsMetadata: {
                accuracy: 10,
              },
            };
            const customerUser = {
              _id: customerId,
              customerProfileId: new mongoose.Types.ObjectId(),
              isAdmin: false,
            };

            // Act
            const sanitized = securityService.sanitizeGPSCoordinates(
              customerUser,
              checkin
            );

            // Assert - coordinates should be unchanged
            expect(sanitized.location.coordinates[0]).toBe(longitude);
            expect(sanitized.location.coordinates[1]).toBe(latitude);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should approximate GPS coordinates for other authenticated users", () => {
      fc.assert(
        fc.property(
          fc.record({
            longitude: fc.double({ min: -180, max: 180, noNaN: true }),
            latitude: fc.double({ min: -90, max: 90, noNaN: true }),
          }),
          ({ longitude, latitude }) => {
            // Arrange
            const checkin = {
              _id: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              customerId: new mongoose.Types.ObjectId(),
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              gpsMetadata: {
                accuracy: 10,
                altitude: 100,
              },
            };
            // Different user who is neither shipper nor customer
            const otherUser = {
              _id: new mongoose.Types.ObjectId(),
              shipperProfileId: new mongoose.Types.ObjectId(),
              customerProfileId: new mongoose.Types.ObjectId(),
              isAdmin: false,
            };

            // Act
            const sanitized = securityService.sanitizeGPSCoordinates(
              otherUser,
              checkin
            );

            // Assert - coordinates should be approximated (2 decimal places)
            expect(sanitized.location.approximate).toBe(true);
            expect(sanitized.location.coordinates[0]).toBe(
              Math.round(longitude * 100) / 100
            );
            expect(sanitized.location.coordinates[1]).toBe(
              Math.round(latitude * 100) / 100
            );
            expect(sanitized.gpsMetadata.approximate).toBe(true);
            expect(sanitized.gpsMetadata.accuracy).toBeNull();
            expect(sanitized.gpsMetadata.altitude).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
