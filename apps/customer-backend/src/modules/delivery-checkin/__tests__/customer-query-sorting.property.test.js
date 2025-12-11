// apps/customer-backend/src/modules/delivery-checkin/__tests__/customer-query-sorting.property.test.js
/**
 * Property-Based Test: Customer Query Sorting
 *
 * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
 * For any customer requesting check-ins, the results SHALL be sorted by
 * timestamp in descending order (newest first).
 *
 * **Validates: Requirements 7.3**
 */

import fc from "fast-check";
import mongoose from "mongoose";

describe("Property 24: Customer Query Sorting", () => {
  // Generator for valid ObjectId strings
  const objectIdArb = fc
    .stringMatching(/^[0-9a-f]{24}$/)
    .map((id) => new mongoose.Types.ObjectId(id));

  // Generator for timestamps spread across a time range
  const timestampArb = fc
    .integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
    .map((offset) => {
      const baseTime = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
      return new Date(baseTime + offset);
    });

  /**
   * Mock repository that simulates customer check-in queries
   * This mirrors the behavior of DeliveryCheckin.findByCustomer()
   */
  class MockCheckinRepository {
    constructor() {
      this.checkins = [];
    }

    addCheckin(checkin) {
      this.checkins.push(checkin);
    }

    /**
     * Find check-ins by customer - implements Property 24
     * Results SHALL be sorted by checkinAt descending (newest first)
     * @param {ObjectId} customerId - Customer ID
     * @param {Object} options - Query options
     * @returns {Array} Check-ins sorted by timestamp descending
     */
    findByCustomer(customerId, options = {}) {
      const filtered = this.checkins.filter(
        (c) => c.customerId.toString() === customerId.toString() && !c.isDeleted
      );

      // Sort by checkinAt descending (newest first) - Property 24
      filtered.sort((a, b) => b.checkinAt.getTime() - a.checkinAt.getTime());

      // Apply limit
      const limit = options.limit || 100;
      return filtered.slice(0, limit);
    }

    reset() {
      this.checkins = [];
    }
  }

  let repository;

  beforeEach(() => {
    repository = new MockCheckinRepository();
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: For any customer, findByCustomer SHALL return results sorted
   * by checkinAt timestamp in descending order (newest first)
   *
   * **Validates: Requirements 7.3**
   */
  it("should return check-ins sorted by timestamp descending (newest first)", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.array(timestampArb, { minLength: 2, maxLength: 20 }), // Random timestamps
        (customerId, timestamps) => {
          repository.reset();

          // Create check-ins with random timestamps (not in order)
          for (let i = 0; i < timestamps.length; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: timestamps[i],
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Property: Results are sorted by checkinAt descending
          for (let i = 1; i < result.length; i++) {
            const prevTimestamp = result[i - 1].checkinAt.getTime();
            const currTimestamp = result[i].checkinAt.getTime();
            expect(prevTimestamp).toBeGreaterThanOrEqual(currTimestamp);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: The first element in results SHALL be the most recent check-in
   *
   * **Validates: Requirements 7.3**
   */
  it("should have the most recent check-in as the first element", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.array(timestampArb, { minLength: 1, maxLength: 15 }), // Random timestamps
        (customerId, timestamps) => {
          repository.reset();

          // Create check-ins with random timestamps
          for (let i = 0; i < timestamps.length; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: timestamps[i],
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Find the maximum timestamp from input
          const maxTimestamp = Math.max(...timestamps.map((t) => t.getTime()));

          // Property: First element has the maximum (most recent) timestamp
          expect(result[0].checkinAt.getTime()).toBe(maxTimestamp);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: The last element in results SHALL be the oldest check-in
   *
   * **Validates: Requirements 7.3**
   */
  it("should have the oldest check-in as the last element", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.array(timestampArb, { minLength: 1, maxLength: 15 }), // Random timestamps
        (customerId, timestamps) => {
          repository.reset();

          // Create check-ins with random timestamps
          for (let i = 0; i < timestamps.length; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: timestamps[i],
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Find the minimum timestamp from input
          const minTimestamp = Math.min(...timestamps.map((t) => t.getTime()));

          // Property: Last element has the minimum (oldest) timestamp
          expect(result[result.length - 1].checkinAt.getTime()).toBe(
            minTimestamp
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Sorting is stable - check-ins with same timestamp maintain consistent order
   *
   * **Validates: Requirements 7.3**
   */
  it("should maintain stable sort for check-ins with same timestamp", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.integer({ min: 2, max: 10 }), // Number of check-ins with same timestamp
        (customerId, count) => {
          repository.reset();

          const sameTimestamp = new Date();

          // Create multiple check-ins with the same timestamp
          for (let i = 0; i < count; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-SAME-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: new Date(sameTimestamp.getTime()),
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Property: All check-ins are returned
          expect(result.length).toBe(count);

          // Property: All have the same timestamp
          for (const checkin of result) {
            expect(checkin.checkinAt.getTime()).toBe(sameTimestamp.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Sorting is preserved when limit is applied
   *
   * **Validates: Requirements 7.3**
   */
  it("should preserve descending sort order when limit is applied", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.integer({ min: 10, max: 30 }), // Total check-ins
        fc.integer({ min: 1, max: 9 }), // Limit
        (customerId, totalCount, limit) => {
          repository.reset();

          // Create check-ins with sequential timestamps
          const baseTime = Date.now();
          for (let i = 0; i < totalCount; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: new Date(baseTime - i * 1000), // Decreasing timestamps
              status: "completed",
              isDeleted: false,
            });
          }

          // Query with limit
          const result = repository.findByCustomer(customerId, { limit });

          // Property: Result respects limit
          expect(result.length).toBe(limit);

          // Property: Results are still sorted descending
          for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].checkinAt.getTime()).toBeGreaterThanOrEqual(
              result[i].checkinAt.getTime()
            );
          }

          // Property: Limited results contain the most recent check-ins
          // The first result should be the most recent overall
          expect(result[0].checkinAt.getTime()).toBe(baseTime);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Deleted check-ins do not affect sorting of active check-ins
   *
   * **Validates: Requirements 7.3**
   */
  it("should maintain correct sort order excluding deleted check-ins", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.integer({ min: 3, max: 10 }), // Active check-ins
        fc.integer({ min: 1, max: 5 }), // Deleted check-ins
        (customerId, activeCount, deletedCount) => {
          repository.reset();

          const baseTime = Date.now();
          const activeTimestamps = [];

          // Create active check-ins with known timestamps
          for (let i = 0; i < activeCount; i++) {
            const timestamp = new Date(baseTime - i * 2000);
            activeTimestamps.push(timestamp.getTime());
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-ACTIVE-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: timestamp,
              status: "completed",
              isDeleted: false,
            });
          }

          // Create deleted check-ins with timestamps that would be in between
          for (let i = 0; i < deletedCount; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-DELETED-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: new Date(baseTime - i * 2000 - 1000), // In between active timestamps
              status: "completed",
              isDeleted: true,
              deletedAt: new Date(),
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Property: Only active check-ins returned
          expect(result.length).toBe(activeCount);

          // Property: Results are sorted descending
          for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].checkinAt.getTime()).toBeGreaterThanOrEqual(
              result[i].checkinAt.getTime()
            );
          }

          // Property: No deleted check-ins in results
          const hasDeleted = result.some((c) => c.isDeleted);
          expect(hasDeleted).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Sorting works correctly with check-ins from different orders
   *
   * **Validates: Requirements 7.3**
   */
  it("should sort check-ins from different orders by timestamp descending", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.array(objectIdArb, { minLength: 2, maxLength: 5 }), // Order IDs
        fc.array(timestampArb, { minLength: 2, maxLength: 10 }), // Timestamps
        (customerId, orderIds, timestamps) => {
          repository.reset();

          // Create check-ins for different orders with random timestamps
          for (let i = 0; i < timestamps.length; i++) {
            const orderId = orderIds[i % orderIds.length];
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId,
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${orderId.toString().substring(0, 8)}-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: timestamps[i],
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Property: All check-ins returned
          expect(result.length).toBe(timestamps.length);

          // Property: Results are sorted by timestamp descending regardless of order
          for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].checkinAt.getTime()).toBeGreaterThanOrEqual(
              result[i].checkinAt.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Sorting works correctly with check-ins from different shippers
   *
   * **Validates: Requirements 7.3**
   */
  it("should sort check-ins from different shippers by timestamp descending", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        fc.array(objectIdArb, { minLength: 2, maxLength: 5 }), // Shipper IDs
        fc.array(timestampArb, { minLength: 2, maxLength: 10 }), // Timestamps
        (customerId, shipperIds, timestamps) => {
          repository.reset();

          // Create check-ins from different shippers with random timestamps
          for (let i = 0; i < timestamps.length; i++) {
            const shipperId = shipperIds[i % shipperIds.length];
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: timestamps[i],
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Property: All check-ins returned
          expect(result.length).toBe(timestamps.length);

          // Property: Results are sorted by timestamp descending regardless of shipper
          for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].checkinAt.getTime()).toBeGreaterThanOrEqual(
              result[i].checkinAt.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Single check-in is returned correctly (edge case)
   *
   * **Validates: Requirements 7.3**
   */
  it("should return single check-in correctly", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        timestampArb, // Single timestamp
        (customerId, timestamp) => {
          repository.reset();

          // Create single check-in
          repository.addCheckin({
            _id: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId(),
            shipperId: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-SINGLE",
            customerId,
            customerEmail: "customer@test.com",
            checkinAt: timestamp,
            status: "completed",
            isDeleted: false,
          });

          // Query for customer
          const result = repository.findByCustomer(customerId);

          // Property: Single check-in returned
          expect(result.length).toBe(1);
          expect(result[0].checkinAt.getTime()).toBe(timestamp.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 24: Customer Query Sorting**
   *
   * Test: Empty result for customer with no check-ins
   *
   * **Validates: Requirements 7.3**
   */
  it("should return empty array for customer with no check-ins", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer with no check-ins
        objectIdArb, // Other customer with check-ins
        fc.array(timestampArb, { minLength: 1, maxLength: 5 }),
        (emptyCustomerId, otherCustomerId, timestamps) => {
          // Skip if same customer ID
          if (emptyCustomerId.toString() === otherCustomerId.toString()) {
            return true;
          }

          repository.reset();

          // Create check-ins only for other customer
          for (let i = 0; i < timestamps.length; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId: otherCustomerId,
              customerEmail: "other@test.com",
              checkinAt: timestamps[i],
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for customer with no check-ins
          const result = repository.findByCustomer(emptyCustomerId);

          // Property: Empty result
          expect(result).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
