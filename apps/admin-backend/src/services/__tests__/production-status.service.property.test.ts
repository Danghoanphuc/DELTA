/**
 * Property-Based Tests for Production Status Service
 *
 * Tests correctness properties using fast-check
 */

import fc from "fast-check";
import {
  ProductionStatusService,
  ProductionStatus,
} from "../production-status.service.js";
import { ProductionOrder } from "../../models/production-order.model.js";
import mongoose from "mongoose";

// Mock the Logger to avoid ES module issues
jest.mock("../../infrastructure/logger.js", () => ({
  Logger: {
    debug: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ProductionStatusService - Property-Based Tests", () => {
  let service: ProductionStatusService;

  beforeEach(async () => {
    service = new ProductionStatusService();
  });

  // Arbitraries for generating test data
  const productionStageArb = fc.constantFrom(
    "pending",
    "confirmed",
    "in_production",
    "qc_check",
    "completed",
    "failed"
  );

  const objectIdArb = fc
    .constant(null)
    .map(() => new mongoose.Types.ObjectId());

  const nonEmptyStringArb = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0);

  const productionStatusArb = fc.record({
    stage: productionStageArb,
    substage: fc.option(nonEmptyStringArb, { nil: undefined }),
    progress: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }), {
      nil: undefined,
    }),
  }) as fc.Arbitrary<ProductionStatus>;

  /**
   * **Feature: printz-platform-features, Property 12: Production Status Logging**
   * **Validates: Requirements 4.2, 4.3**
   *
   * For any production status change, the system SHALL create a log entry
   * containing timestamp and operator ID.
   */
  it("should create log entry with timestamp and operator ID for any status change", async () => {
    await fc.assert(
      fc.asyncProperty(
        productionStatusArb,
        objectIdArb,
        objectIdArb,
        async (status, swagOrderId, operatorId) => {
          // Create a production order
          const order = await ProductionOrder.create({
            swagOrderId,
            swagOrderNumber: `SO-${Date.now()}`,
            supplierId: new mongoose.Types.ObjectId(),
            supplierName: "Test Supplier",
            items: [
              {
                skuVariantId: new mongoose.Types.ObjectId(),
                sku: "TEST-SKU",
                productName: "Test Product",
                quantity: 10,
                unitCost: 100,
                setupFee: 0,
                totalCost: 1000,
              },
            ],
            expectedCompletionDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            status: "pending",
            estimatedCost: 1000,
          });

          const initialHistoryLength = order.statusHistory.length;

          // Record timestamp before update
          const beforeUpdate = new Date();

          // Update status
          const updatedOrder = await service.updateStatus(
            order._id.toString(),
            status,
            operatorId.toString()
          );

          // Record timestamp after update
          const afterUpdate = new Date();

          // Property: Status history grew
          expect(updatedOrder.statusHistory.length).toBeGreaterThan(
            initialHistoryLength
          );

          // Find the log entry with our operator ID
          const ourLog = updatedOrder.statusHistory.find(
            (log) =>
              log.updatedBy &&
              log.updatedBy.toString() === operatorId.toString()
          );

          // Property: Our log entry exists
          expect(ourLog).toBeDefined();

          // Property: Log entry contains timestamp
          expect(ourLog!.timestamp).toBeDefined();
          expect(ourLog!.timestamp).toBeInstanceOf(Date);
          expect(ourLog!.timestamp.getTime()).toBeGreaterThanOrEqual(
            beforeUpdate.getTime()
          );
          expect(ourLog!.timestamp.getTime()).toBeLessThanOrEqual(
            afterUpdate.getTime()
          );

          // Property: Log entry contains operator ID
          expect(ourLog!.updatedBy).toBeDefined();
          expect(ourLog!.updatedBy.toString()).toBe(operatorId.toString());

          // Property: Log entry contains status
          expect(ourLog!.status).toBe(status.stage);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Status history is append-only
   *
   * For any sequence of status updates, the status history should grow
   * and never lose entries.
   */
  it("should maintain append-only status history", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productionStatusArb, { minLength: 2, maxLength: 5 }),
        objectIdArb,
        objectIdArb,
        async (statusUpdates, swagOrderId, operatorId) => {
          // Create a production order
          const order = await ProductionOrder.create({
            swagOrderId,
            swagOrderNumber: `SO-${Date.now()}`,
            supplierId: new mongoose.Types.ObjectId(),
            supplierName: "Test Supplier",
            items: [
              {
                skuVariantId: new mongoose.Types.ObjectId(),
                sku: "TEST-SKU",
                productName: "Test Product",
                quantity: 10,
                unitCost: 100,
                setupFee: 0,
                totalCost: 1000,
              },
            ],
            expectedCompletionDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            status: "pending",
            estimatedCost: 1000,
          });

          let previousHistoryLength = order.statusHistory.length;

          // Apply each status update
          for (const status of statusUpdates) {
            const updatedOrder = await service.updateStatus(
              order._id.toString(),
              status,
              operatorId.toString()
            );

            // Property: History length increases
            expect(updatedOrder.statusHistory.length).toBeGreaterThan(
              previousHistoryLength
            );

            previousHistoryLength = updatedOrder.statusHistory.length;
          }

          // Property: Final history has at least as many entries as updates
          const finalOrder = await ProductionOrder.findById(order._id);
          expect(finalOrder!.statusHistory.length).toBeGreaterThanOrEqual(
            statusUpdates.length
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Barcode scan creates log entry
   *
   * For any barcode scan, a log entry should be created with station ID
   * and operator ID.
   */
  it("should create log entry for barcode scan", async () => {
    await fc.assert(
      fc.asyncProperty(
        objectIdArb,
        nonEmptyStringArb,
        objectIdArb,
        async (swagOrderId, stationId, operatorId) => {
          // Create a production order
          const order = await ProductionOrder.create({
            swagOrderId,
            swagOrderNumber: `SO-${Date.now()}`,
            supplierId: new mongoose.Types.ObjectId(),
            supplierName: "Test Supplier",
            items: [
              {
                skuVariantId: new mongoose.Types.ObjectId(),
                sku: "TEST-SKU",
                productName: "Test Product",
                quantity: 10,
                unitCost: 100,
                setupFee: 0,
                totalCost: 1000,
              },
            ],
            expectedCompletionDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
            status: "pending",
            estimatedCost: 1000,
          });

          const initialHistoryLength = order.statusHistory.length;

          // Scan barcode (using order ID as barcode)
          const scanResult = await service.scanBarcode(
            order._id.toString(),
            stationId,
            operatorId.toString()
          );

          // Verify scan result
          expect(scanResult.orderId).toBe(order._id.toString());
          expect(scanResult.operatorId).toBe(operatorId.toString());

          // Verify log entry was created
          const updatedOrder = await ProductionOrder.findById(order._id);
          expect(updatedOrder!.statusHistory.length).toBeGreaterThan(
            initialHistoryLength
          );

          // Get the latest log entry
          const latestLog =
            updatedOrder!.statusHistory[updatedOrder!.statusHistory.length - 1];

          // Property: Log entry contains operator ID
          expect(latestLog.updatedBy.toString()).toBe(operatorId.toString());

          // Property: Log entry contains timestamp
          expect(latestLog.timestamp).toBeDefined();
          expect(latestLog.timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });
});
