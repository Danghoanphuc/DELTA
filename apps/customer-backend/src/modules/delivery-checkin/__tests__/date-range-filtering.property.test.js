// apps/customer-backend/src/modules/delivery-checkin/__tests__/date-range-filtering.property.test.js
/**
 * Property-Based Test: Date Range Filtering
 *
 * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
 * For any date range filter applied to check-ins, the returned results SHALL contain
 * only check-ins with checkinAt timestamp within the specified range.
 *
 * **Validates: Requirements 5.6**
 */

import fc from "fast-check";
import mongoose from "mongoose";

describe("Property 17: Date Range Filtering", () => {
  // Generator for valid ObjectId strings
  const objectIdArb = fc
    .stringMatching(/^[0-9a-f]{24}$/)
    .map((id) => new mongoose.Types.ObjectId(id));

  // Generator for date ranges with guaranteed valid dates
  // We generate two timestamps and ensure startDate <= endDate
  const dateRangeArb = fc
    .tuple(
      fc.integer({ min: 0, max: 300 }), // Days ago for start (0-300 days ago)
      fc.integer({ min: 1, max: 30 }) // Range duration in days (1-30 days)
    )
    .map(([daysAgo, rangeDays]) => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      // Start date is daysAgo days before now
      const startDate = new Date(now - daysAgo * dayMs);
      // End date is rangeDays after start date
      const endDate = new Date(startDate.getTime() + rangeDays * dayMs);

      return { startDate, endDate };
    });

  /**
   * Mock repository that simulates date range filtering
   * This mirrors the behavior that should be implemented in DeliveryCheckin queries
   */
  class MockCheckinRepository {
    constructor() {
      this.checkins = [];
    }

    addCheckin(checkin) {
      this.checkins.push(checkin);
    }

    /**
     * Find check-ins by customer with date range filter - implements Property 17
     * @param {ObjectId} customerId - Customer ID
     * @param {Object} options - Query options including startDate and endDate
     * @returns {Array} Check-ins within the date range
     */
    findByCustomerWithDateRange(customerId, options = {}) {
      let filtered = this.checkins.filter(
        (c) => c.customerId.toString() === customerId.toString() && !c.isDeleted
      );

      // Apply date range filter
      if (options.startDate) {
        filtered = filtered.filter((c) => c.checkinAt >= options.startDate);
      }
      if (options.endDate) {
        filtered = filtered.filter((c) => c.checkinAt <= options.endDate);
      }

      // Sort by checkinAt descending (newest first)
      filtered.sort((a, b) => b.checkinAt.getTime() - a.checkinAt.getTime());

      // Apply limit
      const limit = options.limit || 100;
      return filtered.slice(0, limit);
    }

    /**
     * Find check-ins by shipper with date range filter
     * @param {ObjectId} shipperId - Shipper ID
     * @param {Object} options - Query options including startDate and endDate
     * @returns {Array} Check-ins within the date range
     */
    findByShipperWithDateRange(shipperId, options = {}) {
      let filtered = this.checkins.filter(
        (c) => c.shipperId.toString() === shipperId.toString() && !c.isDeleted
      );

      // Apply date range filter
      if (options.startDate) {
        filtered = filtered.filter((c) => c.checkinAt >= options.startDate);
      }
      if (options.endDate) {
        filtered = filtered.filter((c) => c.checkinAt <= options.endDate);
      }

      // Sort by checkinAt descending (newest first)
      filtered.sort((a, b) => b.checkinAt.getTime() - a.checkinAt.getTime());

      // Apply limit
      const limit = options.limit || 50;
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
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: For any date range, all returned check-ins SHALL have checkinAt
   * within the specified range [startDate, endDate]
   *
   * **Validates: Requirements 5.6**
   */
  it("should return only check-ins within the specified date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        dateRangeArb, // Date range
        fc.integer({ min: 5, max: 20 }), // Number of check-ins to create
        (customerId, dateRange, checkinCount) => {
          repository.reset();

          // Create check-ins with random dates spread across a wide range
          const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          const now = new Date();
          const timeSpan = now.getTime() - oneYearAgo.getTime();

          for (let i = 0; i < checkinCount; i++) {
            // Generate random date within the past year
            const randomTime = oneYearAgo.getTime() + Math.random() * timeSpan;
            const checkinDate = new Date(randomTime);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Query with date range filter
          const result = repository.findByCustomerWithDateRange(customerId, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });

          // Property: All returned check-ins are within the date range
          for (const checkin of result) {
            expect(checkin.checkinAt.getTime()).toBeGreaterThanOrEqual(
              dateRange.startDate.getTime()
            );
            expect(checkin.checkinAt.getTime()).toBeLessThanOrEqual(
              dateRange.endDate.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Check-ins outside the date range SHALL NOT be returned
   *
   * **Validates: Requirements 5.6**
   */
  it("should not return check-ins outside the date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        dateRangeArb, // Date range
        fc.integer({ min: 1, max: 5 }), // Check-ins inside range
        fc.integer({ min: 1, max: 5 }), // Check-ins before range
        fc.integer({ min: 1, max: 5 }), // Check-ins after range
        (customerId, dateRange, insideCount, beforeCount, afterCount) => {
          repository.reset();

          const { startDate, endDate } = dateRange;
          const rangeMs = endDate.getTime() - startDate.getTime();

          // Create check-ins inside the range
          for (let i = 0; i < insideCount; i++) {
            const randomOffset = Math.random() * rangeMs;
            const checkinDate = new Date(startDate.getTime() + randomOffset);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-INSIDE-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Create check-ins before the range
          for (let i = 0; i < beforeCount; i++) {
            // At least 1 day before startDate
            const beforeDate = new Date(
              startDate.getTime() - (i + 1) * 24 * 60 * 60 * 1000
            );

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-BEFORE-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: beforeDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Create check-ins after the range
          for (let i = 0; i < afterCount; i++) {
            // At least 1 day after endDate
            const afterDate = new Date(
              endDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000
            );

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-AFTER-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: afterDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Query with date range filter
          const result = repository.findByCustomerWithDateRange(customerId, {
            startDate,
            endDate,
          });

          // Property: Only check-ins inside the range are returned
          expect(result.length).toBe(insideCount);

          // Property: No check-ins before or after the range
          const hasOutsideRange = result.some(
            (c) =>
              c.checkinAt.getTime() < startDate.getTime() ||
              c.checkinAt.getTime() > endDate.getTime()
          );
          expect(hasOutsideRange).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Date range filtering works for shipper history as well
   *
   * **Validates: Requirements 5.6**
   */
  it("should filter shipper check-ins by date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        dateRangeArb, // Date range
        fc.integer({ min: 5, max: 15 }), // Number of check-ins
        (shipperId, dateRange, checkinCount) => {
          repository.reset();

          const { startDate, endDate } = dateRange;
          const rangeMs = endDate.getTime() - startDate.getTime();

          let expectedInsideCount = 0;

          // Create check-ins with varying dates
          for (let i = 0; i < checkinCount; i++) {
            // Alternate between inside and outside the range
            let checkinDate;
            if (i % 2 === 0) {
              // Inside range
              const randomOffset = Math.random() * rangeMs;
              checkinDate = new Date(startDate.getTime() + randomOffset);
              expectedInsideCount++;
            } else {
              // Outside range (before)
              checkinDate = new Date(
                startDate.getTime() - (i + 1) * 24 * 60 * 60 * 1000
              );
            }

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Query with date range filter
          const result = repository.findByShipperWithDateRange(shipperId, {
            startDate,
            endDate,
          });

          // Property: All returned check-ins are within the date range
          for (const checkin of result) {
            expect(checkin.checkinAt.getTime()).toBeGreaterThanOrEqual(
              startDate.getTime()
            );
            expect(checkin.checkinAt.getTime()).toBeLessThanOrEqual(
              endDate.getTime()
            );
          }

          // Property: Count matches expected
          expect(result.length).toBe(expectedInsideCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Boundary dates are inclusive (check-ins exactly at startDate or endDate are included)
   *
   * **Validates: Requirements 5.6**
   */
  it("should include check-ins exactly at boundary dates", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        dateRangeArb, // Date range
        (customerId, dateRange) => {
          repository.reset();

          const { startDate, endDate } = dateRange;

          // Create check-in exactly at startDate
          repository.addCheckin({
            _id: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId(),
            shipperId: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-START",
            customerId,
            customerEmail: "customer@test.com",
            checkinAt: new Date(startDate.getTime()),
            status: "completed",
            isDeleted: false,
          });

          // Create check-in exactly at endDate
          repository.addCheckin({
            _id: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId(),
            shipperId: new mongoose.Types.ObjectId(),
            orderNumber: "ORD-END",
            customerId,
            customerEmail: "customer@test.com",
            checkinAt: new Date(endDate.getTime()),
            status: "completed",
            isDeleted: false,
          });

          // Query with date range filter
          const result = repository.findByCustomerWithDateRange(customerId, {
            startDate,
            endDate,
          });

          // Property: Both boundary check-ins are included
          expect(result.length).toBe(2);

          const orderNumbers = result.map((c) => c.orderNumber);
          expect(orderNumbers).toContain("ORD-START");
          expect(orderNumbers).toContain("ORD-END");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Empty result when no check-ins exist within the date range
   *
   * **Validates: Requirements 5.6**
   */
  it("should return empty array when no check-ins exist within date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        dateRangeArb, // Date range
        fc.integer({ min: 1, max: 5 }), // Check-ins outside range
        (customerId, dateRange, outsideCount) => {
          repository.reset();

          const { startDate, endDate } = dateRange;

          // Create check-ins only outside the range (before)
          for (let i = 0; i < outsideCount; i++) {
            const beforeDate = new Date(
              startDate.getTime() - (i + 1) * 24 * 60 * 60 * 1000
            );

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-BEFORE-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: beforeDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Query with date range filter
          const result = repository.findByCustomerWithDateRange(customerId, {
            startDate,
            endDate,
          });

          // Property: Empty result
          expect(result).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Date range filtering combined with customer filtering
   *
   * **Validates: Requirements 5.6**
   */
  it("should filter by both customer and date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Target customer
        objectIdArb, // Other customer
        dateRangeArb, // Date range
        fc.integer({ min: 1, max: 5 }), // Check-ins for target in range
        fc.integer({ min: 1, max: 5 }), // Check-ins for other in range
        (
          targetCustomerId,
          otherCustomerId,
          dateRange,
          targetCount,
          otherCount
        ) => {
          // Skip if same customer ID
          if (targetCustomerId.toString() === otherCustomerId.toString()) {
            return true;
          }

          repository.reset();

          const { startDate, endDate } = dateRange;
          const rangeMs = endDate.getTime() - startDate.getTime();

          // Create check-ins for target customer inside range
          for (let i = 0; i < targetCount; i++) {
            const randomOffset = Math.random() * rangeMs;
            const checkinDate = new Date(startDate.getTime() + randomOffset);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-TARGET-${i}`,
              customerId: targetCustomerId,
              customerEmail: "target@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Create check-ins for other customer inside range
          for (let i = 0; i < otherCount; i++) {
            const randomOffset = Math.random() * rangeMs;
            const checkinDate = new Date(startDate.getTime() + randomOffset);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-OTHER-${i}`,
              customerId: otherCustomerId,
              customerEmail: "other@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Query for target customer with date range
          const result = repository.findByCustomerWithDateRange(
            targetCustomerId,
            {
              startDate,
              endDate,
            }
          );

          // Property: Only target customer's check-ins
          expect(result.length).toBe(targetCount);

          // Property: All belong to target customer
          for (const checkin of result) {
            expect(checkin.customerId.toString()).toBe(
              targetCustomerId.toString()
            );
          }

          // Property: All within date range
          for (const checkin of result) {
            expect(checkin.checkinAt.getTime()).toBeGreaterThanOrEqual(
              startDate.getTime()
            );
            expect(checkin.checkinAt.getTime()).toBeLessThanOrEqual(
              endDate.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Results are sorted by checkinAt descending within the date range
   *
   * **Validates: Requirements 5.6**
   */
  it("should return results sorted by checkinAt descending within date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        dateRangeArb, // Date range
        fc.integer({ min: 3, max: 10 }), // Number of check-ins
        (customerId, dateRange, checkinCount) => {
          repository.reset();

          const { startDate, endDate } = dateRange;
          const rangeMs = endDate.getTime() - startDate.getTime();

          // Create check-ins with random dates inside the range
          for (let i = 0; i < checkinCount; i++) {
            const randomOffset = Math.random() * rangeMs;
            const checkinDate = new Date(startDate.getTime() + randomOffset);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Query with date range filter
          const result = repository.findByCustomerWithDateRange(customerId, {
            startDate,
            endDate,
          });

          // Property: Results are sorted by checkinAt descending
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
   * **Feature: delivery-checkin-system, Property 17: Date Range Filtering**
   *
   * Test: Deleted check-ins are excluded even within date range
   *
   * **Validates: Requirements 5.6**
   */
  it("should exclude deleted check-ins even within date range", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Customer ID
        dateRangeArb, // Date range
        fc.integer({ min: 1, max: 5 }), // Active check-ins
        fc.integer({ min: 1, max: 5 }), // Deleted check-ins
        (customerId, dateRange, activeCount, deletedCount) => {
          repository.reset();

          const { startDate, endDate } = dateRange;
          const rangeMs = endDate.getTime() - startDate.getTime();

          // Create active check-ins inside range
          for (let i = 0; i < activeCount; i++) {
            const randomOffset = Math.random() * rangeMs;
            const checkinDate = new Date(startDate.getTime() + randomOffset);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-ACTIVE-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: false,
            });
          }

          // Create deleted check-ins inside range
          for (let i = 0; i < deletedCount; i++) {
            const randomOffset = Math.random() * rangeMs;
            const checkinDate = new Date(startDate.getTime() + randomOffset);

            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: new mongoose.Types.ObjectId(),
              orderNumber: `ORD-DELETED-${i}`,
              customerId,
              customerEmail: "customer@test.com",
              checkinAt: checkinDate,
              status: "completed",
              isDeleted: true,
              deletedAt: new Date(),
            });
          }

          // Query with date range filter
          const result = repository.findByCustomerWithDateRange(customerId, {
            startDate,
            endDate,
          });

          // Property: Only active check-ins returned
          expect(result.length).toBe(activeCount);

          // Property: No deleted check-ins
          const hasDeleted = result.some((c) => c.isDeleted);
          expect(hasDeleted).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
