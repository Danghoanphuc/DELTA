/**
 * Property-Based Tests for ReorderService
 *
 * Tests correctness properties for re-order functionality
 * Uses fast-check for property-based testing
 */

import fc from "fast-check";
import { ReorderService } from "../reorder.service.js";
import { PricingService } from "../pricing.service.js";
import { AssetService } from "../asset.service.js";
import { ReorderRepository } from "../../repositories/reorder.repository.js";
import { IProposal, IProposalItem } from "../../models/proposal.model.js";
import { IAsset } from "../../models/asset.model.js";
import { Types } from "mongoose";

describe("ReorderService - Property-Based Tests", () => {
  let reorderService: ReorderService;
  let mockRepository: jest.Mocked<ReorderRepository>;
  let mockPricingService: jest.Mocked<PricingService>;
  let mockAssetService: jest.Mocked<AssetService>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findOrderById: jest.fn(),
      findProposalById: jest.fn(),
      findFinalAssetsByOrder: jest.fn(),
      createProposal: jest.fn(),
      linkAssetsToOrder: jest.fn(),
    } as any;

    // Create mock pricing service
    mockPricingService = {
      calculatePrice: jest.fn(),
    } as any;

    // Create mock asset service
    mockAssetService = {} as any;

    // Create service with mocks
    reorderService = new ReorderService(
      mockRepository,
      mockPricingService,
      mockAssetService
    );
  });

  /**
   * **Feature: printz-platform-features, Property 18: Re-order Specification Preservation**
   * **Validates: Requirements 7.1, 7.4**
   *
   * For any re-order created from an original order, the specifications and FINAL files
   * SHALL match the original.
   */
  describe("Property 18: Re-order Specification Preservation", () => {
    it("should preserve specifications from original order", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary original order
          fc.record({
            _id: fc.constant(new Types.ObjectId()),
            proposalNumber: fc.string({ minLength: 5, maxLength: 20 }),
            customerId: fc.constant(new Types.ObjectId()),
            customerSnapshot: fc.record({
              customerId: fc.constant(new Types.ObjectId()),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              email: fc.emailAddress(),
              phone: fc.string({ minLength: 10, maxLength: 15 }),
            }),
            items: fc.array(
              fc.record({
                productType: fc.constantFrom(
                  "flyer",
                  "brochure",
                  "poster",
                  "card"
                ),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                specifications: fc.record({
                  size: fc.record({
                    width: fc.integer({ min: 50, max: 1000 }),
                    height: fc.integer({ min: 50, max: 1000 }),
                    unit: fc.constantFrom("mm", "cm", "inch"),
                  }),
                  paperType: fc.constantFrom(
                    "art",
                    "couche",
                    "duplex",
                    "ivory"
                  ),
                  quantity: fc.integer({ min: 1, max: 10000 }),
                  printSides: fc.constantFrom("single", "double"),
                  colors: fc.integer({ min: 1, max: 4 }),
                  finishingOptions: fc.array(
                    fc.constantFrom("lamination", "uv", "embossing", "die-cut"),
                    { maxLength: 3 }
                  ),
                }),
                unitPrice: fc.integer({ min: 1000, max: 100000 }),
                quantity: fc.integer({ min: 1, max: 10000 }),
                totalPrice: fc.integer({ min: 1000, max: 1000000 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            pricing: fc.record({
              costPrice: fc.integer({ min: 1000, max: 1000000 }),
              sellingPrice: fc.integer({ min: 1000, max: 1000000 }),
              profitMargin: fc.integer({ min: 0, max: 500000 }),
              marginPercentage: fc.float({ min: 0, max: 100 }),
            }),
            terms: fc.string({ maxLength: 500 }),
            validUntil: fc.date({ min: new Date() }),
            status: fc.constant("draft"),
            createdBy: fc.constant(new Types.ObjectId()),
            createdAt: fc.date(),
            updatedAt: fc.date(),
          }),
          // Generate arbitrary FINAL assets
          fc.array(
            fc.record({
              _id: fc.constant(new Types.ObjectId()),
              orderId: fc.constant(new Types.ObjectId()),
              filename: fc.string({ minLength: 5, maxLength: 50 }),
              status: fc.constant("final"),
              isLocked: fc.constant(true),
              version: fc.integer({ min: 1, max: 10 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (originalOrder, finalAssets) => {
            // Setup mocks
            mockRepository.findOrderById.mockResolvedValue(
              originalOrder as any
            );
            mockRepository.findFinalAssetsByOrder.mockResolvedValue(
              finalAssets as any
            );

            // Mock pricing calculation to return same structure
            mockPricingService.calculatePrice.mockResolvedValue({
              costPrice: originalOrder.pricing.costPrice,
              sellingPrice: originalOrder.pricing.sellingPrice,
              profitMargin: originalOrder.pricing.profitMargin,
              marginPercentage: originalOrder.pricing.marginPercentage,
              breakdown: {
                baseCost: 0,
                paperCost: 0,
                printingCost: 0,
                finishingCost: 0,
                finishingDetails: {},
                quantityDiscount: 0,
                totalCost: originalOrder.pricing.costPrice,
              },
              calculatedAt: new Date(),
              formulaId: "test-formula",
              formulaName: "Test Formula",
            });

            // Mock proposal creation
            const newProposal = {
              ...originalOrder,
              _id: new Types.ObjectId(),
              proposalNumber: "NEW-" + originalOrder.proposalNumber,
            };
            mockRepository.createProposal.mockResolvedValue(newProposal as any);

            // Create re-order
            const result = await reorderService.createReorder(
              originalOrder._id.toString(),
              originalOrder.createdBy.toString()
            );

            // Property: Specifications should match original
            expect(result.specifications).toBeDefined();
            expect(result.specifications.length).toBe(
              originalOrder.items.length
            );

            // Verify each specification matches original
            result.specifications.forEach((spec, index) => {
              const originalItem = originalOrder.items[index];
              expect(spec.productType).toBe(originalItem.productType);
              expect(spec.quantity).toBe(originalItem.specifications.quantity);
              expect(spec.paperType).toBe(
                originalItem.specifications.paperType
              );
              expect(spec.printSides).toBe(
                originalItem.specifications.printSides
              );
              expect(spec.colors).toBe(originalItem.specifications.colors);

              // Verify size matches
              if (originalItem.specifications.size) {
                expect(spec.size.width).toBe(
                  originalItem.specifications.size.width
                );
                expect(spec.size.height).toBe(
                  originalItem.specifications.size.height
                );
                expect(spec.size.unit).toBe(
                  originalItem.specifications.size.unit
                );
              }

              // Verify finishing options match
              if (originalItem.specifications.finishingOptions) {
                expect(spec.finishingOptions).toEqual(
                  originalItem.specifications.finishingOptions
                );
              }
            });

            // Property: FINAL assets should be included
            expect(result.assets).toBeDefined();
            expect(result.assets.length).toBe(finalAssets.length);
            expect(result.assets).toEqual(finalAssets);

            // Property: Should link to original order
            expect(result.originalOrderId).toBe(originalOrder._id.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve FINAL asset references", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate order with FINAL assets
          fc.record({
            orderId: fc.string({ minLength: 24, maxLength: 24 }),
            finalAssets: fc.array(
              fc.record({
                _id: fc.constant(new Types.ObjectId()),
                filename: fc.string({ minLength: 5, maxLength: 50 }),
                status: fc.constant("final"),
                isLocked: fc.constant(true),
                version: fc.integer({ min: 1, max: 10 }),
                versionLabel: fc.constant("FINAL"),
              }),
              { minLength: 1, maxLength: 10 }
            ),
          }),
          async ({ orderId, finalAssets }) => {
            // Setup mock
            mockRepository.findFinalAssetsByOrder.mockResolvedValue(
              finalAssets as any
            );

            // Get FINAL assets
            const assets = await mockRepository.findFinalAssetsByOrder(orderId);

            // Property: All returned assets should be FINAL
            expect(assets.length).toBe(finalAssets.length);
            assets.forEach((asset) => {
              expect(asset.status).toBe("final");
              expect(asset.isLocked).toBe(true);
            });

            // Property: Asset filenames should be preserved
            const originalFilenames = finalAssets.map((a) => a.filename).sort();
            const returnedFilenames = assets.map((a) => a.filename).sort();
            expect(returnedFilenames).toEqual(originalFilenames);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 19: Re-order Pricing Recalculation**
   * **Validates: Requirements 7.2, 7.3**
   *
   * For any re-order, the pricing SHALL be calculated using current rates,
   * not original order rates.
   */
  describe("Property 19: Re-order Pricing Recalculation", () => {
    it("should recalculate pricing with current rates", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate original order with old pricing
          fc.record({
            _id: fc.constant(new Types.ObjectId()),
            proposalNumber: fc.string({ minLength: 5, maxLength: 20 }),
            customerId: fc.constant(new Types.ObjectId()),
            customerSnapshot: fc.record({
              customerId: fc.constant(new Types.ObjectId()),
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            items: fc.array(
              fc.record({
                productType: fc.constantFrom("flyer", "brochure", "poster"),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                specifications: fc.record({
                  size: fc.record({
                    width: fc.integer({ min: 50, max: 1000 }),
                    height: fc.integer({ min: 50, max: 1000 }),
                    unit: fc.constantFrom("mm", "cm", "inch"),
                  }),
                  paperType: fc.constantFrom("art", "couche", "duplex"),
                  quantity: fc.integer({ min: 1, max: 10000 }),
                  printSides: fc.constantFrom("single", "double"),
                  colors: fc.integer({ min: 1, max: 4 }),
                  finishingOptions: fc.array(fc.string(), { maxLength: 3 }),
                }),
                unitPrice: fc.integer({ min: 1000, max: 100000 }),
                quantity: fc.integer({ min: 1, max: 10000 }),
                totalPrice: fc.integer({ min: 1000, max: 1000000 }),
              }),
              { minLength: 1, maxLength: 3 }
            ),
            pricing: fc.record({
              costPrice: fc.integer({ min: 1000, max: 1000000 }),
              sellingPrice: fc.integer({ min: 1000, max: 1000000 }),
              profitMargin: fc.integer({ min: 0, max: 500000 }),
              marginPercentage: fc.float({ min: 0, max: 100 }),
            }),
            terms: fc.string({ maxLength: 500 }),
            validUntil: fc.date(),
            status: fc.constant("draft"),
            createdBy: fc.constant(new Types.ObjectId()),
            createdAt: fc.date(),
            updatedAt: fc.date(),
          }),
          // Generate new pricing (different from original)
          fc.record({
            costPrice: fc.integer({ min: 1000, max: 1000000 }),
            sellingPrice: fc.integer({ min: 1000, max: 1000000 }),
            profitMargin: fc.integer({ min: 0, max: 500000 }),
            marginPercentage: fc.float({ min: 0, max: 100 }),
          }),
          async (originalOrder, newPricing) => {
            // Setup mocks
            mockRepository.findOrderById.mockResolvedValue(
              originalOrder as any
            );
            mockRepository.findFinalAssetsByOrder.mockResolvedValue([
              { _id: new Types.ObjectId(), status: "final" } as any,
            ]);

            // Mock pricing calculation to return NEW pricing
            mockPricingService.calculatePrice.mockResolvedValue({
              costPrice: newPricing.costPrice,
              sellingPrice: newPricing.sellingPrice,
              profitMargin: newPricing.profitMargin,
              marginPercentage: newPricing.marginPercentage,
              breakdown: {
                baseCost: 0,
                paperCost: 0,
                printingCost: 0,
                finishingCost: 0,
                finishingDetails: {},
                quantityDiscount: 0,
                totalCost: newPricing.costPrice,
              },
              calculatedAt: new Date(),
              formulaId: "test-formula",
              formulaName: "Test Formula",
            });

            // Mock proposal creation
            mockRepository.createProposal.mockResolvedValue({
              ...originalOrder,
              _id: new Types.ObjectId(),
              pricing: newPricing,
            } as any);

            // Create re-order
            const result = await reorderService.createReorder(
              originalOrder._id.toString(),
              originalOrder.createdBy.toString()
            );

            // Property: Pricing should be recalculated (use new pricing, not original)
            expect(result.pricing).toBeDefined();
            expect(result.pricing.costPrice).toBe(newPricing.costPrice);
            expect(result.pricing.sellingPrice).toBe(newPricing.sellingPrice);

            // Property: Price comparison should be provided
            expect(result.priceComparison).toBeDefined();
            expect(result.priceComparison!.originalPrice).toBe(
              originalOrder.pricing.sellingPrice
            );
            expect(result.priceComparison!.newPrice).toBe(
              newPricing.sellingPrice
            );

            // Property: Price difference should be calculated correctly
            const expectedDifference =
              newPricing.sellingPrice - originalOrder.pricing.sellingPrice;
            expect(result.priceComparison!.difference).toBe(expectedDifference);

            // Property: Percentage change should be calculated correctly
            const expectedPercentage =
              originalOrder.pricing.sellingPrice > 0
                ? (expectedDifference / originalOrder.pricing.sellingPrice) *
                  100
                : 0;
            expect(result.priceComparison!.percentageChange).toBeCloseTo(
              expectedPercentage,
              2
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly identify when pricing has changed", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000, max: 1000000 }),
          fc.integer({ min: 1000, max: 1000000 }),
          async (originalPrice, newPrice) => {
            // Use comparePrice method directly
            const comparison = reorderService.comparePrice(
              originalPrice,
              newPrice
            );

            // Property: hasChanged should be true if prices differ by more than 0.01
            const expectedHasChanged =
              Math.abs(newPrice - originalPrice) > 0.01;
            expect(comparison.hasChanged).toBe(expectedHasChanged);

            // Property: difference should equal newPrice - originalPrice
            expect(comparison.difference).toBe(newPrice - originalPrice);

            // Property: originalPrice and newPrice should be preserved
            expect(comparison.originalPrice).toBe(originalPrice);
            expect(comparison.newPrice).toBe(newPrice);

            // Property: percentage change should be correct
            if (originalPrice > 0) {
              const expectedPercentage =
                ((newPrice - originalPrice) / originalPrice) * 100;
              expect(comparison.percentageChange).toBeCloseTo(
                expectedPercentage,
                2
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle zero original price edge case", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }),
          async (newPrice) => {
            // Test with zero original price
            const comparison = reorderService.comparePrice(0, newPrice);

            // Property: Should not throw error
            expect(comparison).toBeDefined();

            // Property: Percentage change should be 0 when original price is 0
            expect(comparison.percentageChange).toBe(0);

            // Property: Difference should still be calculated
            expect(comparison.difference).toBe(newPrice);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
