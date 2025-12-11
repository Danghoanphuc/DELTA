/**
 * Property-Based Tests for PricingService
 *
 * Tests correctness properties using fast-check library
 * Each test validates specific requirements from the design document
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import * as fc from "fast-check";
import { Types } from "mongoose";
import {
  PricingService,
  ProductSpecification,
  PricingResult,
} from "../pricing.service.js";
import {
  PricingFormula,
  IPricingFormula,
} from "../../models/pricing-formula.model.js";

let pricingService: PricingService;
let testFormula: IPricingFormula;

// Arbitraries for generating test data
const sizeArb = fc.record({
  width: fc.integer({ min: 10, max: 1000 }),
  height: fc.integer({ min: 10, max: 1000 }),
  unit: fc.constantFrom("mm", "cm", "inch") as fc.Arbitrary<
    "mm" | "cm" | "inch"
  >,
});

const printSidesArb = fc.constantFrom("single", "double") as fc.Arbitrary<
  "single" | "double"
>;

const finishingOptionsArb = fc.subarray(
  ["lamination", "uv_coating", "embossing", "foil_stamping", "die_cutting"],
  { minLength: 0, maxLength: 3 }
);

const validProductSpecArb = fc.record({
  productType: fc.constant("business_card"),
  size: sizeArb,
  paperType: fc.constantFrom("standard", "premium", "recycled"),
  quantity: fc.integer({ min: 1, max: 10000 }),
  finishingOptions: finishingOptionsArb,
  printSides: printSidesArb,
  colors: fc.integer({ min: 1, max: 4 }),
});

// Helper function to create test formula
const createTestFormula = async (): Promise<IPricingFormula> => {
  return await PricingFormula.create({
    name: "Business Card Formula",
    productType: "business_card",
    formula:
      "basePrice * quantity * paperMultiplier * printSidesMultiplier * colorMultiplier + finishingCost * quantity",
    variables: [],
    quantityTiers: [
      { minQuantity: 1, maxQuantity: 100, pricePerUnit: 1000, discount: 0 },
      { minQuantity: 101, maxQuantity: 500, pricePerUnit: 800, discount: 5 },
      { minQuantity: 501, maxQuantity: 1000, pricePerUnit: 600, discount: 10 },
      {
        minQuantity: 1001,
        maxQuantity: 10000,
        pricePerUnit: 400,
        discount: 15,
      },
    ],
    paperMultipliers: new Map([
      ["standard", 1.0],
      ["premium", 1.5],
      ["recycled", 1.2],
    ]),
    finishingCosts: new Map([
      ["lamination", 200],
      ["uv_coating", 300],
      ["embossing", 500],
      ["foil_stamping", 800],
      ["die_cutting", 400],
    ]),
    minMargin: 15,
    isActive: true,
    createdBy: new Types.ObjectId(),
  });
};

// Setup - uses the global setup from __tests__/setup.ts for MongoDB connection
beforeAll(async () => {
  pricingService = new PricingService();
});

// Recreate test formula before each test (global afterEach clears collections)
beforeEach(async () => {
  testFormula = await createTestFormula();
});

describe("PricingService Property Tests", () => {
  /**
   * **Feature: printz-platform-features, Property 1: Pricing Calculation Completeness**
   * **Validates: Requirements 1.1**
   *
   * For any valid product specification, the pricing calculation SHALL return
   * all required fields (costPrice, sellingPrice, profitMargin, marginPercentage, breakdown)
   * and complete within 1 second.
   */
  describe("Property 1: Pricing Calculation Completeness", () => {
    it("should return complete pricing result for any valid specification", async () => {
      await fc.assert(
        fc.asyncProperty(validProductSpecArb, async (spec) => {
          const startTime = Date.now();
          const result = await pricingService.calculatePrice(
            spec as ProductSpecification
          );
          const elapsed = Date.now() - startTime;

          // Verify all required fields are present
          expect(result.costPrice).toBeDefined();
          expect(typeof result.costPrice).toBe("number");
          expect(result.costPrice).toBeGreaterThan(0);

          expect(result.sellingPrice).toBeDefined();
          expect(typeof result.sellingPrice).toBe("number");
          expect(result.sellingPrice).toBeGreaterThan(0);

          expect(result.profitMargin).toBeDefined();
          expect(typeof result.profitMargin).toBe("number");

          expect(result.marginPercentage).toBeDefined();
          expect(typeof result.marginPercentage).toBe("number");

          expect(result.breakdown).toBeDefined();
          expect(result.breakdown.baseCost).toBeDefined();
          expect(result.breakdown.paperCost).toBeDefined();
          expect(result.breakdown.printingCost).toBeDefined();
          expect(result.breakdown.finishingCost).toBeDefined();
          expect(result.breakdown.totalCost).toBeDefined();

          expect(result.calculatedAt).toBeDefined();
          expect(result.calculatedAt).toBeInstanceOf(Date);

          expect(result.formulaId).toBeDefined();
          expect(result.formulaName).toBeDefined();

          // Verify calculation completes within 1 second
          expect(elapsed).toBeLessThan(1000);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 2: Quantity Tier Pricing Consistency**
   * **Validates: Requirements 1.2**
   *
   * For any quantity value, the pricing SHALL follow the configured quantity tier structure,
   * where higher quantities result in equal or lower per-unit prices.
   */
  describe("Property 2: Quantity Tier Pricing Consistency", () => {
    it("should apply correct tier and ensure higher quantities get equal or lower per-unit prices", async () => {
      // Generate pairs of quantities where q2 > q1
      const quantityPairArb = fc
        .tuple(
          fc.integer({ min: 1, max: 5000 }),
          fc.integer({ min: 1, max: 5000 })
        )
        .filter(([q1, q2]) => q2 > q1);

      await fc.assert(
        fc.asyncProperty(quantityPairArb, async ([q1, q2]) => {
          const spec1: ProductSpecification = {
            productType: "business_card",
            size: { width: 90, height: 55, unit: "mm" },
            paperType: "standard",
            quantity: q1,
            finishingOptions: [],
            printSides: "single",
            colors: 1,
          };

          const spec2: ProductSpecification = {
            ...spec1,
            quantity: q2,
          };

          const result1 = await pricingService.calculatePrice(spec1);
          const result2 = await pricingService.calculatePrice(spec2);

          // Calculate per-unit prices
          const perUnit1 = result1.costPrice / q1;
          const perUnit2 = result2.costPrice / q2;

          // Higher quantity should have equal or lower per-unit price
          expect(perUnit2).toBeLessThanOrEqual(perUnit1 + 0.01); // Small tolerance for rounding
        }),
        { numRuns: 100 }
      );
    });

    it("should apply the correct tier based on quantity", async () => {
      const tiers = testFormula.quantityTiers;

      for (const tier of tiers) {
        // Test with quantity in the middle of the tier
        const midQuantity = Math.floor(
          (tier.minQuantity + tier.maxQuantity) / 2
        );

        const spec: ProductSpecification = {
          productType: "business_card",
          size: { width: 90, height: 55, unit: "mm" },
          paperType: "standard",
          quantity: midQuantity,
          finishingOptions: [],
          printSides: "single",
          colors: 1,
        };

        const result = await pricingService.calculatePrice(spec);

        // Verify the applied tier matches
        if (result.appliedTier) {
          expect(result.appliedTier.minQuantity).toBeLessThanOrEqual(
            midQuantity
          );
          expect(result.appliedTier.maxQuantity).toBeGreaterThanOrEqual(
            midQuantity
          );
        }
      }
    });
  });

  /**
   * **Feature: printz-platform-features, Property 3: Finishing Options Additive Cost**
   * **Validates: Requirements 1.3**
   *
   * For any combination of finishing options, the total cost SHALL equal
   * the sum of base cost plus all selected finishing option costs.
   */
  describe("Property 3: Finishing Options Additive Cost", () => {
    it("should calculate finishing cost as sum of all selected options", async () => {
      await fc.assert(
        fc.asyncProperty(finishingOptionsArb, async (options) => {
          const spec: ProductSpecification = {
            productType: "business_card",
            size: { width: 90, height: 55, unit: "mm" },
            paperType: "standard",
            quantity: 100,
            finishingOptions: options,
            printSides: "single",
            colors: 1,
          };

          const result = await pricingService.calculatePrice(spec);

          // Calculate expected finishing cost from formula
          const finishingCosts = testFormula.finishingCosts;
          let expectedFinishingCost = 0;

          for (const option of options) {
            const cost =
              finishingCosts instanceof Map
                ? finishingCosts.get(option) || 0
                : (finishingCosts as any)?.[option] || 0;
            expectedFinishingCost += cost;
          }

          // Verify finishing details match
          const actualFinishingDetails = result.breakdown.finishingDetails;
          for (const option of options) {
            expect(actualFinishingDetails[option]).toBeDefined();
          }

          // Verify total finishing cost is sum of individual costs
          const totalFromDetails = Object.values(actualFinishingDetails).reduce(
            (sum, cost) => sum + cost,
            0
          );
          expect(totalFromDetails).toBe(expectedFinishingCost);
        }),
        { numRuns: 100 }
      );
    });

    it("should have higher total cost with more finishing options", async () => {
      const baseSpec: ProductSpecification = {
        productType: "business_card",
        size: { width: 90, height: 55, unit: "mm" },
        paperType: "standard",
        quantity: 100,
        finishingOptions: [],
        printSides: "single",
        colors: 1,
      };

      const specWithOptions: ProductSpecification = {
        ...baseSpec,
        finishingOptions: ["lamination", "uv_coating"],
      };

      const resultBase = await pricingService.calculatePrice(baseSpec);
      const resultWithOptions = await pricingService.calculatePrice(
        specWithOptions
      );

      // Cost with finishing options should be higher
      expect(resultWithOptions.costPrice).toBeGreaterThan(resultBase.costPrice);
    });
  });

  /**
   * **Feature: printz-platform-features, Property 4: Pricing Formula Determinism**
   * **Validates: Requirements 1.4**
   *
   * For any pricing formula and set of inputs, applying the formula multiple times
   * SHALL always produce the same output.
   */
  describe("Property 4: Pricing Formula Determinism", () => {
    it("should produce identical results for identical inputs", async () => {
      await fc.assert(
        fc.asyncProperty(validProductSpecArb, async (spec) => {
          // Calculate price multiple times with same inputs
          const result1 = await pricingService.calculatePrice(
            spec as ProductSpecification
          );
          const result2 = await pricingService.calculatePrice(
            spec as ProductSpecification
          );
          const result3 = await pricingService.calculatePrice(
            spec as ProductSpecification
          );

          // All results should be identical
          expect(result1.costPrice).toBe(result2.costPrice);
          expect(result2.costPrice).toBe(result3.costPrice);

          expect(result1.sellingPrice).toBe(result2.sellingPrice);
          expect(result2.sellingPrice).toBe(result3.sellingPrice);

          expect(result1.profitMargin).toBe(result2.profitMargin);
          expect(result2.profitMargin).toBe(result3.profitMargin);

          expect(result1.marginPercentage).toBe(result2.marginPercentage);
          expect(result2.marginPercentage).toBe(result3.marginPercentage);

          // Breakdown should also be identical
          expect(result1.breakdown.baseCost).toBe(result2.breakdown.baseCost);
          expect(result1.breakdown.paperCost).toBe(result2.breakdown.paperCost);
          expect(result1.breakdown.finishingCost).toBe(
            result2.breakdown.finishingCost
          );
          expect(result1.breakdown.totalCost).toBe(result2.breakdown.totalCost);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 5: Margin Warning Threshold**
   * **Validates: Requirements 1.5**
   *
   * For any pricing result where marginPercentage < minMargin,
   * the system SHALL return a warning indicator.
   */
  describe("Property 5: Margin Warning Threshold", () => {
    it("should return warning when margin is below minimum", () => {
      // Test the validateMargin method directly
      const minMargin = 15;

      // Generate pricing results with various margins
      const marginArb = fc.double({ min: 0, max: 30, noNaN: true });

      fc.assert(
        fc.property(marginArb, (marginPercentage) => {
          const mockPricingResult = {
            costPrice: 1000,
            sellingPrice: 1000 * (1 + marginPercentage / 100),
            profitMargin: (1000 * marginPercentage) / 100,
            marginPercentage,
          } as PricingResult;

          const validation = pricingService.validateMargin(
            mockPricingResult,
            minMargin
          );

          if (marginPercentage < minMargin) {
            // Should have warning
            expect(validation.warning).toBe(true);
            expect(validation.isValid).toBe(false);
            expect(validation.message).toBeDefined();
          } else {
            // Should not have warning
            expect(validation.warning).toBe(false);
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should include warning in pricing result when margin is low", async () => {
      // This test verifies the integration - that the warning appears in the result
      const spec: ProductSpecification = {
        productType: "business_card",
        size: { width: 90, height: 55, unit: "mm" },
        paperType: "standard",
        quantity: 100,
        finishingOptions: [],
        printSides: "single",
        colors: 1,
      };

      const result = await pricingService.calculatePrice(spec);

      // The result should have marginWarning field
      expect(result.marginWarning).toBeDefined();
      expect(typeof result.marginWarning).toBe("boolean");

      // If margin is below minMargin, warning should be true
      if (result.marginPercentage < testFormula.minMargin) {
        expect(result.marginWarning).toBe(true);
        expect(result.warningMessage).toBeDefined();
      }
    });
  });
});
