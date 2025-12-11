/**
 * Property-Based Tests for Photo Access Control
 *
 * Tests correctness properties for photo access control in delivery check-ins
 *
 * **Feature: delivery-checkin-system, Property 45: Photo Access Control**
 * **Validates: Requirements 13.2**
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { SecurityService } from "../security.service.js";
import { UnauthorizedException } from "../../../shared/exceptions/index.js";

// Create mock check-in data
const createMockCheckin = (shipperId, customerId) => ({
  _id: new mongoose.Types.ObjectId(),
  shipperId: shipperId,
  customerId: customerId,
  orderId: new mongoose.Types.ObjectId(),
  orderNumber: "ORD-001",
  photos: [
    {
      url: "https://example.com/photo1.jpg",
      thumbnailUrl: "https://example.com/thumb1.jpg",
      filename: "photo1.jpg",
    },
    {
      url: "https://example.com/photo2.jpg",
      thumbnailUrl: "https://example.com/thumb2.jpg",
      filename: "photo2.jpg",
    },
  ],
  location: {
    type: "Point",
    coordinates: [106.6297, 10.8231],
  },
});

// Create mock user data
const createMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  email: "test@example.com",
  displayName: "Test User",
  isAdmin: false,
  shipperProfileId: null,
  customerProfileId: null,
  ...overrides,
});

describe("Photo Access Control - Property-Based Tests", () => {
  let securityService;

  beforeAll(() => {
    securityService = new SecurityService();
  });

  /**
   * **Feature: delivery-checkin-system, Property 45: Photo Access Control**
   * **Validates: Requirements 13.2**
   *
   * Property: For any unauthenticated request to access check-in photos,
   * the system SHALL deny access with UnauthorizedException.
   */
  describe("Property 45: Photo Access Control", () => {
    it("should deny photo access for unauthenticated users (null user)", () => {
      fc.assert(
        fc.property(
          // Generate random check-in data
          fc.record({
            shipperId: fc.constant(new mongoose.Types.ObjectId()),
            customerId: fc.constant(new mongoose.Types.ObjectId()),
          }),
          ({ shipperId, customerId }) => {
            // Arrange
            const checkin = createMockCheckin(shipperId, customerId);
            const user = null; // Unauthenticated

            // Act & Assert
            expect(() => {
              securityService.verifyPhotoAccess(user, checkin);
            }).toThrow(UnauthorizedException);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should deny photo access for users without _id (invalid user object)", () => {
      fc.assert(
        fc.property(
          fc.record({
            shipperId: fc.constant(new mongoose.Types.ObjectId()),
            customerId: fc.constant(new mongoose.Types.ObjectId()),
          }),
          ({ shipperId, customerId }) => {
            // Arrange
            const checkin = createMockCheckin(shipperId, customerId);
            const user = { email: "test@example.com" }; // No _id

            // Act & Assert
            expect(() => {
              securityService.verifyPhotoAccess(user, checkin);
            }).toThrow(UnauthorizedException);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should allow photo access for admin users", () => {
      fc.assert(
        fc.property(
          fc.record({
            shipperId: fc.constant(new mongoose.Types.ObjectId()),
            customerId: fc.constant(new mongoose.Types.ObjectId()),
          }),
          ({ shipperId, customerId }) => {
            // Arrange
            const checkin = createMockCheckin(shipperId, customerId);
            const adminUser = createMockUser({ isAdmin: true });

            // Act
            const canAccess = securityService.verifyPhotoAccess(
              adminUser,
              checkin
            );

            // Assert
            expect(canAccess).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should allow photo access for shipper who owns the check-in", () => {
      fc.assert(
        fc.property(
          fc.record({
            customerId: fc.constant(new mongoose.Types.ObjectId()),
          }),
          ({ customerId }) => {
            // Arrange
            const shipperId = new mongoose.Types.ObjectId();
            const checkin = createMockCheckin(shipperId, customerId);
            const shipperUser = createMockUser({
              _id: shipperId,
              shipperProfileId: new mongoose.Types.ObjectId(),
            });

            // Act
            const canAccess = securityService.verifyPhotoAccess(
              shipperUser,
              checkin
            );

            // Assert
            expect(canAccess).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should allow photo access for customer who owns the order", () => {
      fc.assert(
        fc.property(
          fc.record({
            shipperId: fc.constant(new mongoose.Types.ObjectId()),
          }),
          ({ shipperId }) => {
            // Arrange
            const customerId = new mongoose.Types.ObjectId();
            const checkin = createMockCheckin(shipperId, customerId);
            const customerUser = createMockUser({
              _id: customerId,
              customerProfileId: new mongoose.Types.ObjectId(),
            });

            // Act
            const canAccess = securityService.verifyPhotoAccess(
              customerUser,
              checkin
            );

            // Assert
            expect(canAccess).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should deny photo access for authenticated users who don't own the check-in or order", () => {
      fc.assert(
        fc.property(
          fc.record({
            shipperId: fc.constant(new mongoose.Types.ObjectId()),
            customerId: fc.constant(new mongoose.Types.ObjectId()),
          }),
          ({ shipperId, customerId }) => {
            // Arrange
            const checkin = createMockCheckin(shipperId, customerId);
            // Different user who is neither the shipper nor customer
            const otherUser = createMockUser({
              _id: new mongoose.Types.ObjectId(),
              shipperProfileId: new mongoose.Types.ObjectId(),
              customerProfileId: new mongoose.Types.ObjectId(),
            });

            // Act
            const canAccess = securityService.verifyPhotoAccess(
              otherUser,
              checkin
            );

            // Assert
            expect(canAccess).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should sanitize photos in response for unauthorized users", () => {
      fc.assert(
        fc.property(
          fc.record({
            shipperId: fc.constant(new mongoose.Types.ObjectId()),
            customerId: fc.constant(new mongoose.Types.ObjectId()),
            photoCount: fc.integer({ min: 1, max: 10 }),
          }),
          ({ shipperId, customerId, photoCount }) => {
            // Arrange
            const checkin = createMockCheckin(shipperId, customerId);
            checkin.photos = Array.from({ length: photoCount }, (_, i) => ({
              url: `https://example.com/photo${i}.jpg`,
              thumbnailUrl: `https://example.com/thumb${i}.jpg`,
              filename: `photo${i}.jpg`,
            }));

            // Different user who doesn't have access
            const otherUser = createMockUser({
              _id: new mongoose.Types.ObjectId(),
              shipperProfileId: new mongoose.Types.ObjectId(),
            });

            // Act
            const sanitized = securityService.sanitizeCheckinForResponse(
              otherUser,
              checkin
            );

            // Assert
            expect(sanitized.photosRestricted).toBe(true);
            expect(sanitized.photos.length).toBe(photoCount);
            sanitized.photos.forEach((photo) => {
              expect(photo.url).toBeNull();
              expect(photo.thumbnailUrl).toBeNull();
              expect(photo.restricted).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
