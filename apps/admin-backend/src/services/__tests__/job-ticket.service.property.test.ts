/**
 * Property-Based Tests for JobTicketService
 *
 * Tests correctness properties for job ticket generation and management
 * Uses fast-check for property-based testing
 */

import fc from "fast-check";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { JobTicketService } from "../job-ticket.service.js";
import { AssetRepository } from "../../repositories/asset.repository.js";
import { IAsset } from "../../models/asset.model.js";
import { JobTicket } from "../../models/job-ticket.model.js";
import "../../models/swag-order.model.js"; // Import to register the model for populate

// Mock Logger
jest.mock("../../utils/logger.js", () => ({
  Logger: {
    debug: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("JobTicketService - Property-Based Tests", () => {
  let mongoServer: MongoMemoryServer;
  let jobTicketService: JobTicketService;
  let assetRepository: AssetRepository;

  beforeAll(async () => {
    // Check if already connected (from setup.ts)
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    // Only disconnect if we created the connection
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    assetRepository = new AssetRepository();
    jobTicketService = new JobTicketService();
    // Replace the service's internal assetRepository with our mock
    (jobTicketService as any).assetRepository = assetRepository;
  });

  /**
   * Arbitraries for generating test data
   */

  const sizeArb = fc.record({
    width: fc.integer({ min: 10, max: 1000 }),
    height: fc.integer({ min: 10, max: 1000 }),
    unit: fc.constantFrom("mm", "cm", "inch"),
  });

  const specificationsArb = fc.record({
    productType: fc.constantFrom(
      "business-card",
      "flyer",
      "brochure",
      "poster",
      "banner"
    ),
    size: sizeArb,
    paperType: fc.constantFrom(
      "art-paper-300gsm",
      "couche-paper-250gsm",
      "kraft-paper-200gsm"
    ),
    quantity: fc.integer({ min: 1, max: 10000 }),
    printSides: fc.constantFrom("single", "double") as fc.Arbitrary<
      "single" | "double"
    >,
    colors: fc.integer({ min: 1, max: 8 }),
    finishingOptions: fc.array(
      fc.constantFrom("lamination", "die-cut", "folding", "binding"),
      { maxLength: 4 }
    ),
    specialInstructions: fc.oneof(
      fc.constant(""), // Empty string
      fc
        .string({ minLength: 1, maxLength: 200 })
        .map((s) => s.trim())
        .filter((s) => s.length > 0) // Non-empty after trim
    ),
  });

  /**
   * **Feature: printz-platform-features, Property 16: Job Ticket Specification Completeness**
   * **Validates: Requirements 6.1, 6.4**
   *
   * For any generated job ticket, the specifications SHALL include size, paperType,
   * quantity, finishingOptions, and specialInstructions.
   */
  it("Property 16: should include all required specifications in generated job ticket", async () => {
    await fc.assert(
      fc.asyncProperty(specificationsArb, async (specifications) => {
        // Use a unique orderId for each test run
        const orderId = new Types.ObjectId();
        const assetId = new Types.ObjectId();

        // Mock the assetRepository to return a FINAL asset
        jest.spyOn(assetRepository, "findByOrder").mockResolvedValue([
          {
            _id: assetId,
            orderId,
            filename: "test-asset.pdf",
            status: "final",
            version: 1,
          } as IAsset,
        ]);

        // Act: Generate job ticket
        const jobTicket = await jobTicketService.generateJobTicket({
          orderId: orderId.toString(),
          specifications,
        });

        // Assert: All required specifications are present
        expect(jobTicket.specifications).toBeDefined();
        expect(jobTicket.specifications.productType).toBe(
          specifications.productType
        );
        expect(jobTicket.specifications.size).toBeDefined();
        expect(jobTicket.specifications.size.width).toBe(
          specifications.size.width
        );
        expect(jobTicket.specifications.size.height).toBe(
          specifications.size.height
        );
        expect(jobTicket.specifications.size.unit).toBe(
          specifications.size.unit
        );
        expect(jobTicket.specifications.paperType).toBe(
          specifications.paperType
        );
        expect(jobTicket.specifications.quantity).toBe(specifications.quantity);
        expect(jobTicket.specifications.finishingOptions).toEqual(
          specifications.finishingOptions
        );
        expect(jobTicket.specifications.specialInstructions).toBe(
          specifications.specialInstructions
        );

        // Cleanup
        await JobTicket.deleteMany({ orderId });
        jest.restoreAllMocks();
      }),
      { numRuns: 50 } // Reduced from 100 for faster execution
    );
  }, 60000); // 60 second timeout

  /**
   * Additional property: Job ticket should only include FINAL assets
   */
  it("should only include FINAL assets in job ticket", async () => {
    await fc.assert(
      fc.asyncProperty(
        specificationsArb,
        fc.array(fc.constantFrom("draft", "review", "approved", "superseded"), {
          minLength: 1,
          maxLength: 5,
        }),
        async (specifications, nonFinalStatuses) => {
          // Use a unique orderId for each test run
          const orderId = new Types.ObjectId();
          const finalAssetId = new Types.ObjectId();

          // Create mock assets: 1 FINAL and multiple non-FINAL
          const mockAssets: Partial<IAsset>[] = [
            {
              _id: finalAssetId,
              orderId,
              filename: "final-asset.pdf",
              status: "final",
              version: 1,
            },
            ...nonFinalStatuses.map((status, index) => ({
              _id: new Types.ObjectId(),
              orderId,
              filename: `${status}-asset.pdf`,
              status: status as any,
              version: index + 2,
            })),
          ];

          // Mock the assetRepository
          jest
            .spyOn(assetRepository, "findByOrder")
            .mockResolvedValue(mockAssets as IAsset[]);

          // Generate job ticket
          const jobTicket = await jobTicketService.generateJobTicket({
            orderId: orderId.toString(),
            specifications,
          });

          // Assert: Only FINAL assets are included
          expect(jobTicket.assets).toHaveLength(1);
          expect(jobTicket.assets[0].toString()).toBe(finalAssetId.toString());

          // Cleanup
          await JobTicket.deleteMany({ orderId });
          jest.restoreAllMocks();
        }
      ),
      { numRuns: 30 } // Reduced for faster execution
    );
  }, 60000); // 60 second timeout

  /**
   * Additional property: Job ticket generation should fail without FINAL assets
   */
  it("should reject job ticket generation when no FINAL assets exist", async () => {
    await fc.assert(
      fc.asyncProperty(specificationsArb, async (specifications) => {
        // Use a unique orderId for each test run
        const orderId = new Types.ObjectId();

        // Mock the assetRepository to return only non-FINAL assets
        jest.spyOn(assetRepository, "findByOrder").mockResolvedValue([
          {
            _id: new Types.ObjectId(),
            orderId,
            filename: "draft-asset.pdf",
            status: "draft",
            version: 1,
          } as IAsset,
        ]);

        // Assert: Should throw validation error
        await expect(
          jobTicketService.generateJobTicket({
            orderId: orderId.toString(),
            specifications,
          })
        ).rejects.toThrow(/FINAL/);

        // Cleanup
        jest.restoreAllMocks();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property: Specifications validation
   */
  it("should validate required specification fields", async () => {
    const orderId = new Types.ObjectId().toString();
    const assetId = new Types.ObjectId();

    // Mock the assetRepository to return a FINAL asset
    jest.spyOn(assetRepository, "findByOrder").mockResolvedValue([
      {
        _id: assetId,
        orderId: new Types.ObjectId(orderId),
        filename: "test-asset.pdf",
        status: "final",
        version: 1,
      } as IAsset,
    ]);

    // Test missing productType
    await expect(
      jobTicketService.generateJobTicket({
        orderId,
        specifications: {
          productType: "",
          size: { width: 100, height: 100, unit: "mm" },
          paperType: "art-paper-300gsm",
          quantity: 100,
          printSides: "single",
          colors: 4,
          finishingOptions: [],
          specialInstructions: "",
        },
      })
    ).rejects.toThrow(/Loại sản phẩm/);

    // Test missing paperType
    await expect(
      jobTicketService.generateJobTicket({
        orderId,
        specifications: {
          productType: "business-card",
          size: { width: 100, height: 100, unit: "mm" },
          paperType: "",
          quantity: 100,
          printSides: "single",
          colors: 4,
          finishingOptions: [],
          specialInstructions: "",
        },
      })
    ).rejects.toThrow(/Loại giấy/);

    // Test invalid quantity
    await expect(
      jobTicketService.generateJobTicket({
        orderId,
        specifications: {
          productType: "business-card",
          size: { width: 100, height: 100, unit: "mm" },
          paperType: "art-paper-300gsm",
          quantity: 0,
          printSides: "single",
          colors: 4,
          finishingOptions: [],
          specialInstructions: "",
        },
      })
    ).rejects.toThrow(/Số lượng/);

    jest.restoreAllMocks();
  });

  /**
   * **Feature: printz-platform-features, Property 17: QR Code Uniqueness and Resolution**
   * **Validates: Requirements 6.2, 6.3**
   *
   * For any job ticket, the QR code SHALL be unique and scanning it SHALL return
   * the correct job ticket data.
   */
  it("Property 17: QR codes should be unique and resolvable", async () => {
    const orderId = new Types.ObjectId();
    const assetId = new Types.ObjectId();

    // Mock the assetRepository
    jest.spyOn(assetRepository, "findByOrder").mockResolvedValue([
      {
        _id: assetId,
        orderId,
        filename: "test-asset.pdf",
        status: "final",
        version: 1,
      } as IAsset,
    ]);

    // Generate multiple job tickets
    const tickets = [];
    for (let i = 0; i < 10; i++) {
      const ticket = await jobTicketService.generateJobTicket({
        orderId: orderId.toString(),
        specifications: {
          productType: "business-card",
          size: { width: 90, height: 50, unit: "mm" },
          paperType: "art-paper-300gsm",
          quantity: 100,
          printSides: "single",
          colors: 4,
          finishingOptions: [],
          specialInstructions: "",
        },
      });
      tickets.push(ticket);
    }

    // Assert: All QR codes are unique
    const qrCodes = tickets.map((t) => t.qrCode);
    const uniqueQRCodes = new Set(qrCodes);
    expect(uniqueQRCodes.size).toBe(qrCodes.length);

    // Assert: Each QR code can be resolved to its ticket
    for (const ticket of tickets) {
      const resolved = await jobTicketService.getTicketByQR(ticket.qrCode);
      expect(resolved.ticketId).toBe(ticket.ticketId);
      expect(resolved.qrCode).toBe(ticket.qrCode);
    }

    // Cleanup
    await JobTicket.deleteMany({ orderId });
    jest.restoreAllMocks();
  });
});
