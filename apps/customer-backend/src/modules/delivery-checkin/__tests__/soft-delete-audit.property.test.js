/**
 * Property-Based Tests for Soft Delete with Audit Trail
 *
 * Tests correctness properties for soft deletion of check-ins with audit trail
 */

import fc from "fast-check";
import { DeliveryCheckin } from "../delivery-checkin.model.js";
import { DeliveryCheckinRepository } from "../delivery-checkin.repository.js";
import mongoose from "mongoose";

describe("Soft Delete with Audit Trail - Property-Based Tests", () => {
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
   * **Feature: delivery-checkin-system, Property 49: Soft Delete with Audit Trail**
   * **Validates: Requirements 13.6**
   *
   * Property: For any deleted check-in, the record SHALL be soft-deleted (isDeleted=true)
   * and SHALL maintain deletedAt timestamp and deletedBy user reference.
   */
  describe("Property 49: Soft Delete with Audit Trail", () => {
    /**
     * Custom arbitrary for valid longitude (-180 to 180)
     */
    const longitude = () => fc.double({ min: -180, max: 180, noNaN: true });

    /**
     * Custom arbitrary for valid latitude (-90 to 90)
     */
    const latitude = () => fc.double({ min: -90, max: 90, noNaN: true });

    /**
     * Custom arbitrary for check-in data
     */
    const checkinData = () =>
      fc.record({
        orderNumber: fc
          .string({ minLength: 5, maxLength: 20 })
          .map((s) => `ORD-${s}`),
        shipperName: fc.string({ minLength: 3, maxLength: 50 }),
        customerEmail: fc.emailAddress(),
        lng: longitude(),
        lat: latitude(),
        address: fc.string({ minLength: 10, maxLength: 100 }),
        photoUrl: fc.webUrl(),
        notes: fc.string({ maxLength: 500 }),
      });

    it("should set isDeleted to true when check-in is deleted", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const userId = new mongoose.Types.ObjectId();

          // Act: Soft delete the check-in
          const deletedCheckin = await repository.delete(
            checkin._id.toString(),
            userId.toString()
          );

          // Assert: isDeleted should be true
          expect(deletedCheckin).not.toBeNull();
          expect(deletedCheckin.isDeleted).toBe(true);

          // Verify in database
          const fromDb = await DeliveryCheckin.findById(checkin._id);
          expect(fromDb.isDeleted).toBe(true);

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });

    it("should maintain deletedAt timestamp when check-in is deleted", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const userId = new mongoose.Types.ObjectId();
          const beforeDelete = new Date();

          // Act: Soft delete the check-in
          const deletedCheckin = await repository.delete(
            checkin._id.toString(),
            userId.toString()
          );

          const afterDelete = new Date();

          // Assert: deletedAt should be set and within reasonable time range
          expect(deletedCheckin).not.toBeNull();
          expect(deletedCheckin.deletedAt).toBeDefined();
          expect(deletedCheckin.deletedAt).toBeInstanceOf(Date);
          expect(deletedCheckin.deletedAt.getTime()).toBeGreaterThanOrEqual(
            beforeDelete.getTime()
          );
          expect(deletedCheckin.deletedAt.getTime()).toBeLessThanOrEqual(
            afterDelete.getTime()
          );

          // Verify in database
          const fromDb = await DeliveryCheckin.findById(checkin._id);
          expect(fromDb.deletedAt).toBeDefined();
          expect(fromDb.deletedAt).toBeInstanceOf(Date);

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });

    it("should maintain deletedBy user reference when check-in is deleted", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const userId = new mongoose.Types.ObjectId();

          // Act: Soft delete the check-in
          const deletedCheckin = await repository.delete(
            checkin._id.toString(),
            userId.toString()
          );

          // Assert: deletedBy should be set to the user who deleted it
          expect(deletedCheckin).not.toBeNull();
          expect(deletedCheckin.deletedBy).toBeDefined();
          expect(deletedCheckin.deletedBy.toString()).toBe(userId.toString());

          // Verify in database
          const fromDb = await DeliveryCheckin.findById(checkin._id);
          expect(fromDb.deletedBy).toBeDefined();
          expect(fromDb.deletedBy.toString()).toBe(userId.toString());

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });

    it("should maintain all three audit fields (isDeleted, deletedAt, deletedBy) together", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const userId = new mongoose.Types.ObjectId();

          // Act: Soft delete the check-in
          const deletedCheckin = await repository.delete(
            checkin._id.toString(),
            userId.toString()
          );

          // Assert: All three audit fields should be set
          expect(deletedCheckin).not.toBeNull();
          expect(deletedCheckin.isDeleted).toBe(true);
          expect(deletedCheckin.deletedAt).toBeDefined();
          expect(deletedCheckin.deletedAt).toBeInstanceOf(Date);
          expect(deletedCheckin.deletedBy).toBeDefined();
          expect(deletedCheckin.deletedBy.toString()).toBe(userId.toString());

          // Verify in database
          const fromDb = await DeliveryCheckin.findById(checkin._id);
          expect(fromDb.isDeleted).toBe(true);
          expect(fromDb.deletedAt).toBeDefined();
          expect(fromDb.deletedBy).toBeDefined();
          expect(fromDb.deletedBy.toString()).toBe(userId.toString());

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve original check-in data after soft delete", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const originalOrderNumber = checkin.orderNumber;
          const originalShipperName = checkin.shipperName;
          const originalCustomerEmail = checkin.customerEmail;
          const originalNotes = checkin.notes;
          const originalStatus = checkin.status;

          const userId = new mongoose.Types.ObjectId();

          // Act: Soft delete the check-in
          await repository.delete(checkin._id.toString(), userId.toString());

          // Assert: Original data should be preserved
          const fromDb = await DeliveryCheckin.findById(checkin._id);
          expect(fromDb.orderNumber).toBe(originalOrderNumber);
          expect(fromDb.shipperName).toBe(originalShipperName);
          expect(fromDb.customerEmail).toBe(originalCustomerEmail);
          expect(fromDb.notes).toBe(originalNotes);
          expect(fromDb.status).toBe(originalStatus);
          expect(fromDb.location.coordinates[0]).toBe(data.lng);
          expect(fromDb.location.coordinates[1]).toBe(data.lat);
          expect(fromDb.address.formatted).toBe(data.address);

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });

    it("should handle multiple deletions by different users", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(checkinData(), { minLength: 2, maxLength: 10 }),
          async (checkinsData) => {
            // Arrange: Create multiple check-ins
            const checkins = [];
            const userIds = [];

            for (const data of checkinsData) {
              const checkin = await DeliveryCheckin.create({
                orderId: new mongoose.Types.ObjectId(),
                orderNumber: data.orderNumber,
                shipperId: new mongoose.Types.ObjectId(),
                shipperName: data.shipperName,
                customerId: new mongoose.Types.ObjectId(),
                customerEmail: data.customerEmail,
                location: {
                  type: "Point",
                  coordinates: [data.lng, data.lat],
                },
                address: {
                  formatted: data.address,
                },
                photos: [
                  {
                    url: data.photoUrl,
                    thumbnailUrl: data.photoUrl,
                  },
                ],
                notes: data.notes,
                status: "completed",
                isDeleted: false,
              });
              checkins.push(checkin);
              userIds.push(new mongoose.Types.ObjectId());
            }

            // Act: Delete each check-in by a different user
            for (let i = 0; i < checkins.length; i++) {
              await repository.delete(
                checkins[i]._id.toString(),
                userIds[i].toString()
              );
            }

            // Assert: Each check-in should have correct audit trail
            for (let i = 0; i < checkins.length; i++) {
              const fromDb = await DeliveryCheckin.findById(checkins[i]._id);
              expect(fromDb.isDeleted).toBe(true);
              expect(fromDb.deletedAt).toBeDefined();
              expect(fromDb.deletedBy.toString()).toBe(userIds[i].toString());
            }

            // Cleanup
            await DeliveryCheckin.deleteMany({
              _id: { $in: checkins.map((c) => c._id) },
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should not modify audit trail on subsequent operations after deletion", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create and delete a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const userId = new mongoose.Types.ObjectId();
          await repository.delete(checkin._id.toString(), userId.toString());

          const afterFirstDelete = await DeliveryCheckin.findById(checkin._id);
          const originalDeletedAt = afterFirstDelete.deletedAt;
          const originalDeletedBy = afterFirstDelete.deletedBy;

          // Wait a bit to ensure timestamp would be different
          await new Promise((resolve) => setTimeout(resolve, 10));

          // Act: Try to delete again with different user
          const differentUserId = new mongoose.Types.ObjectId();
          await repository.delete(
            checkin._id.toString(),
            differentUserId.toString()
          );

          // Assert: Audit trail should remain from first deletion
          const afterSecondDelete = await DeliveryCheckin.findById(checkin._id);
          expect(afterSecondDelete.isDeleted).toBe(true);
          expect(afterSecondDelete.deletedAt.getTime()).toBe(
            originalDeletedAt.getTime()
          );
          expect(afterSecondDelete.deletedBy.toString()).toBe(
            originalDeletedBy.toString()
          );

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });

    it("should maintain audit trail even when check-in is queried", async () => {
      await fc.assert(
        fc.asyncProperty(checkinData(), async (data) => {
          // Arrange: Create and delete a check-in
          const checkin = await DeliveryCheckin.create({
            orderId: new mongoose.Types.ObjectId(),
            orderNumber: data.orderNumber,
            shipperId: new mongoose.Types.ObjectId(),
            shipperName: data.shipperName,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: data.customerEmail,
            location: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
            address: {
              formatted: data.address,
            },
            photos: [
              {
                url: data.photoUrl,
                thumbnailUrl: data.photoUrl,
              },
            ],
            notes: data.notes,
            status: "completed",
            isDeleted: false,
          });

          const userId = new mongoose.Types.ObjectId();
          const deletedCheckin = await repository.delete(
            checkin._id.toString(),
            userId.toString()
          );

          // Act: Query the check-in multiple times
          const query1 = await DeliveryCheckin.findById(checkin._id);
          const query2 = await DeliveryCheckin.findById(checkin._id).lean();
          const query3 = await DeliveryCheckin.findOne({ _id: checkin._id });

          // Assert: All queries should return same audit trail
          const queries = [query1, query2, query3];
          for (const result of queries) {
            expect(result.isDeleted).toBe(true);
            expect(result.deletedAt).toBeDefined();
            expect(result.deletedBy.toString()).toBe(userId.toString());
          }

          // Cleanup
          await DeliveryCheckin.deleteOne({ _id: checkin._id });
        }),
        { numRuns: 100 }
      );
    });
  });
});
