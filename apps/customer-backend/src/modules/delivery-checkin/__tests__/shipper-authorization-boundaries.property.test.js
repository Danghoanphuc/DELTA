/**
 * Property-Based Tests for Shipper Authorization Boundaries
 *
 * Tests correctness properties for shipper access control and authorization boundaries
 */

import fc from "fast-check";
import { User } from "../../../shared/models/user.model.js";
import { ShipperProfile } from "../../../shared/models/shipper-profile.model.js";
import { CustomerProfile } from "../../../shared/models/customer-profile.model.js";
import mongoose from "mongoose";
import {
  isShipper,
  isCustomer,
  isShipperOrCustomer,
  denyShipperAccess,
} from "../delivery-checkin.middleware.js";

// Mock request and response objects
const createMockReq = (user) => ({
  user,
  params: {},
  body: {},
});

const createMockRes = () => {
  const res = {
    statusCode: null,
    jsonData: null,
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
};

describe("Shipper Authorization Boundaries - Property-Based Tests", () => {
  /**
   * **Feature: delivery-checkin-system, Property 3: Shipper Authorization Boundaries**
   * **Validates: Requirements 1.3**
   *
   * Property: For any shipper attempting to access non-shipper features,
   * the system SHALL deny access and return ForbiddenException.
   */
  describe("Property 3: Shipper Authorization Boundaries", () => {
    it("should deny access to non-shipper features for shipper-only users", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random shipper user data
          fc.record({
            email: fc.emailAddress(),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
          }),
          async (userData) => {
            const uniqueSuffix = Date.now() + Math.random();
            let user = null;
            let shipperProfile = null;

            try {
              // Arrange: Create a shipper-only user (no customer/printer/org profile)
              shipperProfile = await ShipperProfile.create({
                userId: new mongoose.Types.ObjectId(),
                phoneNumber: userData.phoneNumber,
                isActive: true,
              });

              user = await User.create({
                email: `${uniqueSuffix}-${userData.email}`,
                displayName: userData.displayName,
                shipperProfileId: shipperProfile._id,
                customerProfileId: null,
                printerProfileId: null,
                organizationProfileId: null,
                isAdmin: false,
                isVerified: true,
              });

              // Act: Try to access non-shipper feature
              const req = createMockReq(user);
              const res = createMockRes();
              let nextCalled = false;
              const next = () => {
                nextCalled = true;
              };

              denyShipperAccess(req, res, next);

              // Assert: Access should be denied
              expect(nextCalled).toBe(false);
              expect(res.statusCode).toBe(403);
              expect(res.jsonData.success).toBe(false);
              expect(res.jsonData.message).toContain("Shipper không có quyền");
            } finally {
              // Cleanup
              if (user) await User.deleteOne({ _id: user._id });
              if (shipperProfile)
                await ShipperProfile.deleteOne({ _id: shipperProfile._id });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should allow access to non-shipper features for users with multiple roles", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random user data with multiple roles
          fc.record({
            email: fc.emailAddress(),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
          }),
          async (userData) => {
            const uniqueSuffix = Date.now() + Math.random();
            let user = null;
            let shipperProfile = null;
            let customerProfile = null;

            try {
              // Arrange: Create a user with both shipper and customer profiles
              shipperProfile = await ShipperProfile.create({
                userId: new mongoose.Types.ObjectId(),
                phoneNumber: userData.phoneNumber,
                isActive: true,
              });

              customerProfile = await CustomerProfile.create({
                userId: new mongoose.Types.ObjectId(),
              });

              user = await User.create({
                email: `${uniqueSuffix}-${userData.email}`,
                displayName: userData.displayName,
                shipperProfileId: shipperProfile._id,
                customerProfileId: customerProfile._id,
                isAdmin: false,
                isVerified: true,
              });

              // Act: Try to access non-shipper feature
              const req = createMockReq(user);
              const res = createMockRes();
              let nextCalled = false;
              const next = () => {
                nextCalled = true;
              };

              denyShipperAccess(req, res, next);

              // Assert: Access should be allowed (user has customer profile too)
              expect(nextCalled).toBe(true);
            } finally {
              // Cleanup
              if (user) await User.deleteOne({ _id: user._id });
              if (shipperProfile)
                await ShipperProfile.deleteOne({ _id: shipperProfile._id });
              if (customerProfile)
                await CustomerProfile.deleteOne({ _id: customerProfile._id });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should allow admin access regardless of shipper status", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
          }),
          async (userData) => {
            const uniqueSuffix = Date.now() + Math.random();
            let user = null;
            let shipperProfile = null;

            try {
              // Arrange: Create an admin user with shipper profile
              shipperProfile = await ShipperProfile.create({
                userId: new mongoose.Types.ObjectId(),
                phoneNumber: userData.phoneNumber,
                isActive: true,
              });

              user = await User.create({
                email: `${uniqueSuffix}-${userData.email}`,
                displayName: userData.displayName,
                shipperProfileId: shipperProfile._id,
                customerProfileId: null,
                printerProfileId: null,
                organizationProfileId: null,
                isAdmin: true, // Admin user
                isVerified: true,
              });

              // Act: Try to access non-shipper feature
              const req = createMockReq(user);
              const res = createMockRes();
              let nextCalled = false;
              const next = () => {
                nextCalled = true;
              };

              denyShipperAccess(req, res, next);

              // Assert: Access should be allowed (user is admin)
              expect(nextCalled).toBe(true);
            } finally {
              // Cleanup
              if (user) await User.deleteOne({ _id: user._id });
              if (shipperProfile)
                await ShipperProfile.deleteOne({ _id: shipperProfile._id });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: delivery-checkin-system, Property 2: Shipper Authentication Access**
   * **Validates: Requirements 1.2**
   *
   * Property: For any shipper with valid credentials, authentication SHALL grant access
   * to shipper-specific features, and invalid credentials SHALL deny access.
   */
  describe("Property 2: Shipper Authentication Access", () => {
    it("should grant access to shipper features for users with active shipper profile", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
          }),
          async (userData) => {
            const uniqueSuffix = Date.now() + Math.random();
            let user = null;
            let shipperProfile = null;

            try {
              // Arrange: Create an active shipper
              shipperProfile = await ShipperProfile.create({
                userId: new mongoose.Types.ObjectId(),
                phoneNumber: userData.phoneNumber,
                isActive: true,
              });

              user = await User.create({
                email: `${uniqueSuffix}-${userData.email}`,
                displayName: userData.displayName,
                shipperProfileId: shipperProfile._id,
                isVerified: true,
              });

              // Act: Check shipper middleware
              const req = createMockReq(user);
              const res = createMockRes();
              let nextCalled = false;
              const next = () => {
                nextCalled = true;
              };

              await isShipper(req, res, next);

              // Assert: Access should be granted
              expect(nextCalled).toBe(true);
              expect(req.shipperProfile).toBeDefined();
              expect(req.shipperProfile._id.toString()).toBe(
                shipperProfile._id.toString()
              );
            } finally {
              // Cleanup
              if (user) await User.deleteOne({ _id: user._id });
              if (shipperProfile)
                await ShipperProfile.deleteOne({ _id: shipperProfile._id });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should deny access to shipper features for users without shipper profile", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
          }),
          async (userData) => {
            const uniqueSuffix = Date.now() + Math.random();
            let user = null;

            try {
              // Arrange: Create a non-shipper user
              user = await User.create({
                email: `${uniqueSuffix}-${userData.email}`,
                displayName: userData.displayName,
                shipperProfileId: null,
                isVerified: true,
              });

              // Act: Check shipper middleware
              const req = createMockReq(user);
              const res = createMockRes();
              let nextCalled = false;
              const next = () => {
                nextCalled = true;
              };

              await isShipper(req, res, next);

              // Assert: Access should be denied
              expect(nextCalled).toBe(false);
              expect(res.statusCode).toBe(403);
              expect(res.jsonData.success).toBe(false);
              expect(res.jsonData.requiresShipperAccount).toBe(true);
            } finally {
              // Cleanup
              if (user) await User.deleteOne({ _id: user._id });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should deny access to shipper features for users with inactive shipper profile", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
          }),
          async (userData) => {
            const uniqueSuffix = Date.now() + Math.random();
            let user = null;
            let shipperProfile = null;

            try {
              // Arrange: Create an inactive shipper
              shipperProfile = await ShipperProfile.create({
                userId: new mongoose.Types.ObjectId(),
                phoneNumber: userData.phoneNumber,
                isActive: false, // Inactive
              });

              user = await User.create({
                email: `${uniqueSuffix}-${userData.email}`,
                displayName: userData.displayName,
                shipperProfileId: shipperProfile._id,
                isVerified: true,
              });

              // Act: Check shipper middleware
              const req = createMockReq(user);
              const res = createMockRes();
              let nextCalled = false;
              const next = () => {
                nextCalled = true;
              };

              await isShipper(req, res, next);

              // Assert: Access should be denied
              expect(nextCalled).toBe(false);
              expect(res.statusCode).toBe(403);
              expect(res.jsonData.success).toBe(false);
            } finally {
              // Cleanup
              if (user) await User.deleteOne({ _id: user._id });
              if (shipperProfile)
                await ShipperProfile.deleteOne({ _id: shipperProfile._id });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
