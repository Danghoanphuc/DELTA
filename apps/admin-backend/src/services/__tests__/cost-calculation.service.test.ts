/**
 * Unit Tests for Cost Calculation Service
 * Phase 13: Testing & Quality Assurance
 */

import { CostCalculationService } from "../cost-calculation.service";
import { SwagOrder } from "../../models/swag-order.model";
import { SkuVariant } from "../../models/catalog.models";

// Mock dependencies
jest.mock("../../models/swag-order.model");
jest.mock("../../models/catalog.models");

describe("CostCalculationService", () => {
  let service: CostCalculationService;
  let mockOrder: any;

  beforeEach(() => {
    service = new CostCalculationService();

    // Mock order data
    mockOrder = {
      _id: "order123",
      orderNumber: "SO-2024-00001",
      totalPrice: 1200000,
      recipients: [
        { _id: "recipient1", name: "John Doe" },
        { _id: "recipient2", name: "Jane Smith" },
        { _id: "recipient3", name: "Bob Johnson" },
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
              printAreas: [
                {
                  area: "front",
                  artworkId: "artwork1",
                  colors: ["#000000", "#FFFFFF"],
                },
              ],
            },
          },
          {
            variantId: "variant2",
            name: "Mug White",
            quantity: 50,
            price: 80000,
            cost: 40000,
            customization: {
              printMethod: "sublimation",
              setupFee: 30000,
              unitCost: 10000,
              printAreas: [
                {
                  area: "wrap",
                  artworkId: "artwork2",
                  colors: ["#FF0000"],
                },
              ],
            },
          },
        ],
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateProductCost", () => {
    it("should calculate base product cost correctly", async () => {
      const cost = await service.calculateProductCost(mockOrder);

      // (50 * 50000) + (50 * 40000) = 2,500,000 + 2,000,000 = 4,500,000
      expect(cost).toBe(4500000);
    });

    it("should handle orders with no items", async () => {
      mockOrder.packSnapshot.items = [];
      const cost = await service.calculateProductCost(mockOrder);

      expect(cost).toBe(0);
    });

    it("should handle orders with single item", async () => {
      mockOrder.packSnapshot.items = [mockOrder.packSnapshot.items[0]];
      const cost = await service.calculateProductCost(mockOrder);

      // 50 * 50000 = 2,500,000
      expect(cost).toBe(2500000);
    });
  });

  describe("calculateCustomizationCost", () => {
    it("should calculate customization cost with setup fees", async () => {
      const cost = await service.calculateCustomizationCost(mockOrder);

      // Setup fees: 50000 + 30000 = 80,000
      // Unit costs: (50 * 15000) + (50 * 10000) = 750,000 + 500,000 = 1,250,000
      // Total: 80,000 + 1,250,000 = 1,330,000
      expect(cost).toBe(1330000);
    });

    it("should handle orders with no customization", async () => {
      mockOrder.packSnapshot.items.forEach((item: any) => {
        delete item.customization;
      });

      const cost = await service.calculateCustomizationCost(mockOrder);
      expect(cost).toBe(0);
    });

    it("should handle items with only setup fees", async () => {
      mockOrder.packSnapshot.items.forEach((item: any) => {
        if (item.customization) {
          item.customization.unitCost = 0;
        }
      });

      const cost = await service.calculateCustomizationCost(mockOrder);

      // Only setup fees: 50000 + 30000 = 80,000
      expect(cost).toBe(80000);
    });

    it("should handle items with only unit costs", async () => {
      mockOrder.packSnapshot.items.forEach((item: any) => {
        if (item.customization) {
          item.customization.setupFee = 0;
        }
      });

      const cost = await service.calculateCustomizationCost(mockOrder);

      // Only unit costs: (50 * 15000) + (50 * 10000) = 1,250,000
      expect(cost).toBe(1250000);
    });
  });

  describe("calculateOperationalCost", () => {
    it("should calculate operational costs correctly", async () => {
      const cost = await service.calculateOperationalCost(mockOrder);

      // Kitting: 3 recipients * 10000 = 30,000
      // Packaging: 3 recipients * 5000 = 15,000
      // Shipping: 3 * 25000 + (100 items * 100) = 75,000 + 10,000 = 85,000
      // Handling: 1200000 * 0.05 = 60,000
      // Total: 30,000 + 15,000 + 85,000 + 60,000 = 190,000
      expect(cost).toBe(190000);
    });

    it("should scale with number of recipients", async () => {
      // Add more recipients
      mockOrder.recipients = [
        ...mockOrder.recipients,
        { _id: "recipient4", name: "Alice" },
        { _id: "recipient5", name: "Charlie" },
      ];

      const cost = await service.calculateOperationalCost(mockOrder);

      // Kitting: 5 * 10000 = 50,000
      // Packaging: 5 * 5000 = 25,000
      // Shipping: 5 * 25000 + (100 * 100) = 125,000 + 10,000 = 135,000
      // Handling: 1200000 * 0.05 = 60,000
      // Total: 50,000 + 25,000 + 135,000 + 60,000 = 270,000
      expect(cost).toBe(270000);
    });

    it("should handle single recipient", async () => {
      mockOrder.recipients = [mockOrder.recipients[0]];

      const cost = await service.calculateOperationalCost(mockOrder);

      // Kitting: 1 * 10000 = 10,000
      // Packaging: 1 * 5000 = 5,000
      // Shipping: 1 * 25000 + (100 * 100) = 25,000 + 10,000 = 35,000
      // Handling: 1200000 * 0.05 = 60,000
      // Total: 10,000 + 5,000 + 35,000 + 60,000 = 110,000
      expect(cost).toBe(110000);
    });
  });

  describe("calculateTotalCost", () => {
    it("should calculate complete cost breakdown", async () => {
      const breakdown = await service.calculateTotalCost(mockOrder);

      expect(breakdown).toMatchObject({
        orderId: "order123",
        baseProductsCost: 4500000,
        customizationCost: 1330000,
        setupFees: 80000,
        kittingFee: 30000,
        packagingCost: 15000,
        shippingCost: 85000,
        handlingFee: 60000,
        totalPrice: 1200000,
      });

      // Total cost = 4,500,000 + 1,330,000 + 190,000 = 6,020,000
      expect(breakdown.totalCost).toBe(6020000);

      // Gross margin = 1,200,000 - 6,020,000 = -4,820,000 (loss)
      expect(breakdown.grossMargin).toBe(-4820000);

      // Margin percentage = (-4,820,000 / 1,200,000) * 100 = -401.67%
      expect(breakdown.marginPercentage).toBeCloseTo(-401.67, 1);
    });

    it("should handle profitable orders", async () => {
      // Increase total price to make it profitable
      mockOrder.totalPrice = 8000000;

      const breakdown = await service.calculateTotalCost(mockOrder);

      // Total cost = 6,020,000
      // Gross margin = 8,000,000 - 6,020,000 = 1,980,000
      expect(breakdown.grossMargin).toBe(1980000);

      // Margin percentage = (1,980,000 / 8,000,000) * 100 = 24.75%
      expect(breakdown.marginPercentage).toBeCloseTo(24.75, 1);
    });

    it("should handle break-even orders", async () => {
      mockOrder.totalPrice = 6020000;

      const breakdown = await service.calculateTotalCost(mockOrder);

      expect(breakdown.grossMargin).toBe(0);
      expect(breakdown.marginPercentage).toBe(0);
    });
  });

  describe("extractSetupFees", () => {
    it("should extract all setup fees", () => {
      const setupFees = service.extractSetupFees(mockOrder);

      // 50000 + 30000 = 80,000
      expect(setupFees).toBe(80000);
    });

    it("should return 0 when no setup fees", () => {
      mockOrder.packSnapshot.items.forEach((item: any) => {
        if (item.customization) {
          delete item.customization.setupFee;
        }
      });

      const setupFees = service.extractSetupFees(mockOrder);
      expect(setupFees).toBe(0);
    });
  });

  describe("calculateShippingCost", () => {
    it("should calculate shipping cost based on recipients and weight", async () => {
      const cost = await service.calculateShippingCost(mockOrder);

      // Base: 3 recipients * 25000 = 75,000
      // Weight surcharge: 100 items * 100 = 10,000
      // Total: 85,000
      expect(cost).toBe(85000);
    });

    it("should handle lightweight orders", async () => {
      mockOrder.packSnapshot.items = [
        {
          ...mockOrder.packSnapshot.items[0],
          quantity: 10,
        },
      ];

      const cost = await service.calculateShippingCost(mockOrder);

      // Base: 3 * 25000 = 75,000
      // Weight: 10 * 100 = 1,000
      // Total: 76,000
      expect(cost).toBe(76000);
    });

    it("should handle heavy orders", async () => {
      mockOrder.packSnapshot.items = [
        {
          ...mockOrder.packSnapshot.items[0],
          quantity: 500,
        },
      ];

      const cost = await service.calculateShippingCost(mockOrder);

      // Base: 3 * 25000 = 75,000
      // Weight: 500 * 100 = 50,000
      // Total: 125,000
      expect(cost).toBe(125000);
    });
  });

  describe("Edge Cases", () => {
    it("should handle orders with zero price", async () => {
      mockOrder.totalPrice = 0;

      const breakdown = await service.calculateTotalCost(mockOrder);

      expect(breakdown.totalPrice).toBe(0);
      expect(breakdown.handlingFee).toBe(0);
      expect(breakdown.grossMargin).toBeLessThan(0);
    });

    it("should handle orders with no recipients", async () => {
      mockOrder.recipients = [];

      const breakdown = await service.calculateTotalCost(mockOrder);

      expect(breakdown.kittingFee).toBe(0);
      expect(breakdown.packagingCost).toBe(0);
      expect(breakdown.shippingCost).toBeGreaterThanOrEqual(0);
    });

    it("should handle very large orders", async () => {
      mockOrder.packSnapshot.items[0].quantity = 10000;
      mockOrder.totalPrice = 100000000;

      const breakdown = await service.calculateTotalCost(mockOrder);

      expect(breakdown.baseProductsCost).toBeGreaterThan(0);
      expect(breakdown.customizationCost).toBeGreaterThan(0);
      expect(breakdown.totalCost).toBeGreaterThan(0);
    });
  });
});
