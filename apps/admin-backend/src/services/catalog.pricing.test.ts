// apps/admin-backend/src/services/catalog.pricing.test.ts
// ✅ Unit Tests for Dynamic Pricing Service
// Phase 3.1.2: Volume-based pricing, discounts, price calculator

import { PricingService, IPricingTier } from "./catalog.pricing.service";

describe("PricingService", () => {
  let pricingService: PricingService;

  beforeEach(() => {
    pricingService = new PricingService();
  });

  describe("findApplicableTier", () => {
    const tiers: IPricingTier[] = [
      { minQty: 1, maxQty: 10, pricePerUnit: 100000, discount: 0 },
      { minQty: 11, maxQty: 50, pricePerUnit: 90000, discount: 10 },
      { minQty: 51, maxQty: 100, pricePerUnit: 80000, discount: 20 },
      { minQty: 101, pricePerUnit: 70000, discount: 30 }, // No maxQty = infinity
    ];

    test("should return correct tier for quantity 1", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 1);
      expect(tier).toEqual(tiers[0]);
      expect(tier?.pricePerUnit).toBe(100000);
    });

    test("should return correct tier for quantity 10", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 10);
      expect(tier).toEqual(tiers[0]);
      expect(tier?.pricePerUnit).toBe(100000);
    });

    test("should return correct tier for quantity 11", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 11);
      expect(tier).toEqual(tiers[1]);
      expect(tier?.pricePerUnit).toBe(90000);
    });

    test("should return correct tier for quantity 50", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 50);
      expect(tier).toEqual(tiers[1]);
      expect(tier?.pricePerUnit).toBe(90000);
    });

    test("should return correct tier for quantity 51", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 51);
      expect(tier).toEqual(tiers[2]);
      expect(tier?.pricePerUnit).toBe(80000);
    });

    test("should return correct tier for quantity 101", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 101);
      expect(tier).toEqual(tiers[3]);
      expect(tier?.pricePerUnit).toBe(70000);
    });

    test("should return correct tier for quantity 1000 (no maxQty)", () => {
      const tier = (pricingService as any).findApplicableTier(tiers, 1000);
      expect(tier).toEqual(tiers[3]);
      expect(tier?.pricePerUnit).toBe(70000);
    });

    test("should return null for empty tiers", () => {
      const tier = (pricingService as any).findApplicableTier([], 10);
      expect(tier).toBeNull();
    });

    test("should return null for quantity below minimum", () => {
      const customTiers: IPricingTier[] = [
        { minQty: 10, pricePerUnit: 100000 },
      ];
      const tier = (pricingService as any).findApplicableTier(customTiers, 5);
      expect(tier).toBeNull();
    });
  });

  describe("findNextTier", () => {
    const tiers: IPricingTier[] = [
      { minQty: 1, maxQty: 10, pricePerUnit: 100000 },
      { minQty: 11, maxQty: 50, pricePerUnit: 90000 },
      { minQty: 51, maxQty: 100, pricePerUnit: 80000 },
      { minQty: 101, pricePerUnit: 70000 },
    ];

    test("should return next tier for quantity 5", () => {
      const nextTier = (pricingService as any).findNextTier(tiers, 5);
      expect(nextTier).toBeDefined();
      expect(nextTier?.minQty).toBe(11);
      expect(nextTier?.pricePerUnit).toBe(90000);
    });

    test("should return next tier for quantity 10", () => {
      const nextTier = (pricingService as any).findNextTier(tiers, 10);
      expect(nextTier).toBeDefined();
      expect(nextTier?.minQty).toBe(11);
    });

    test("should return next tier for quantity 50", () => {
      const nextTier = (pricingService as any).findNextTier(tiers, 50);
      expect(nextTier).toBeDefined();
      expect(nextTier?.minQty).toBe(51);
    });

    test("should return undefined for quantity at highest tier", () => {
      const nextTier = (pricingService as any).findNextTier(tiers, 101);
      expect(nextTier).toBeUndefined();
    });

    test("should return undefined for quantity above highest tier", () => {
      const nextTier = (pricingService as any).findNextTier(tiers, 1000);
      expect(nextTier).toBeUndefined();
    });

    test("should calculate potential savings correctly", () => {
      const nextTier = (pricingService as any).findNextTier(tiers, 5);
      expect(nextTier?.potentialSavings).toBe((100000 - 90000) * 11);
    });
  });

  describe("applyVolumeDiscount", () => {
    const basePrice = 100000;
    const tiers: IPricingTier[] = [
      { minQty: 1, maxQty: 10, pricePerUnit: 100000 },
      { minQty: 11, maxQty: 50, pricePerUnit: 90000 },
      { minQty: 51, pricePerUnit: 80000 },
    ];

    test("should return base price for quantity 1", () => {
      const price = pricingService.applyVolumeDiscount(basePrice, 1, tiers);
      expect(price).toBe(100000);
    });

    test("should return discounted price for quantity 11", () => {
      const price = pricingService.applyVolumeDiscount(basePrice, 11, tiers);
      expect(price).toBe(90000);
    });

    test("should return discounted price for quantity 51", () => {
      const price = pricingService.applyVolumeDiscount(basePrice, 51, tiers);
      expect(price).toBe(80000);
    });

    test("should return base price for empty tiers", () => {
      const price = pricingService.applyVolumeDiscount(basePrice, 10, []);
      expect(price).toBe(basePrice);
    });
  });

  describe("validatePricingTiers", () => {
    test("should validate correct tiers", () => {
      const tiers: IPricingTier[] = [
        { minQty: 1, maxQty: 10, pricePerUnit: 100000 },
        { minQty: 11, maxQty: 50, pricePerUnit: 90000 },
        { minQty: 51, pricePerUnit: 80000 },
      ];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should detect minQty < 1", () => {
      const tiers: IPricingTier[] = [{ minQty: 0, pricePerUnit: 100000 }];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Tier 1: minQty phải >= 1");
    });

    test("should detect maxQty < minQty", () => {
      const tiers: IPricingTier[] = [
        { minQty: 10, maxQty: 5, pricePerUnit: 100000 },
      ];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Tier 1: maxQty phải >= minQty");
    });

    test("should detect pricePerUnit <= 0", () => {
      const tiers: IPricingTier[] = [{ minQty: 1, pricePerUnit: 0 }];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Tier 1: pricePerUnit phải > 0");
    });

    test("should detect overlapping tiers", () => {
      const tiers: IPricingTier[] = [
        { minQty: 1, maxQty: 10, pricePerUnit: 100000 },
        { minQty: 10, maxQty: 50, pricePerUnit: 90000 }, // Overlap at 10
      ];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("overlap"))).toBe(true);
    });

    test("should detect gaps between tiers", () => {
      const tiers: IPricingTier[] = [
        { minQty: 1, maxQty: 10, pricePerUnit: 100000 },
        { minQty: 15, maxQty: 50, pricePerUnit: 90000 }, // Gap: 11-14
      ];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("gap"))).toBe(true);
    });

    test("should detect invalid discount percentage", () => {
      const tiers: IPricingTier[] = [
        { minQty: 1, pricePerUnit: 100000, discount: 150 }, // > 100%
      ];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Tier 1: discount phải từ 0-100%");
    });

    test("should detect price not decreasing with quantity", () => {
      const tiers: IPricingTier[] = [
        { minQty: 1, maxQty: 10, pricePerUnit: 100000 },
        { minQty: 11, maxQty: 50, pricePerUnit: 110000 }, // Price increases!
      ];

      const result = pricingService.validatePricingTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("nhỏ hơn tier trước"))).toBe(
        true
      );
    });

    test("should return valid for empty tiers", () => {
      const result = pricingService.validatePricingTiers([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("calculateMargin", () => {
    test("should calculate margin correctly", () => {
      const result = pricingService.calculateMargin(1000000, 700000);
      expect(result.grossMargin).toBe(300000);
      expect(result.marginPercentage).toBe(30);
    });

    test("should handle zero total price", () => {
      const result = pricingService.calculateMargin(0, 100000);
      expect(result.grossMargin).toBe(-100000);
      expect(result.marginPercentage).toBe(0);
    });

    test("should handle negative margin", () => {
      const result = pricingService.calculateMargin(800000, 1000000);
      expect(result.grossMargin).toBe(-200000);
      expect(result.marginPercentage).toBe(-25);
    });

    test("should handle 100% margin", () => {
      const result = pricingService.calculateMargin(1000000, 0);
      expect(result.grossMargin).toBe(1000000);
      expect(result.marginPercentage).toBe(100);
    });
  });

  describe("Edge Cases", () => {
    test("should handle single tier", () => {
      const tiers: IPricingTier[] = [{ minQty: 1, pricePerUnit: 100000 }];

      const tier = (pricingService as any).findApplicableTier(tiers, 100);
      expect(tier).toEqual(tiers[0]);
    });

    test("should handle tiers with same minQty (should not happen, but test anyway)", () => {
      const tiers: IPricingTier[] = [
        { minQty: 10, pricePerUnit: 100000 },
        { minQty: 10, pricePerUnit: 90000 },
      ];

      // Should return the first matching tier
      const tier = (pricingService as any).findApplicableTier(tiers, 10);
      expect(tier?.pricePerUnit).toBe(100000);
    });

    test("should handle very large quantities", () => {
      const tiers: IPricingTier[] = [
        { minQty: 1, maxQty: 100, pricePerUnit: 100000 },
        { minQty: 101, pricePerUnit: 50000 },
      ];

      const tier = (pricingService as any).findApplicableTier(tiers, 1000000);
      expect(tier?.pricePerUnit).toBe(50000);
    });
  });
});
