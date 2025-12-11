// apps/customer-backend/src/modules/delivery-checkin/__tests__/thread-message-format.property.test.js
// Property Test: Thread Message Format
// Feature: delivery-checkin-system, Property 10: Thread Message Format

import fc from "fast-check";
import { ThreadIntegrationService } from "../thread-integration.service.js";

describe("Property 10: Thread Message Format", () => {
  const service = new ThreadIntegrationService();

  /**
   * Property: For any check-in thread, the message SHALL contain shipper name,
   * address, and order number in the format
   * "Shipper [Name] đã check-in tại [Address] - Giao hàng cho đơn [OrderNumber]"
   *
   * Validates: Requirements 3.2
   */
  test("thread message contains shipper name, address, and order number in correct format", () => {
    fc.assert(
      fc.property(
        // Generate random shipper names
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim()),
        // Generate random addresses
        fc.string({ minLength: 5, maxLength: 200 }).filter((s) => s.trim()),
        // Generate random order numbers
        fc
          .string({ minLength: 5, maxLength: 20 })
          .filter((s) => s.trim() && /^[A-Z0-9-]+$/i.test(s)),
        // Generate random timestamps
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        // Generate optional notes
        fc.option(fc.string({ maxLength: 500 }), { nil: null }),
        // Generate optional GPS accuracy
        fc.option(fc.float({ min: 0, max: 100 }), { nil: null }),

        (shipperName, address, orderNumber, checkinAt, notes, accuracy) => {
          // Arrange: Create check-in data
          const checkin = {
            _id: "test-checkin-id",
            orderId: "test-order-id",
            orderNumber,
            shipperId: "test-shipper-id",
            shipperName,
            customerId: "test-customer-id",
            address: {
              formatted: address,
            },
            checkinAt,
            notes: notes || "",
            gpsMetadata: accuracy !== null ? { accuracy } : {},
          };

          // Act: Format message
          const message = service.formatThreadMessage(checkin);

          // Assert: Message contains required components
          expect(message).toContain(`Shipper ${shipperName}`);
          expect(message).toContain(`đã check-in tại ${address}`);
          expect(message).toContain(`Giao hàng cho đơn ${orderNumber}`);

          // Assert: Message follows the required format pattern
          const formatPattern = new RegExp(
            `Shipper ${escapeRegex(shipperName)} đã check-in tại ${escapeRegex(
              address
            )} - Giao hàng cho đơn ${escapeRegex(orderNumber)}`
          );
          expect(message).toMatch(formatPattern);

          // Assert: Timestamp is included
          expect(message).toContain("Thời gian:");

          // Assert: Notes are included if provided
          if (notes && notes.trim().length > 0) {
            expect(message).toContain("Ghi chú:");
            expect(message).toContain(notes);
          }

          // Assert: GPS accuracy is included if provided
          if (accuracy !== null) {
            expect(message).toContain("Độ chính xác GPS:");
            expect(message).toContain(`${Math.round(accuracy)}m`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test("thread message handles missing optional fields gracefully", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim()),
        fc.string({ minLength: 5, maxLength: 200 }).filter((s) => s.trim()),
        fc
          .string({ minLength: 5, maxLength: 20 })
          .filter((s) => s.trim() && /^[A-Z0-9-]+$/i.test(s)),
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),

        (shipperName, address, orderNumber, checkinAt) => {
          // Arrange: Create check-in with minimal data
          const checkin = {
            _id: "test-checkin-id",
            orderId: "test-order-id",
            orderNumber,
            shipperId: "test-shipper-id",
            shipperName,
            customerId: "test-customer-id",
            address: {
              formatted: address,
            },
            checkinAt,
            notes: "", // Empty notes
            gpsMetadata: {}, // No accuracy
          };

          // Act: Format message
          const message = service.formatThreadMessage(checkin);

          // Assert: Message still contains required components
          expect(message).toContain(`Shipper ${shipperName}`);
          expect(message).toContain(`đã check-in tại ${address}`);
          expect(message).toContain(`Giao hàng cho đơn ${orderNumber}`);
          expect(message).toContain("Thời gian:");

          // Assert: Optional fields are not included
          expect(message).not.toContain("Ghi chú:");
          expect(message).not.toContain("Độ chính xác GPS:");
        }
      ),
      { numRuns: 100 }
    );
  });

  test("thread message handles default values when fields are missing", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),

        (checkinAt) => {
          // Arrange: Create check-in with missing optional fields
          const checkin = {
            _id: "test-checkin-id",
            orderId: "test-order-id",
            orderNumber: undefined, // Missing
            shipperId: "test-shipper-id",
            shipperName: undefined, // Missing
            customerId: "test-customer-id",
            address: undefined, // Missing
            checkinAt,
            notes: "",
            gpsMetadata: {},
          };

          // Act: Format message
          const message = service.formatThreadMessage(checkin);

          // Assert: Message uses default values
          expect(message).toContain("Shipper Shipper"); // Default shipper name
          expect(message).toContain("địa điểm giao hàng"); // Default address
          expect(message).toContain("N/A"); // Default order number
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Helper function to escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
