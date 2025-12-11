/**
 * Unit Tests for Variance Analysis Service
 * Phase 13: Testing & Quality Assurance
 */

import { VarianceAnalysisService } from "../variance-analysis.service";
import { ProductionOrder } from "../../models/production-order.models";
import { SwagOrder } from "../../models/swag-order.model";
import { Logger } from "../../utils/logger";

// Mock dependencies
jest.mock("../../models/production-order.models");
jest.mock("../../models/swag-order.model");
jest.mock("../../utils/logger");

describe("VarianceAnalysisService", () => {
  let service: VarianceAnalysisService;

  beforeEach(() => {
    service = new VarianceAnalysisService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("recordActualCost", () => {
    let mockProductionOrder: any;

    beforeEach(() => {
      mockProductionOrder = {
        _id: "po123",
        estimatedCost: 150000,
        actualCost: null,
        costVariance: null,
        save: jest.fn().mockResolvedValue(true),
      };
    });

    it("should record actual cost and calculate variance", async () => {
      const result = await service.recordActualCost(
        mockProductionOrder,
        180000
      );

      expect(result.actualCost).toBe(180000);
      expect(result.costVariance).toBe(30000); // 180000 - 150000
      expect(mockProductionOrder.save).toHaveBeenCalled();
      expect(Logger.success).toHaveBeenCalledWith(
        expect.stringContaining("Recorded actual cost")
      );
    });

    it("should record cost breakdown when provided", async () => {
      const costBreakdown = {
        materials: 120000,
        labor: 40000,
        overhead: 20000,
      };

      const result = await service.recordActualCost(
        mockProductionOrder,
        180000,
        costBreakdown
      );

      expect(result.actualCostBreakdown).toEqual(costBreakdown);
    });

    it("should record notes when provided", async () => {
      const notes = "Material cost higher due to supplier price increase";

      const result = await service.recordActualCost(
        mockProductionOrder,
        180000,
        undefined,
        notes
      );

      expect(result.costNotes).toBe(notes);
    });

    it("should handle cost savings (actual < estimated)", async () => {
      const result = await service.recordActualCost(
        mockProductionOrder,
        120000
      );

      expect(result.actualCost).toBe(120000);
      expect(result.costVariance).toBe(-30000); // 120000 - 150000 (negative = savings)
    });

    it("should handle exact match (no variance)", async () => {
      const result = await service.recordActualCost(
        mockProductionOrder,
        150000
      );

      expect(result.actualCost).toBe(150000);
      expect(result.costVariance).toBe(0);
    });

    it("should handle zero actual cost", async () => {
      const result = await service.recordActualCost(mockProductionOrder, 0);

      expect(result.actualCost).toBe(0);
      expect(result.costVariance).toBe(-150000);
    });
  });

  describe("calculateVariance", () => {
    it("should calculate variance for order with multiple production orders", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 150000,
          actualCost: 180000,
          costNotes: "Material cost increase",
        },
        {
          _id: "po2",
          estimatedCost: 200000,
          actualCost: 190000,
          costNotes: "Labor cost savings",
        },
      ];

      (ProductionOrder.find as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockProductionOrders);

      const mockOrder = {
        _id: "order123",
        orderNumber: "SO-2024-00001",
      };

      const variance = await service.calculateVariance(mockOrder as any);

      expect(variance).toMatchObject({
        orderId: "order123",
        orderNumber: "SO-2024-00001",
        estimatedCost: 350000, // 150000 + 200000
        actualCost: 370000, // 180000 + 190000
        variance: 20000, // 370000 - 350000
        variancePercentage: expect.closeTo(5.71, 1), // (20000 / 350000) * 100
      });

      expect(variance.reasons).toHaveLength(1); // Only po1 has > 10% variance
    });

    it("should use estimated cost when actual not recorded", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 150000,
          actualCost: null,
        },
      ];

      (ProductionOrder.find as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockProductionOrders);

      const mockOrder = {
        _id: "order123",
        orderNumber: "SO-2024-00001",
      };

      const variance = await service.calculateVariance(mockOrder as any);

      expect(variance.estimatedCost).toBe(150000);
      expect(variance.actualCost).toBe(150000); // Falls back to estimated
      expect(variance.variance).toBe(0);
    });

    it("should handle empty production orders", async () => {
      (ProductionOrder.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const mockOrder = {
        _id: "order123",
        orderNumber: "SO-2024-00001",
      };

      const variance = await service.calculateVariance(mockOrder as any);

      expect(variance.estimatedCost).toBe(0);
      expect(variance.actualCost).toBe(0);
      expect(variance.variance).toBe(0);
      expect(variance.reasons).toHaveLength(0);
    });
  });

  describe("analyzeVarianceReasons", () => {
    it("should identify cost overruns > 10%", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 100000,
          actualCost: 120000, // 20% overrun
          costNotes: "Material cost increase",
        },
        {
          _id: "po2",
          estimatedCost: 200000,
          actualCost: 205000, // 2.5% overrun (should not be included)
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(2);
      expect(reasons[0]).toContain("Cost overrun of 20.00%");
      expect(reasons[1]).toContain("Material cost increase");
    });

    it("should identify cost savings > 10%", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 100000,
          actualCost: 80000, // 20% savings
          costNotes: "Negotiated better supplier rate",
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(2);
      expect(reasons[0]).toContain("Cost savings of 20.00%");
      expect(reasons[1]).toContain("Negotiated better supplier rate");
    });

    it("should skip production orders without actual cost", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 100000,
          actualCost: null,
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(0);
    });

    it("should skip variances <= 10%", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 100000,
          actualCost: 105000, // 5% overrun
        },
        {
          _id: "po2",
          estimatedCost: 100000,
          actualCost: 95000, // 5% savings
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(0);
    });

    it("should handle exactly 10% variance", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 100000,
          actualCost: 110000, // Exactly 10% overrun
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(0); // Should not include exactly 10%
    });

    it("should handle multiple significant variances", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 100000,
          actualCost: 130000, // 30% overrun
          costNotes: "Rush order premium",
        },
        {
          _id: "po2",
          estimatedCost: 200000,
          actualCost: 160000, // 20% savings
          costNotes: "Bulk discount",
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(4); // 2 variances + 2 notes
      expect(reasons.some((r) => r.includes("30.00%"))).toBe(true);
      expect(reasons.some((r) => r.includes("20.00%"))).toBe(true);
    });
  });

  describe("generateVarianceReport", () => {
    it("should generate comprehensive variance report", async () => {
      const mockOrders = [
        {
          _id: "order1",
          orderNumber: "SO-2024-00001",
          createdAt: new Date("2024-01-15"),
          status: "completed",
        },
        {
          _id: "order2",
          orderNumber: "SO-2024-00002",
          createdAt: new Date("2024-01-20"),
          status: "completed",
        },
      ];

      (SwagOrder.find as jest.Mock) = jest.fn().mockResolvedValue(mockOrders);

      // Mock calculateVariance for each order
      jest
        .spyOn(service, "calculateVariance")
        .mockImplementation(async (order: any) => {
          if (order._id === "order1") {
            return {
              orderId: "order1",
              orderNumber: "SO-2024-00001",
              estimatedCost: 100000,
              actualCost: 120000,
              variance: 20000,
              variancePercentage: 20,
              reasons: ["Cost overrun"],
            };
          } else {
            return {
              orderId: "order2",
              orderNumber: "SO-2024-00002",
              estimatedCost: 200000,
              actualCost: 190000,
              variance: -10000,
              variancePercentage: -5,
              reasons: ["Cost savings"],
            };
          }
        });

      const dateRange = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      const report = await service.generateVarianceReport(dateRange);

      expect(report.summary).toMatchObject({
        totalEstimated: 300000,
        totalActual: 310000,
        totalVariance: 10000,
        variancePercentage: expect.closeTo(3.33, 1),
        orderCount: 2,
      });

      expect(report.byOrder).toHaveLength(2);
      expect(report.reasons).toHaveLength(2);
    });

    it("should handle date range with no orders", async () => {
      (SwagOrder.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const dateRange = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      const report = await service.generateVarianceReport(dateRange);

      expect(report.summary).toMatchObject({
        totalEstimated: 0,
        totalActual: 0,
        totalVariance: 0,
        variancePercentage: 0,
        orderCount: 0,
      });

      expect(report.byOrder).toHaveLength(0);
      expect(report.reasons).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large variances", async () => {
      const mockProductionOrder = {
        _id: "po123",
        estimatedCost: 100000,
        actualCost: null,
        costVariance: null,
        save: jest.fn().mockResolvedValue(true),
      };

      const result = await service.recordActualCost(
        mockProductionOrder,
        1000000
      );

      expect(result.costVariance).toBe(900000);
    });

    it("should handle negative estimated cost (edge case)", async () => {
      const mockProductionOrder = {
        _id: "po123",
        estimatedCost: -100000, // Invalid but should handle
        actualCost: null,
        costVariance: null,
        save: jest.fn().mockResolvedValue(true),
      };

      const result = await service.recordActualCost(mockProductionOrder, 50000);

      expect(result.costVariance).toBe(150000);
    });

    it("should handle very small variances", async () => {
      const mockProductionOrders = [
        {
          _id: "po1",
          estimatedCost: 1000000,
          actualCost: 1000001, // 0.0001% variance
        },
      ];

      const reasons = await service.analyzeVarianceReasons(
        mockProductionOrders
      );

      expect(reasons).toHaveLength(0); // Too small to report
    });
  });
});
