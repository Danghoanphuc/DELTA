/**
 * Proposal PDF Generation Test
 *
 * Tests the Puppeteer-based PDF generation for proposals
 */

import { ProposalService } from "../proposal.service.js";
import { Proposal } from "../../models/proposal.model.js";
import { OrganizationProfile } from "../../models/organization.model.js";
import { Types } from "mongoose";

// Mock dependencies
jest.mock("../../models/proposal.model.js");
jest.mock("../../models/organization.model.js");
jest.mock("../../utils/pdf-generator.js", () => ({
  generatePDFFromHTML: jest
    .fn()
    .mockResolvedValue(Buffer.from("mock-pdf-content")),
}));

describe("ProposalService - PDF Generation", () => {
  let service: ProposalService;

  beforeEach(() => {
    service = new ProposalService();
    jest.clearAllMocks();
  });

  describe("generatePDF", () => {
    it("should generate PDF with correct template data", async () => {
      // Arrange
      const mockProposal = {
        _id: new Types.ObjectId(),
        proposalNumber: "PROP-2024-001",
        createdAt: new Date("2024-01-15"),
        validUntil: new Date("2024-02-15"),
        customerSnapshot: {
          customerId: new Types.ObjectId(),
          name: "John Doe",
          email: "john@example.com",
          phone: "0123456789",
          company: "Example Corp",
          address: "123 Main St, City",
          taxCode: "1234567890",
        },
        items: [
          {
            name: "Business Cards",
            productType: "business-card",
            specifications: {
              size: { width: 90, height: 50, unit: "mm" },
              paperType: "Coated 300gsm",
              quantity: 1000,
              printSides: "double",
              colors: 4,
              finishingOptions: ["lamination", "rounded-corners"],
            },
            unitPrice: 50,
            quantity: 1000,
            totalPrice: 50000,
          },
        ],
        pricing: {
          costPrice: 30000,
          sellingPrice: 50000,
          profitMargin: 20000,
          marginPercentage: 66.67,
        },
        dealPrice: 45000,
        terms: "Payment terms: 50% upfront, 50% on delivery",
        status: "draft",
      };

      // Mock repository method
      jest.spyOn(service as any, "getProposal").mockResolvedValue(mockProposal);

      // Act
      const pdfBuffer = await service.generatePDF(mockProposal._id.toString());

      // Assert
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect((service as any).getProposal).toHaveBeenCalledWith(
        mockProposal._id.toString()
      );
    });

    it("should handle proposals without deal price", async () => {
      // Arrange
      const mockProposal = {
        _id: new Types.ObjectId(),
        proposalNumber: "PROP-2024-002",
        createdAt: new Date("2024-01-15"),
        validUntil: new Date("2024-02-15"),
        customerSnapshot: {
          customerId: new Types.ObjectId(),
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "0987654321",
          company: "Test Company",
          address: "456 Oak Ave, Town",
        },
        items: [
          {
            name: "Flyers",
            productType: "flyer",
            specifications: {
              size: { width: 210, height: 297, unit: "mm" },
              paperType: "Uncoated 150gsm",
              quantity: 500,
              printSides: "single",
              colors: 4,
              finishingOptions: [],
            },
            unitPrice: 20,
            quantity: 500,
            totalPrice: 10000,
          },
        ],
        pricing: {
          costPrice: 6000,
          sellingPrice: 10000,
          profitMargin: 4000,
          marginPercentage: 66.67,
        },
        terms: "Standard terms apply",
        status: "draft",
      };

      // Mock repository method
      jest.spyOn(service as any, "getProposal").mockResolvedValue(mockProposal);

      // Act
      const pdfBuffer = await service.generatePDF(mockProposal._id.toString());

      // Assert
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should throw error if proposal not found", async () => {
      // Arrange
      const proposalId = new Types.ObjectId().toString();
      jest
        .spyOn(service as any, "getProposal")
        .mockRejectedValue(new Error("Proposal not found"));

      // Act & Assert
      await expect(service.generatePDF(proposalId)).rejects.toThrow(
        "Proposal not found"
      );
    });
  });
});
