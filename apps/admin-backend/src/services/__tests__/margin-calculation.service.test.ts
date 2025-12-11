/**
 * Unit Tests for Margin Calculation Service
 * Phase 13: Testing & Quality Assurance
 */

import { MarginCalculationService } from "../margin-calculation.service";
import { CostCalculationService } from "../cost-calculation.service";
import { AlertService } from "../alert.service";
import { SwagOrder } from "../../models/swag-order.model";

// Mock dependencies
jest.mock("../cost-calculation.service");
jest.mock("../alert.service");
jest.mock("../../models/swag-order.model");

describe("MarginCalculationService", () => {
  let service: MarginCalculationService;
  let mockCostService: jest.Mocked<CostCalculationService>;
  let mockAlertService: jest.Mocked<AlertService>;

  beforeEach(() => {
    mockCostService =
      new CostCalculationService() as jest.Mocked<CostCalculationService>;
    mockAlertService = new AlertService() as jest.Mocked<AlertService>;
    service = new MarginCalculationService();

    // Inject mocks
    (service as any).costCalculationService = mockCostService;
    (service as any).alertService = mockAlertService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateGrossMargin", () => {
    it("should calculate positive margin correctly", () => {
      const margin = service.calculateGrossMargin(1000000, 700000);
      expect(margin).toBe(300000);
    });

    it("should calculate negative margin (loss)", () => {
      const margin = service.calculateGrossMargin(500000, 800000);
      expect(margin).toBe(-300000);
    });

    it("should handle zero margin (break-even)", () => {
      const margin = service.calculateGrossMargin(1000000, 1000000);
      expect(margin).toBe(0);
    });

    it("should handle zero price", () => {
      const margin = service.calculateGrossMargin(0, 500000);
      expect(margin).toBe(-500000);
    });

    it("should handle zero cost", () => {
      const margin = service.calculateGrossMargin(1000000, 0);
      expect(margin).toBe(1000000);
    });

    it("should handle large numbers", () => {
      const margin = service.calculateGrossMargin(100000000, 75000000);
      expect(margin).toBe(25000000);
    });
  });

  describe("calculateMarginPercentage", () => {
    it("should calculate margin percentage correctly", () => {
      const percentage = service.calculateMarginPercentage(1000000, 700000);
      // (1000000 - 700000) / 1000000 * 100 = 30%
      expect(percentage).toBe(30);
    });

    it("should calculate negative margin percentage", () => {
      const percentage = service.calculateMarginPercentage(500000, 800000);
      // (500000 - 800000) / 500000 * 100 = -60%
      expect(percentage).toBe(-60);
    });

    it("should handle zero margin", () => {
      const percentage = service.calculateMarginPercentage(1000000, 1000000);
      expect(percentage).toBe(0);
    });

    it("should handle zero price", () => {
      const percentage = service.calculateMarginPercentage(0, 500000);
      expect(percentage).toBe(0);
    });

    it("should calculate high margin percentage", () => {
      const percentage = service.calculateMarginPercentage(1000000, 100000);
      // (1000000 - 100000) / 1000000 * 100 = 90%
      expect(percentage).toBe(90);
    });

    it("should calculate low margin percentage", () => {
      const percentage = service.calculateMarginPercentage(1000000, 950000);
      // (1000000 - 950000) / 1000000 * 100 = 5%
      expect(percentage).toBe(5);
    });

    it("should handle decimal results", () => {
      const percentage = service.calculateMarginPercentage(1000000, 666666);
      // (1000000 - 666666) / 1000000 * 100 = 33.3334%
      expect(percentage).toBeCloseTo(33.3334, 2);
    });
  });

  describe("checkMarginThreshold", () => {
    const mockOrder = {
      _id: "order123",
      orderNumber: "SO-2024-00001",
      totalPrice: 1000000,
    };

    const mockCostBreakdown = {
      orderId: "order123",
      baseProductsCost: 500000,
      customizationCost: 150000,
      setupFees: 50000,
      kittingFee: 30000,
      packagingCost: 15000,
      shippingCost: 80000,
      handlingFee: 40000,
      totalCost: 865000,
      totalPrice: 1000000,
      grossMargin: 135000,
      marginPercentage: 13.5,
    };

    it("should alert on low margin (< 20%)", async () => {
      mockAlertService.sendLowMarginAlert = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await service.checkMarginThreshold(
        mockOrder as any,
        mockCostBreakdown
      );

      expect(result.shouldAlert).toBe(true);
      expect(result.message).toContain("Low margin alert");
      expect(result.message).toContain("13.50%");
      expect(mockAlertService.sendLowMarginAlert).toHaveBeenCalledWith({
        orderId: "order123",
        orderNumber: "SO-2024-00001",
        marginPercentage: 13.5,
        threshold: 20,
      });
    });

    it("should not alert on acceptable margin (>= 20%)", async () => {
      const goodCostBreakdown = {
        ...mockCostBreakdown,
        totalCost: 750000,
        grossMargin: 250000,
        marginPercentage: 25,
      };

      const result = await service.checkMarginThreshold(
        mockOrder as any,
        goodCostBreakdown
      );

      expect(result.shouldAlert).toBe(false);
      expect(result.message).toBeUndefined();
      expect(mockAlertService.sendLowMarginAlert).not.toHaveBeenCalled();
    });

    it("should alert on exactly 20% margin threshold", async () => {
      const thresholdCostBreakdown = {
        ...mockCostBreakdown,
        totalCost: 800000,
        grossMargin: 200000,
        marginPercentage: 20,
      };

      const result = await service.checkMarginThreshold(
        mockOrder as any,
        thresholdCostBreakdown
      );

      expect(result.shouldAlert).toBe(false);
      expect(mockAlertService.sendLowMarginAlert).not.toHaveBeenCalled();
    });

    it("should alert on negative margin", async () => {
      const negativeCostBreakdown = {
        ...mockCostBreakdown,
        totalCost: 1200000,
        grossMargin: -200000,
        marginPercentage: -20,
      };

      const result = await service.checkMarginThreshold(
        mockOrder as any,
        negativeCostBreakdown
      );

      expect(result.shouldAlert).toBe(true);
      expect(mockAlertService.sendLowMarginAlert).toHaveBeenCalled();
    });

    it("should alert on zero margin", async () => {
      const zeroCostBreakdown = {
        ...mockCostBreakdown,
        totalCost: 1000000,
        grossMargin: 0,
        marginPercentage: 0,
      };

      const result = await service.checkMarginThreshold(
        mockOrder as any,
        zeroCostBreakdown
      );

      expect(result.shouldAlert).toBe(true);
      expect(mockAlertService.sendLowMarginAlert).toHaveBeenCalled();
    });
  });

  describe("generateMarginReportByProduct", () => {
    it("should generate margin report grouped by product", async () => {
      const mockOrders = [
        {
          _id: "order1",
          createdAt: new Date("2024-01-15"),
          status: "completed",
          packSnapshot: {
            items: [
              {
                product: "product1",
                name: "T-Shirt",
                price: 100000,
                cost: 60000,
                quantity: 10,
              },
            ],
          },
        },
        {
          _id: "order2",
          createdAt: new Date("2024-01-20"),
          status: "completed",
          packSnapshot: {
            items: [
              {
                product: "product1",
                name: "T-Shirt",
                price: 100000,
                cost: 60000,
                quantity: 20,
              },
            ],
          },
        },
      ];

      (SwagOrder.find as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrders),
      });

      const dateRange = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      const report = await service.generateMarginReportByProduct(dateRange);

      expect(report).toHaveLength(1);
      expect(report[0]).toMatchObject({
        productId: "product1",
        productName: "T-Shirt",
        revenue: 3000000, // (10 + 20) * 100000
        cost: 1800000, // (10 + 20) * 60000
        margin: 1200000,
        marginPercentage: 40,
      });
    });

    it("should handle multiple products", async () => {
      const mockOrders = [
        {
          _id: "order1",
          createdAt: new Date("2024-01-15"),
          status: "completed",
          packSnapshot: {
            items: [
              {
                product: "product1",
                name: "T-Shirt",
                price: 100000,
                cost: 60000,
                quantity: 10,
              },
              {
                product: "product2",
                name: "Mug",
                price: 80000,
                cost: 40000,
                quantity: 15,
              },
            ],
          },
        },
      ];

      (SwagOrder.find as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrders),
      });

      const dateRange = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      const report = await service.generateMarginReportByProduct(dateRange);

      expect(report).toHaveLength(2);
      expect(report.find((r) => r.productId === "product1")).toBeDefined();
      expect(report.find((r) => r.productId === "product2")).toBeDefined();
    });

    it("should handle empty date range", async () => {
      (SwagOrder.find as jest.Mock) = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      const dateRange = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      const report = await service.generateMarginReportByProduct(dateRange);

      expect(report).toHaveLength(0);
    });
  });

  describe("generateMarginReportByCustomer", () => {
    it("should generate margin report grouped by customer", async () => {
      const mockOrders = [
        {
          _id: "order1",
          organization: "org1",
          organizationName: "ABC Corp",
          createdAt: new Date("2024-01-15"),
          status: "completed",
          totalPrice: 1000000,
          packSnapshot: {
            items: [
              {
                product: "product1",
                price: 100000,
                cost: 60000,
                quantity: 10,
              },
            ],
          },
        },
        {
          _id: "order2",
          organization: "org1",
          organizationName: "ABC Corp",
          createdAt: new Date("2024-01-20"),
          status: "completed",
          totalPrice: 2000000,
          packSnapshot: {
            items: [
              {
                product: "product1",
                price: 100000,
                cost: 60000,
                quantity: 20,
              },
            ],
          },
        },
      ];

      (SwagOrder.find as jest.Mock) = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockOrders),
      });

      const dateRange = {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      };

      const report = await service.generateMarginReportByCustomer(dateRange);

      expect(report).toHaveLength(1);
      expect(report[0]).toMatchObject({
        organizationId: "org1",
        organizationName: "ABC Corp",
        revenue: 3000000,
        cost: 1800000,
        margin: 1200000,
        marginPercentage: 40,
        orderCount: 2,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small margins", () => {
      const percentage = service.calculateMarginPercentage(1000000, 999999);
      expect(percentage).toBeCloseTo(0.0001, 4);
    });

    it("should handle very large margins", () => {
      const percentage = service.calculateMarginPercentage(1000000, 1);
      expect(percentage).toBeCloseTo(99.9999, 4);
    });

    it("should handle rounding correctly", () => {
      const percentage = service.calculateMarginPercentage(1000000, 666666);
      expect(percentage).toBeCloseTo(33.3334, 2);
    });
  });
});
