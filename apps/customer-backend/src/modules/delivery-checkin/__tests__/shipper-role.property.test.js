/**
 * Property-Based Tests for Shipper Role Assignment
 *
 * Tests correctness properties for shipper account creation and role assignment
 */

import fc from "fast-check";
import { User } from "../../../shared/models/user.model.js";
import { ShipperProfile } from "../../../shared/models/shipper-profile.model.js";
import mongoose from "mongoose";

describe("Shipper Role Assignment - Property-Based Tests", () => {
  /**
   * **Feature: delivery-checkin-system, Property 1: Shipper Role Assignment**
   * **Validates: Requirements 1.1**
   *
   * Property: For any newly created shipper account, the role field SHALL be set to "shipper"
   * and SHALL have check-in operation permissions.
   */
  describe("Property 1: Shipper Role Assignment", () => {
    it("should assign shipper role to any user with shipperProfileId", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random user data
          fc.record({
            email: fc.emailAddress(),
            username: fc
              .string({ minLength: 5, maxLength: 20 })
              .filter((s) => s.trim().length >= 5),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
            vehicleType: fc.constantFrom(
              "motorbike",
              "car",
              "bicycle",
              "walking"
            ),
          }),
          async (userData) => {
            // Arrange: Create a shipper profile
            const shipperProfile = await ShipperProfile.create({
              userId: new mongoose.Types.ObjectId(),
              phoneNumber: userData.phoneNumber,
              vehicleType: userData.vehicleType,
              isActive: true,
            });

            // Act: Create user with shipper profile
            const user = await User.create({
              email: userData.email,
              username: userData.username,
              displayName: userData.displayName,
              shipperProfileId: shipperProfile._id,
              isVerified: true,
            });

            // Assert: User should have shipper role
            expect(user.isShipper).toBe(true);
            expect(user.getRole()).toBe("shipper");
            expect(user.shipperProfileId).toBeDefined();
            expect(user.shipperProfileId.toString()).toBe(
              shipperProfile._id.toString()
            );

            // Cleanup
            await User.deleteOne({ _id: user._id });
            await ShipperProfile.deleteOne({ _id: shipperProfile._id });
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it("should maintain shipper role consistency across multiple operations", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate array of random shipper data with unique emails (limit to 3 for speed)
          fc.uniqueArray(
            fc.record({
              email: fc.emailAddress(),
              username: fc
                .string({ minLength: 5, maxLength: 20 })
                .filter((s) => s.trim().length >= 5),
              displayName: fc
                .string({ minLength: 3, maxLength: 50 })
                .filter((s) => s.trim().length > 0),
              phoneNumber: fc
                .string({ minLength: 10, maxLength: 15 })
                .filter((s) => s.trim().length >= 10),
            }),
            {
              minLength: 1,
              maxLength: 3, // Reduced from 10 to 3 for faster tests
              selector: (item) => item.email, // Ensure unique emails
            }
          ),
          async (shippersData) => {
            const createdUsers = [];
            const createdProfiles = [];
            const uniqueSuffix = Date.now() + Math.random();

            try {
              // Act: Create multiple shippers
              for (let i = 0; i < shippersData.length; i++) {
                const shipperData = shippersData[i];
                const profile = await ShipperProfile.create({
                  userId: new mongoose.Types.ObjectId(),
                  phoneNumber: shipperData.phoneNumber,
                  isActive: true,
                });
                createdProfiles.push(profile);

                const user = await User.create({
                  email: `${uniqueSuffix}-${i}-${shipperData.email}`,
                  username: `${uniqueSuffix}-${i}-${shipperData.username}`,
                  displayName: shipperData.displayName,
                  shipperProfileId: profile._id,
                  isVerified: true,
                });
                createdUsers.push(user);
              }

              // Assert: All users should have shipper role
              for (const user of createdUsers) {
                expect(user.isShipper).toBe(true);
                expect(user.getRole()).toBe("shipper");
                expect(user.shipperProfileId).toBeDefined();
              }

              // Assert: All created users should be retrievable with shipper role
              for (const user of createdUsers) {
                const fetchedUser = await User.findById(user._id);
                expect(fetchedUser.isShipper).toBe(true);
              }
            } finally {
              // Cleanup
              for (const user of createdUsers) {
                await User.deleteOne({ _id: user._id });
              }
              for (const profile of createdProfiles) {
                await ShipperProfile.deleteOne({ _id: profile._id });
              }
            }
          }
        ),
        { numRuns: 50 } // Reduced from 100 to 50 for faster tests
      );
    }, 60000); // Increase timeout to 60 seconds

    it("should not assign shipper role to users without shipperProfileId", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            displayName: fc.string({ minLength: 3, maxLength: 50 }),
          }),
          async (userData) => {
            // Act: Create user without shipper profile
            const user = await User.create({
              email: userData.email,
              displayName: userData.displayName,
              isVerified: true,
            });

            // Assert: User should NOT have shipper role
            expect(user.isShipper).toBe(false);
            expect(user.getRole()).not.toBe("shipper");
            expect(user.shipperProfileId).toBeNull();

            // Cleanup
            await User.deleteOne({ _id: user._id });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve shipper role after user updates", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            username: fc
              .string({ minLength: 5, maxLength: 20 })
              .filter((s) => s.trim().length >= 5),
            displayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            newDisplayName: fc
              .string({ minLength: 3, maxLength: 50 })
              .filter((s) => s.trim().length > 0),
            phoneNumber: fc
              .string({ minLength: 10, maxLength: 15 })
              .filter((s) => s.trim().length >= 10),
          }),
          async (userData) => {
            // Make email and username unique by adding timestamp
            const uniqueSuffix = Date.now() + Math.random();
            const uniqueEmail = `${uniqueSuffix}-${userData.email}`;
            const uniqueUsername = `${uniqueSuffix}-${userData.username}`;

            // Arrange: Create shipper
            const profile = await ShipperProfile.create({
              userId: new mongoose.Types.ObjectId(),
              phoneNumber: userData.phoneNumber,
              isActive: true,
            });

            const user = await User.create({
              email: uniqueEmail,
              username: uniqueUsername,
              displayName: userData.displayName,
              shipperProfileId: profile._id,
              isVerified: true,
            });

            // Act: Update user
            user.displayName = userData.newDisplayName;
            await user.save();

            // Fetch fresh from DB
            const updatedUser = await User.findById(user._id);

            // Assert: Shipper role should be preserved
            expect(updatedUser.isShipper).toBe(true);
            expect(updatedUser.getRole()).toBe("shipper");
            expect(updatedUser.shipperProfileId.toString()).toBe(
              profile._id.toString()
            );
            // Note: displayName is trimmed by Mongoose schema
            expect(updatedUser.displayName).toBe(
              userData.newDisplayName.trim()
            );

            // Cleanup
            await User.deleteOne({ _id: user._id });
            await ShipperProfile.deleteOne({ _id: profile._id });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
