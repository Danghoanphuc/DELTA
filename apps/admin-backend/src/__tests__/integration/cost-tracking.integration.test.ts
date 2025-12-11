/**
 * Integration Tests for Cost Tracking Workflow
 * Phase 13: Testing & Quality Assurance
 */

import request from "supertest";
import { app } from "../../app";
import { SwagOrder } from "../../models/swag-order.model";
import { ProductionOrder } from "../../models/production-order.models";
import { connectDB, disconnectDB } from "../../config/database";

describe("Cost Tracking Integration Tests", () => {
  let adminToken: string;
  let testOrderId: string;
  let testProductionOrderId: string;

  beforeAll(async () => {
    await connectDB();
    // Get admin token (mock or from test setup)
    adminToken = process.env.TEST_ADMIN_TOKEN || "test-admin-token";
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Create test order
    const testOrder = await SwagOrder.create({
      orderNumber: "SO-TEST-001",
      organization: "test-org-id",
      totalPrice: 1200000,
      status: "completed",
      recipients: [
        { name: "Test Recipient 1" },
        { name: "Test Recipient 2" },
        { name: "Test Recipient 3" },
      ],
      packSnapshot: {
        items: [
          {
            variantId: "variant1",
            name: "T-Shirt White M",
            quantity: 50,
            price: 100000,
            cost: 50000,
            customization: {
              printMethod: "screen_print",
              setupFee: 50000,
              unitCost: 15000,
            },
          },
        ],
      },
    });

    testOrderId = testOrder._id.toString();

    // Create test production order
    const testPO = await ProductionOrder.create({
      swagOrderId: testOrderId,
      swagOrderNumber: "SO-TEST-001",
      supplierId: "supplier1",
      estimatedCost: 150000,
      status: "completed",
      items: [
        {
          skuVariantId: "variant1",
          quantity: 50,
          unitCost: 3000,
        },
      ],
    });

    testProductionOrderId = testPO._id.toString();
  });

  afterEach(async () => {
    // Cleanup test data
    await SwagOrder.deleteMany({ orderNumber: /SO-TEST/ });
    await ProductionOrder.deleteMany({ swagOrderNumber: /SO-TEST/ });
  });

  describe("GET /api/admin/costs/:orderId", () => {
    it("should get cost breakdown for order", async () => {
      const response = await request(app)
        .get(`/api/admin/costs/${testOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.breakdown).toMatchObject({
        orderId: testOrderId,
        baseProductsCost: expect.any(Number),
        customizationCost: expect.any(Number),
        totalCost: expect.any(Number),
        totalPrice: 1200000,
        grossMargin: expect.any(Number),
        marginPercentage: expect.any(Number),
      });
    });

    it("should return 404 for non-existent order", async () => {
      const response = await request(app)
        .get("/api/admin/costs/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      await request(app).get(`/api/admin/costs/${testOrderId}`).expect(401);
    });
  });

  describe("GET /api/admin/costs/margin-report", () => {
    it("should generate margin report", async () => {
      const response = await request(app)
        .get("/api/admin/costs/margin-report")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report).toMatchObject({
        summary: {
          totalRevenue: expect.any(Number),
          totalCost: expect.any(Number),
          totalMargin: expect.any(Number),
          averageMarginPercentage: expect.any(Number),
          orderCount: expect.any(Number),
        },
        byProduct: expect.any(Array),
        byCustomer: expect.any(Array),
      });
    });

    it("should filter by date range", async () => {
      const response = await request(app)
        .get("/api/admin/costs/margin-report")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report.dateRange).toMatchObject({
        startDate: expect.any(String),
        endDate: expect.any(String),
      });
    });

    it("should group by product", async () => {
      const response = await request(app)
        .get("/api/admin/costs/margin-report")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          groupBy: "product",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.report.byProduct).toBeDefined();
      expect(Array.isArray(response.body.data.report.byProduct)).toBe(true);
    });

    it("should group by customer", async () => {
      const response = await request(app)
        .get("/api/admin/costs/margin-report")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          groupBy: "customer",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.report.byCustomer).toBeDefined();
      expect(Array.isArray(response.body.data.report.byCustomer)).toBe(true);
    });
  });

  describe("PUT /api/admin/costs/production-orders/:productionOrderId/actual", () => {
    it("should update actual cost", async () => {
      const response = await request(app)
        .put(
          `/api/admin/costs/production-orders/${testProductionOrderId}/actual`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          actualCost: 180000,
          costBreakdown: {
            materials: 120000,
            labor: 40000,
            overhead: 20000,
          },
          notes: "Material cost higher than expected",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.productionOrder).toMatchObject({
        _id: testProductionOrderId,
        estimatedCost: 150000,
        actualCost: 180000,
        costVariance: 30000,
      });
    });

    it("should validate actual cost is not negative", async () => {
      const response = await request(app)
        .put(
          `/api/admin/costs/production-orders/${testProductionOrderId}/actual`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          actualCost: -100,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("không thể âm");
    });

    it("should return 404 for non-existent production order", async () => {
      const response = await request(app)
        .put(
          "/api/admin/costs/production-orders/507f1f77bcf86cd799439011/actual"
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          actualCost: 180000,
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/admin/costs/variance", () => {
    beforeEach(async () => {
      // Update production order with actual cost
      await ProductionOrder.findByIdAndUpdate(testProductionOrderId, {
        actualCost: 180000,
        costVariance: 30000,
      });
    });

    it("should generate variance analysis report", async () => {
      const response = await request(app)
        .get("/api/admin/costs/variance")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toMatchObject({
        summary: {
          totalEstimated: expect.any(Number),
          totalActual: expect.any(Number),
          totalVariance: expect.any(Number),
          variancePercentage: expect.any(Number),
          orderCount: expect.any(Number),
        },
        byOrder: expect.any(Array),
        reasons: expect.any(Array),
      });
    });

    it("should identify cost overruns", async () => {
      const response = await request(app)
        .get("/api/admin/costs/variance")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const orderVariance = response.body.data.analysis.byOrder.find(
        (v: any) => v.orderId === testOrderId
      );

      expect(orderVariance).toBeDefined();
      expect(orderVariance.variance).toBeGreaterThan(0); // Cost overrun
    });
  });

  describe("Complete Cost Tracking Workflow", () => {
    it("should track costs from order creation to variance analysis", async () => {
      // Step 1: Get initial cost breakdown
      const costResponse = await request(app)
        .get(`/api/admin/costs/${testOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const estimatedCost = costResponse.body.data.breakdown.totalCost;

      // Step 2: Update actual cost
      await request(app)
        .put(
          `/api/admin/costs/production-orders/${testProductionOrderId}/actual`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          actualCost: estimatedCost * 1.2, // 20% overrun
          notes: "Test cost overrun",
        })
        .expect(200);

      // Step 3: Get variance analysis
      const varianceResponse = await request(app)
        .get("/api/admin/costs/variance")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const orderVariance = varianceResponse.body.data.analysis.byOrder.find(
        (v: any) => v.orderId === testOrderId
      );

      expect(orderVariance.variance).toBeGreaterThan(0);
      expect(orderVariance.variancePercentage).toBeCloseTo(20, 0);

      // Step 4: Get margin report
      const marginResponse = await request(app)
        .get("/api/admin/costs/margin-report")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(
        marginResponse.body.data.report.summary.orderCount
      ).toBeGreaterThan(0);
    });
  });

  describe("Low Margin Alert Workflow", () => {
    it("should alert on low margin orders", async () => {
      // Create order with low margin
      const lowMarginOrder = await SwagOrder.create({
        orderNumber: "SO-TEST-LOW-MARGIN",
        organization: "test-org-id",
        totalPrice: 100000, // Very low price
        status: "completed",
        recipients: [{ name: "Test" }],
        packSnapshot: {
          items: [
            {
              variantId: "variant1",
              name: "T-Shirt",
              quantity: 50,
              price: 2000,
              cost: 1800, // High cost relative to price
            },
          ],
        },
      });

      const response = await request(app)
        .get(`/api/admin/costs/${lowMarginOrder._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const { marginPercentage } = response.body.data.breakdown;

      // Should be low margin (< 20%)
      expect(marginPercentage).toBeLessThan(20);

      // Cleanup
      await SwagOrder.findByIdAndDelete(lowMarginOrder._id);
    });
  });
});
