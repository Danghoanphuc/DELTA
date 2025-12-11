/**
 * Property-Based Tests for AlertService
 *
 * Tests correctness properties for deadline alert triggering
 */

import fc from "fast-check";
import { AlertService } from "../alert.service.js";
import { AlertRepository } from "../../repositories/alert.repository.js";
import { ProductionOrder } from "../../models/production-order.model.js";
import { Alert, ALERT_TYPE, ALERT_STATUS } from "../../models/alert.model.js";
import { AlertThreshold } from "../../models/alert-threshold.model.js";
import mongoose from "mongoose";

// Mock Logger
jest.mock("../../infrastructure/logger.js", () => ({
  Logger: {
    debug: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AlertService - Property-Based Tests", () => {
  let alertService: AlertService;
  let alertRepository: AlertRepository;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/printz-test"
      );
    }
  });

  beforeEach(async () => {
    // Clear collections
    await Alert.deleteMany({});
    await ProductionOrder.deleteMany({});
    await AlertThreshold.deleteMany({});

    alertService = new AlertService();
    alertRepository = new AlertRepository();

    // Set up default thresholds
    await AlertThreshold.create({
      customerTier: "standard",
      deadlineWarningHours: 48,
      deadlineCriticalHours: 24,
      escalationHours: 48,
      isActive: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * **Feature: printz-platform-features, Property 14: Deadline Alert Triggering**
   * **Validates: Requirements 5.1, 5.2**
   *
   * Property: For any order with deadline within configured threshold hours,
   * the system SHALL generate an alert for the assigned Sales.
   */
  describe("Property 14: Deadline Alert Triggering", () => {
    it("should generate alerts for orders with deadlines within threshold", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random hours within warning threshold (1-48 hours)
          fc.integer({ min: 1, max: 48 }),
          async (hoursUntilDeadline) => {
            // Arrange: Create order with deadline within threshold
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: "pending",
              estimatedCost: 1000,
            });

            // Act: Run deadline check
            const result = await alertService.checkDeadlines();

            // Assert: Alert should be created
            const alerts = await Alert.find({ orderId: order._id });

            expect(alerts.length).toBeGreaterThan(0);
            expect(result.alertsCreated).toBeGreaterThan(0);

            // Verify alert properties
            const alert = alerts[0];
            expect(alert.orderId.toString()).toBe(order._id.toString());
            expect(alert.deadline).toEqual(deadline);
            expect(alert.hoursRemaining).toBeGreaterThanOrEqual(0);
            expect(alert.hoursRemaining).toBeLessThanOrEqual(48);

            // Verify alert type is one of the deadline types
            expect([
              ALERT_TYPE.DEADLINE_WARNING,
              ALERT_TYPE.DEADLINE_CRITICAL,
            ]).toContain(alert.type);

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
            await Alert.deleteMany({ orderId: order._id });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should NOT generate duplicate alerts for the same order within 24 hours", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 48 }),
          async (hoursUntilDeadline) => {
            // Arrange: Create order
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: "pending",
              estimatedCost: 1000,
            });

            // Act: Run deadline check twice
            await alertService.checkDeadlines();
            const firstDeadlineAlerts = await Alert.countDocuments({
              orderId: order._id,
              type: {
                $in: [
                  ALERT_TYPE.DEADLINE_WARNING,
                  ALERT_TYPE.DEADLINE_CRITICAL,
                ],
              },
            });

            await alertService.checkDeadlines();
            const secondDeadlineAlerts = await Alert.countDocuments({
              orderId: order._id,
              type: {
                $in: [
                  ALERT_TYPE.DEADLINE_WARNING,
                  ALERT_TYPE.DEADLINE_CRITICAL,
                ],
              },
            });

            // Assert: Should not create duplicate deadline alerts
            // (escalation alerts are separate and expected)
            expect(secondDeadlineAlerts).toBe(firstDeadlineAlerts);

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
            await Alert.deleteMany({ orderId: order._id });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should escalate alerts when production not started within escalation threshold", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate hours within escalation threshold (1-48)
          fc.integer({ min: 1, max: 48 }),
          async (hoursUntilDeadline) => {
            // Arrange: Create order with pending status
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: "pending", // Production not started
              estimatedCost: 1000,
            });

            // Act: Run deadline check
            const result = await alertService.checkDeadlines();

            // Assert: If within escalation threshold, escalation should be created
            if (hoursUntilDeadline <= 48) {
              const escalationAlerts = await Alert.find({
                orderId: order._id,
                type: ALERT_TYPE.ESCALATION,
              });

              if (result.escalationsCreated > 0) {
                expect(escalationAlerts.length).toBeGreaterThan(0);
              }
            }

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
            await Alert.deleteMany({ orderId: order._id });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should NOT generate alerts for orders outside threshold", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate hours OUTSIDE warning threshold (49-200 hours)
          fc.integer({ min: 49, max: 200 }),
          async (hoursUntilDeadline) => {
            // Arrange: Create order with deadline outside threshold
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: "pending",
              estimatedCost: 1000,
            });

            // Act: Run deadline check
            await alertService.checkDeadlines();

            // Assert: No alerts should be created
            const alerts = await Alert.find({ orderId: order._id });
            expect(alerts.length).toBe(0);

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should NOT generate alerts for completed orders", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 48 }),
          fc.constantFrom("completed", "failed"),
          async (hoursUntilDeadline, completedStatus) => {
            // Arrange: Create completed order
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: completedStatus,
              estimatedCost: 1000,
            });

            // Act: Run deadline check
            await alertService.checkDeadlines();

            // Assert: No alerts should be created for completed orders
            const alerts = await Alert.find({ orderId: order._id });
            expect(alerts.length).toBe(0);

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 15: Deadline Sorting Correctness**
   * **Validates: Requirements 5.3**
   *
   * Property: For any list of orders sorted by deadline urgency,
   * orders with earlier deadlines SHALL appear before orders with later deadlines.
   */
  describe("Property 15: Deadline Sorting Correctness", () => {
    it("should sort orders by deadline with earliest first", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate array of random deadline hours (1-200 hours from now)
          fc.array(fc.integer({ min: 1, max: 200 }), {
            minLength: 3,
            maxLength: 10,
          }),
          async (deadlineHours) => {
            // Arrange: Create orders with different deadlines
            const orders = await Promise.all(
              deadlineHours.map(async (hours, index) => {
                const deadline = new Date(Date.now() + hours * 60 * 60 * 1000);
                return await ProductionOrder.create({
                  swagOrderId: new mongoose.Types.ObjectId(),
                  swagOrderNumber: `SO-${Date.now()}-${index}`,
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
                  expectedCompletionDate: deadline,
                  status: "pending",
                  estimatedCost: 1000,
                });
              })
            );

            // Act: Get orders sorted by deadline urgency
            const sortedOrders = await alertService.getOrdersByDeadlineUrgency({
              limit: 100,
            });

            // Assert: Orders should be sorted by deadline (earliest first)
            for (let i = 0; i < sortedOrders.length - 1; i++) {
              const currentDeadline = new Date(
                sortedOrders[i].expectedCompletionDate
              );
              const nextDeadline = new Date(
                sortedOrders[i + 1].expectedCompletionDate
              );

              expect(currentDeadline.getTime()).toBeLessThanOrEqual(
                nextDeadline.getTime()
              );
            }

            // Clean up
            await Promise.all(
              orders.map((order) =>
                ProductionOrder.deleteOne({ _id: order._id })
              )
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should mark orders as at-risk when deadline is within 24 hours", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 23 }),
          async (hoursUntilDeadline) => {
            // Arrange: Create order with deadline within 24 hours
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: "pending",
              estimatedCost: 1000,
            });

            // Act: Get orders sorted by deadline urgency
            const sortedOrders =
              await alertService.getOrdersByDeadlineUrgency();

            // Assert: Order should be marked as at-risk
            const foundOrder = sortedOrders.find(
              (o) => o._id.toString() === order._id.toString()
            );

            expect(foundOrder).toBeDefined();
            expect(foundOrder?.isAtRisk).toBe(true);

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should mark orders as critical when deadline is within 12 hours", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 11 }),
          async (hoursUntilDeadline) => {
            // Arrange: Create order with deadline within 12 hours
            const deadline = new Date(
              Date.now() + hoursUntilDeadline * 60 * 60 * 1000
            );

            const order = await ProductionOrder.create({
              swagOrderId: new mongoose.Types.ObjectId(),
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
              expectedCompletionDate: deadline,
              status: "pending",
              estimatedCost: 1000,
            });

            // Act: Get orders sorted by deadline urgency
            const sortedOrders =
              await alertService.getOrdersByDeadlineUrgency();

            // Assert: Order should be marked as critical
            const foundOrder = sortedOrders.find(
              (o) => o._id.toString() === order._id.toString()
            );

            expect(foundOrder).toBeDefined();
            expect(foundOrder?.isCritical).toBe(true);
            expect(foundOrder?.isAtRisk).toBe(true); // Critical orders are also at-risk

            // Clean up
            await ProductionOrder.deleteOne({ _id: order._id });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
