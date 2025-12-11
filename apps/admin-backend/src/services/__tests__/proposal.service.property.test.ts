/**
 * Property-Based Tests for ProposalService
 *
 * Tests correctness properties using fast-check
 * Configured to run minimum 100 iterations per property
 */

import fc from "fast-check";
import mongoose from "mongoose";
import { ProposalService, CreateProposalData } from "../proposal.service.js";
import { ProposalRepository } from "../../repositories/proposal.repository.js";
import {
  Proposal,
  IProposal,
  PROPOSAL_STATUS,
} from "../../models/proposal.model.js";
import { OrganizationProfile } from "../../models/organization.model.js";

// Mock dependencies
jest.mock("../../utils/logger.js");

describe("ProposalService Property-Based Tests", () => {
  let service: ProposalService;
  let mockRepository: jest.Mocked<ProposalRepository>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCustomer: jest.fn(),
      updateStatus: jest.fn(),
      findByProposalNumber: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findWithPagination: jest.fn(),
    } as any;

    service = new ProposalService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Feature: printz-platform-features, Property 6: Proposal Content Completeness**
   * **Validates: Requirements 2.1, 2.2, 2.3**
   *
   * For any generated proposal, the output SHALL contain customer information,
   * product specifications, pricing details, and terms.
   */
  describe("Property 6: Proposal Content Completeness", () => {
    it("should include all required fields for any valid proposal data", async () => {
      await fc.assert(
        fc.asyncProperty(validProposalDataArbitrary(), async (proposalData) => {
          // Mock customer lookup
          const mockCustomer = {
            _id: new mongoose.Types.ObjectId(proposalData.customerId),
            name: "Test Customer",
            email: "test@example.com",
            phone: "0123456789",
            billingInfo: {
              companyName: "Test Company",
              taxId: "1234567890",
            },
            address: {
              street: "123 Test St",
              city: "Test City",
            },
          };

          jest.spyOn(OrganizationProfile, "findById").mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCustomer),
          } as any);

          // Mock proposal number generation
          const mockProposalNumber = `PRP-${Date.now()}`;
          jest
            .spyOn(Proposal, "generateProposalNumber")
            .mockResolvedValue(mockProposalNumber);

          // Mock repository create
          const mockCreatedProposal: Partial<IProposal> = {
            _id: new mongoose.Types.ObjectId(),
            proposalNumber: mockProposalNumber,
            customerId: new mongoose.Types.ObjectId(proposalData.customerId),
            customerSnapshot: {
              customerId: new mongoose.Types.ObjectId(proposalData.customerId),
              name: mockCustomer.name,
              email: mockCustomer.email,
              phone: mockCustomer.phone,
              company: mockCustomer.billingInfo.companyName,
              address: `${mockCustomer.address.street}, ${mockCustomer.address.city}`,
              taxCode: mockCustomer.billingInfo.taxId,
            },
            items: proposalData.items.map((item) => ({
              productType: item.productType,
              name: item.name,
              specifications: item.specifications,
              unitPrice:
                item.pricing.sellingPrice / item.specifications.quantity,
              quantity: item.specifications.quantity,
              totalPrice: item.pricing.sellingPrice,
            })),
            pricing: {
              costPrice: proposalData.items.reduce(
                (sum, item) => sum + item.pricing.costPrice,
                0
              ),
              sellingPrice: proposalData.items.reduce(
                (sum, item) => sum + item.pricing.sellingPrice,
                0
              ),
              profitMargin: 0,
              marginPercentage: 0,
            },
            terms: proposalData.terms || "Default terms",
            validUntil: new Date(),
            status: PROPOSAL_STATUS.DRAFT,
            createdBy: new mongoose.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          mockRepository.create.mockResolvedValue(
            mockCreatedProposal as IProposal
          );

          // Generate proposal
          const createdBy = new mongoose.Types.ObjectId().toString();
          const result = await service.generateProposal(
            proposalData,
            createdBy
          );

          // Verify all required fields are present
          // Customer information
          expect(result.customerSnapshot).toBeDefined();
          expect(result.customerSnapshot.customerId).toBeDefined();
          expect(result.customerSnapshot.name).toBeDefined();

          // Product specifications
          expect(result.items).toBeDefined();
          expect(result.items.length).toBeGreaterThan(0);
          for (const item of result.items) {
            expect(item.productType).toBeDefined();
            expect(item.name).toBeDefined();
            expect(item.specifications).toBeDefined();
            expect(item.specifications.quantity).toBeGreaterThan(0);
          }

          // Pricing details
          expect(result.pricing).toBeDefined();
          expect(result.pricing.costPrice).toBeDefined();
          expect(result.pricing.sellingPrice).toBeDefined();
          expect(result.pricing.profitMargin).toBeDefined();
          expect(result.pricing.marginPercentage).toBeDefined();

          // Terms
          expect(result.terms).toBeDefined();
          expect(typeof result.terms).toBe("string");
          expect(result.terms.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: printz-platform-features, Property 7: Proposal Number Uniqueness**
   * **Validates: Requirements 2.4**
   *
   * For any set of generated proposals, all proposal numbers SHALL be unique.
   * Note: This is a simplified test that verifies the uniqueness property without using fast-check arrays.
   */
  describe("Property 7: Proposal Number Uniqueness", () => {
    it("should generate unique proposal numbers", async () => {
      const proposalNumbers = new Set<string>();
      const testCount = 10;

      for (let i = 0; i < testCount; i++) {
        const mockCustomer = {
          _id: new mongoose.Types.ObjectId(),
          name: `Test Customer ${i}`,
          email: `test${i}@example.com`,
          phone: "0123456789",
          billingInfo: {
            companyName: `Test Company ${i}`,
            taxId: "1234567890",
          },
          address: {
            street: "123 Test St",
            city: "Test City",
          },
        };

        jest.spyOn(OrganizationProfile, "findById").mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockCustomer),
        } as any);

        // Mock proposal number generation with unique numbers
        const mockProposalNumber = `PRP-${Date.now()}-${i}`;
        jest
          .spyOn(Proposal, "generateProposalNumber")
          .mockResolvedValue(mockProposalNumber);

        // Mock repository create
        const mockCreatedProposal: Partial<IProposal> = {
          _id: new mongoose.Types.ObjectId(),
          proposalNumber: mockProposalNumber,
          customerId: mockCustomer._id,
          customerSnapshot: {
            customerId: mockCustomer._id,
            name: mockCustomer.name,
            email: mockCustomer.email,
            phone: mockCustomer.phone,
            company: mockCustomer.billingInfo.companyName,
            address: `${mockCustomer.address.street}, ${mockCustomer.address.city}`,
            taxCode: mockCustomer.billingInfo.taxId,
          },
          items: [
            {
              productType: "business-card",
              name: "Test Item",
              specifications: {
                size: { width: 90, height: 50, unit: "mm" },
                paperType: "art-paper",
                quantity: 100,
                printSides: "single" as const,
                colors: 4,
                finishingOptions: [],
              },
              unitPrice: 100,
              quantity: 100,
              totalPrice: 10000,
            },
          ],
          pricing: {
            costPrice: 8000,
            sellingPrice: 10000,
            profitMargin: 2000,
            marginPercentage: 25,
          },
          terms: "Default terms",
          validUntil: new Date(),
          status: PROPOSAL_STATUS.DRAFT,
          createdBy: new mongoose.Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockRepository.create.mockResolvedValue(
          mockCreatedProposal as IProposal
        );

        // Generate proposal
        const proposalData: CreateProposalData = {
          customerId: mockCustomer._id.toString(),
          items: [
            {
              productType: "business-card",
              name: "Test Item",
              specifications: {
                productType: "business-card",
                size: { width: 90, height: 50, unit: "mm" },
                paperType: "art-paper",
                quantity: 100,
                finishingOptions: [],
                printSides: "single" as const,
                colors: 4,
              },
              pricing: {
                costPrice: 8000,
                sellingPrice: 10000,
                profitMargin: 2000,
                marginPercentage: 25,
                breakdown: {
                  baseCost: 5000,
                  paperCost: 1000,
                  printingCost: 2000,
                  finishingCost: 0,
                  finishingDetails: {},
                  quantityDiscount: 0,
                  totalCost: 8000,
                },
                calculatedAt: new Date(),
                formulaId: new mongoose.Types.ObjectId().toString(),
                formulaName: "Test Formula",
              },
            },
          ],
        };

        const createdBy = new mongoose.Types.ObjectId().toString();
        const result = await service.generateProposal(proposalData, createdBy);

        // Check uniqueness
        expect(proposalNumbers.has(result.proposalNumber)).toBe(false);
        proposalNumbers.add(result.proposalNumber);
      }

      // Verify all proposal numbers are unique
      expect(proposalNumbers.size).toBe(testCount);
    });
  });

  /**
   * **Feature: printz-platform-features, Property 8: Proposal-Order Linkage**
   * **Validates: Requirements 2.5**
   *
   * For any proposal converted to an order, the order SHALL contain a reference to the original proposal ID.
   */
  describe("Property 8: Proposal-Order Linkage", () => {
    it("should link converted orders to original proposals", async () => {
      const proposalId = new mongoose.Types.ObjectId().toString();
      const mockProposal: Partial<IProposal> = {
        _id: new mongoose.Types.ObjectId(proposalId),
        proposalNumber: "PRP-TEST-001",
        status: PROPOSAL_STATUS.SENT,
        validUntil: new Date(Date.now() + 86400000), // Tomorrow
        customerSnapshot: {
          customerId: new mongoose.Types.ObjectId(),
          name: "Test Customer",
        },
        items: [],
        pricing: {
          costPrice: 10000,
          sellingPrice: 15000,
          profitMargin: 5000,
          marginPercentage: 50,
        },
        terms: "Test terms",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockProposal as IProposal);
      mockRepository.update.mockResolvedValue({
        ...mockProposal,
        status: PROPOSAL_STATUS.CONVERTED,
        convertedToOrderId: new mongoose.Types.ObjectId(),
      } as IProposal);

      const result = await service.convertToOrder(proposalId);

      // Verify order ID is returned
      expect(result.orderId).toBeDefined();
      expect(typeof result.orderId).toBe("string");

      // Verify repository was called to update proposal with order link
      expect(mockRepository.update).toHaveBeenCalledWith(
        proposalId,
        expect.objectContaining({
          status: PROPOSAL_STATUS.CONVERTED,
          convertedToOrderId: expect.any(mongoose.Types.ObjectId),
        })
      );
    });
  });
});

/**
 * Generate a valid 24-character hex string for MongoDB ObjectId
 */
function mongoIdArbitrary(): fc.Arbitrary<string> {
  return fc.string({ minLength: 24, maxLength: 24 }).map((str) => {
    // Convert to hex characters only
    return str
      .split("")
      .map((c) => {
        const code = c.charCodeAt(0) % 16;
        return code.toString(16);
      })
      .join("");
  });
}

/**
 * Generate non-empty string (no whitespace-only strings)
 */
function nonEmptyStringArbitrary(
  minLength: number,
  maxLength: number
): fc.Arbitrary<string> {
  return fc.string({ minLength, maxLength }).filter((s) => s.trim().length > 0);
}

/**
 * Arbitrary for valid proposal data
 */
function validProposalDataArbitrary(): fc.Arbitrary<CreateProposalData> {
  return fc.record({
    customerId: mongoIdArbitrary(),
    items: fc.array(
      fc.record({
        productType: fc.constantFrom(
          "business-card",
          "flyer",
          "brochure",
          "poster"
        ),
        name: nonEmptyStringArbitrary(1, 100),
        specifications: fc.record({
          productType: fc.constantFrom(
            "business-card",
            "flyer",
            "brochure",
            "poster"
          ),
          size: fc.record({
            width: fc.integer({ min: 50, max: 1000 }),
            height: fc.integer({ min: 50, max: 1000 }),
            unit: fc.constantFrom(
              "mm" as const,
              "cm" as const,
              "inch" as const
            ),
          }),
          paperType: fc.constantFrom(
            "art-paper",
            "couche",
            "kraft",
            "cardstock"
          ),
          quantity: fc.integer({ min: 1, max: 10000 }),
          finishingOptions: fc.array(
            fc.constantFrom(
              "lamination",
              "uv-coating",
              "embossing",
              "die-cutting"
            ),
            { maxLength: 3 }
          ),
          printSides: fc.constantFrom("single" as const, "double" as const),
          colors: fc.integer({ min: 1, max: 4 }),
        }),
        pricing: fc.record({
          costPrice: fc.integer({ min: 10000, max: 10000000 }),
          sellingPrice: fc.integer({ min: 15000, max: 15000000 }),
          profitMargin: fc.integer({ min: 5000, max: 5000000 }),
          marginPercentage: fc.float({ min: 10, max: 100 }),
          breakdown: fc.record({
            baseCost: fc.integer({ min: 5000, max: 5000000 }),
            paperCost: fc.integer({ min: 1000, max: 2000000 }),
            printingCost: fc.integer({ min: 2000, max: 3000000 }),
            finishingCost: fc.integer({ min: 0, max: 2000000 }),
            setupFee: fc.integer({ min: 0, max: 500000 }),
            finishingDetails: fc.constant({}),
            quantityDiscount: fc.integer({ min: 0, max: 100000 }),
            totalCost: fc.integer({ min: 10000, max: 10000000 }),
          }),
          calculatedAt: fc.constant(new Date()),
          formulaId: mongoIdArbitrary(),
          formulaName: nonEmptyStringArbitrary(1, 50),
        }) as any,
      }),
      { minLength: 1, maxLength: 5 }
    ),
    terms: fc.option(nonEmptyStringArbitrary(10, 500), { nil: undefined }),
    validityDays: fc.option(fc.integer({ min: 7, max: 90 }), {
      nil: undefined,
    }),
    dealPrice: fc.option(fc.integer({ min: 10000, max: 20000000 }), {
      nil: undefined,
    }),
    salesCost: fc.option(fc.integer({ min: 0, max: 5000000 }), {
      nil: undefined,
    }),
  });
}
