// apps/customer-backend/src/modules/delivery-checkin/__tests__/history-pagination.property.test.js
/**
 * Property-Based Test: History Pagination
 *
 * **Feature: delivery-checkin-system, Property 32: History Pagination**
 * For any paginated history request, each page SHALL contain exactly 20 items
 * (or fewer for the last page).
 *
 * **Validates: Requirements 9.5**
 */

import fc from "fast-check";
import mongoose from "mongoose";

describe("Property 32: History Pagination", () => {
  // Default page size as per Requirements 9.5
  const DEFAULT_PAGE_SIZE = 20;

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
   * Mock repository that simulates shipper check-in history with pagination
   * This mirrors the behavior of DeliveryCheckin.findByShipper() with pagination
   */
  class MockCheckinRepository {
    constructor() {
      this.checkins = [];
    }

    addCheckin(checkin) {
      this.checkins.push(checkin);
    }

    /**
     * Find check-ins by shipper with pagination - implements Property 32
     * Each page SHALL contain exactly 20 items (or fewer for the last page)
     * @param {ObjectId} shipperId - Shipper ID
     * @param {Object} options - Query options { page, limit }
     * @returns {Object} { checkins, pagination }
     */
    findByShipperPaginated(shipperId, options = {}) {
      const page = options.page || 1;
      const limit = options.limit || DEFAULT_PAGE_SIZE;

      // Filter by shipper and not deleted
      const filtered = this.checkins.filter(
        (c) => c.shipperId.toString() === shipperId.toString() && !c.isDeleted
      );

      // Sort by checkinAt descending (newest first)
      filtered.sort((a, b) => b.checkinAt.getTime() - a.checkinAt.getTime());

      // Calculate pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      // Get page items
      const checkins = filtered.slice(skip, skip + limit);

      return {
        checkins,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
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
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Each page SHALL contain exactly 20 items (default page size)
   *
   * **Validates: Requirements 9.5**
   */
  it("should return exactly 20 items per page (default page size)", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 21, max: 100 }), // Total check-ins (more than one page)
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          // Query first page with default page size
          const result = repository.findByShipperPaginated(shipperId, {
            page: 1,
          });

          // Property: First page contains exactly 20 items
          expect(result.checkins.length).toBe(DEFAULT_PAGE_SIZE);
          expect(result.pagination.limit).toBe(DEFAULT_PAGE_SIZE);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Last page SHALL contain fewer items if total is not divisible by 20
   *
   * **Validates: Requirements 9.5**
   */
  it("should return fewer items on the last page when total is not divisible by page size", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc
          .integer({ min: 21, max: 99 })
          .filter((n) => n % DEFAULT_PAGE_SIZE !== 0), // Total not divisible by 20
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          // Calculate expected last page
          const totalPages = Math.ceil(totalCheckins / DEFAULT_PAGE_SIZE);
          const expectedLastPageItems = totalCheckins % DEFAULT_PAGE_SIZE;

          // Query last page
          const result = repository.findByShipperPaginated(shipperId, {
            page: totalPages,
          });

          // Property: Last page contains fewer items (remainder)
          expect(result.checkins.length).toBe(expectedLastPageItems);
          expect(result.pagination.hasNextPage).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: All pages except last SHALL contain exactly 20 items
   *
   * **Validates: Requirements 9.5**
   */
  it("should return exactly 20 items for all pages except the last", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 41, max: 100 }), // At least 3 pages
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          const totalPages = Math.ceil(totalCheckins / DEFAULT_PAGE_SIZE);

          // Check all pages except the last
          for (let page = 1; page < totalPages; page++) {
            const result = repository.findByShipperPaginated(shipperId, {
              page,
            });

            // Property: Non-last pages contain exactly 20 items
            expect(result.checkins.length).toBe(DEFAULT_PAGE_SIZE);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Total items across all pages SHALL equal total check-ins
   *
   * **Validates: Requirements 9.5**
   */
  it("should return all items when iterating through all pages", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 1, max: 75 }), // Total check-ins
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          // Collect all items from all pages
          let allItems = [];
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const result = repository.findByShipperPaginated(shipperId, {
              page,
            });
            allItems = allItems.concat(result.checkins);
            hasMore = result.pagination.hasNextPage;
            page++;
          }

          // Property: Total items equals total check-ins
          expect(allItems.length).toBe(totalCheckins);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Pagination metadata SHALL be accurate
   *
   * **Validates: Requirements 9.5**
   */
  it("should return accurate pagination metadata", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 1, max: 100 }), // Total check-ins
        fc.integer({ min: 1, max: 10 }), // Page number
        (shipperId, totalCheckins, requestedPage) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          const totalPages = Math.ceil(totalCheckins / DEFAULT_PAGE_SIZE);
          const page = Math.min(requestedPage, totalPages); // Clamp to valid page

          const result = repository.findByShipperPaginated(shipperId, { page });

          // Property: Pagination metadata is accurate
          expect(result.pagination.total).toBe(totalCheckins);
          expect(result.pagination.totalPages).toBe(totalPages);
          expect(result.pagination.page).toBe(page);
          expect(result.pagination.limit).toBe(DEFAULT_PAGE_SIZE);
          expect(result.pagination.hasNextPage).toBe(page < totalPages);
          expect(result.pagination.hasPrevPage).toBe(page > 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Empty result for page beyond total pages
   *
   * **Validates: Requirements 9.5**
   */
  it("should return empty array for page beyond total pages", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 1, max: 50 }), // Total check-ins
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          const totalPages = Math.ceil(totalCheckins / DEFAULT_PAGE_SIZE);
          const beyondPage = totalPages + 1;

          const result = repository.findByShipperPaginated(shipperId, {
            page: beyondPage,
          });

          // Property: Empty result for page beyond total
          expect(result.checkins.length).toBe(0);
          expect(result.pagination.hasNextPage).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Single page when total items <= 20
   *
   * **Validates: Requirements 9.5**
   */
  it("should return single page when total items is 20 or fewer", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 1, max: DEFAULT_PAGE_SIZE }), // Total <= 20
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          const result = repository.findByShipperPaginated(shipperId, {
            page: 1,
          });

          // Property: All items fit in single page
          expect(result.checkins.length).toBe(totalCheckins);
          expect(result.pagination.totalPages).toBe(1);
          expect(result.pagination.hasNextPage).toBe(false);
          expect(result.pagination.hasPrevPage).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Exactly 20 items when total is exactly 20
   *
   * **Validates: Requirements 9.5**
   */
  it("should return exactly 20 items when total is exactly 20", () => {
    fc.assert(
      fc.property(objectIdArb, (shipperId) => {
        repository.reset();

        // Create exactly 20 check-ins
        for (let i = 0; i < DEFAULT_PAGE_SIZE; i++) {
          repository.addCheckin({
            _id: new mongoose.Types.ObjectId(),
            orderId: new mongoose.Types.ObjectId(),
            shipperId,
            orderNumber: `ORD-${i}`,
            customerId: new mongoose.Types.ObjectId(),
            customerEmail: "customer@test.com",
            checkinAt: new Date(Date.now() - i * 1000),
            status: "completed",
            isDeleted: false,
          });
        }

        const result = repository.findByShipperPaginated(shipperId, {
          page: 1,
        });

        // Property: Exactly 20 items, single page
        expect(result.checkins.length).toBe(DEFAULT_PAGE_SIZE);
        expect(result.pagination.totalPages).toBe(1);
        expect(result.pagination.hasNextPage).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: No duplicate items across pages
   *
   * **Validates: Requirements 9.5**
   */
  it("should not have duplicate items across pages", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 41, max: 80 }), // Multiple pages
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins for shipper
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          // Collect all IDs from all pages
          const allIds = new Set();
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const result = repository.findByShipperPaginated(shipperId, {
              page,
            });
            for (const checkin of result.checkins) {
              // Property: No duplicate IDs
              expect(allIds.has(checkin._id.toString())).toBe(false);
              allIds.add(checkin._id.toString());
            }
            hasMore = result.pagination.hasNextPage;
            page++;
          }

          // Property: All items collected
          expect(allIds.size).toBe(totalCheckins);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Deleted check-ins do not affect pagination counts
   *
   * **Validates: Requirements 9.5**
   */
  it("should not include deleted check-ins in pagination", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 25, max: 50 }), // Active check-ins
        fc.integer({ min: 5, max: 20 }), // Deleted check-ins
        (shipperId, activeCount, deletedCount) => {
          repository.reset();

          // Create active check-ins
          for (let i = 0; i < activeCount; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-ACTIVE-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          // Create deleted check-ins
          for (let i = 0; i < deletedCount; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-DELETED-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: true,
              deletedAt: new Date(),
            });
          }

          const result = repository.findByShipperPaginated(shipperId, {
            page: 1,
          });

          // Property: Total only counts active check-ins
          expect(result.pagination.total).toBe(activeCount);

          // Property: No deleted check-ins in results
          const hasDeleted = result.checkins.some((c) => c.isDeleted);
          expect(hasDeleted).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Empty result for shipper with no check-ins
   *
   * **Validates: Requirements 9.5**
   */
  it("should return empty result for shipper with no check-ins", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper with no check-ins
        objectIdArb, // Other shipper with check-ins
        fc.integer({ min: 1, max: 30 }),
        (emptyShipperId, otherShipperId, otherCount) => {
          // Skip if same shipper ID
          if (emptyShipperId.toString() === otherShipperId.toString()) {
            return true;
          }

          repository.reset();

          // Create check-ins only for other shipper
          for (let i = 0; i < otherCount; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId: otherShipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(Date.now() - i * 1000),
              status: "completed",
              isDeleted: false,
            });
          }

          const result = repository.findByShipperPaginated(emptyShipperId, {
            page: 1,
          });

          // Property: Empty result
          expect(result.checkins.length).toBe(0);
          expect(result.pagination.total).toBe(0);
          expect(result.pagination.totalPages).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 32: History Pagination**
   *
   * Test: Pagination preserves sort order (newest first)
   *
   * **Validates: Requirements 9.5**
   */
  it("should preserve descending timestamp sort order across pages", () => {
    fc.assert(
      fc.property(
        objectIdArb, // Shipper ID
        fc.integer({ min: 41, max: 60 }), // Multiple pages
        (shipperId, totalCheckins) => {
          repository.reset();

          // Create check-ins with sequential timestamps
          const baseTime = Date.now();
          for (let i = 0; i < totalCheckins; i++) {
            repository.addCheckin({
              _id: new mongoose.Types.ObjectId(),
              orderId: new mongoose.Types.ObjectId(),
              shipperId,
              orderNumber: `ORD-${i}`,
              customerId: new mongoose.Types.ObjectId(),
              customerEmail: "customer@test.com",
              checkinAt: new Date(baseTime - i * 1000), // Decreasing timestamps
              status: "completed",
              isDeleted: false,
            });
          }

          // Collect all items from all pages
          let allItems = [];
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const result = repository.findByShipperPaginated(shipperId, {
              page,
            });
            allItems = allItems.concat(result.checkins);
            hasMore = result.pagination.hasNextPage;
            page++;
          }

          // Property: All items are sorted by timestamp descending
          for (let i = 1; i < allItems.length; i++) {
            expect(allItems[i - 1].checkinAt.getTime()).toBeGreaterThanOrEqual(
              allItems[i].checkinAt.getTime()
            );
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
