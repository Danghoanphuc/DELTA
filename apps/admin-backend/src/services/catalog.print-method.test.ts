// apps/admin-backend/src/services/catalog.print-method.test.ts
// ✅ Unit Tests for Print Method Service
// Phase 3.1.1: Print Method Configuration

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  calculateCustomizationCost,
  validateArtworkForPrintMethod,
  estimateLeadTime,
  IPrintMethod,
  IArtworkRequirements,
  IEnhancedCatalogProduct,
  DEFAULT_PRINT_METHODS,
} from "../models/catalog.models.enhanced.js";

describe("Print Method Service - Unit Tests", () => {
  describe("calculateCustomizationCost", () => {
    const mockPrintMethod: IPrintMethod = {
      method: "screen_print",
      displayName: "Screen Printing",
      areas: [
        {
          name: "front",
          displayName: "Front",
          maxWidth: 300,
          maxHeight: 400,
          allowedColors: 4,
          setupFee: 50000,
          unitCost: 15000,
          isRequired: false,
        },
        {
          name: "back",
          displayName: "Back",
          maxWidth: 300,
          maxHeight: 400,
          allowedColors: 4,
          setupFee: 50000,
          unitCost: 15000,
          isRequired: false,
        },
      ],
      artworkRequirements: {
        minResolution: 300,
        acceptedFormats: ["AI", "EPS"],
        colorMode: "CMYK",
        maxFileSize: 50,
        requiresVectorFile: true,
        requiresTransparentBackground: false,
      },
      leadTime: { min: 5, max: 7, unit: "days" },
      isActive: true,
      sortOrder: 1,
    };

    it("should calculate cost for single print area", () => {
      const result = calculateCustomizationCost(
        mockPrintMethod,
        ["front"],
        100
      );

      expect(result.setupFees).toBe(50000);
      expect(result.unitCosts).toBe(1500000); // 15000 * 100
      expect(result.totalCost).toBe(1550000);
    });

    it("should calculate cost for multiple print areas", () => {
      const result = calculateCustomizationCost(
        mockPrintMethod,
        ["front", "back"],
        100
      );

      expect(result.setupFees).toBe(100000); // 50000 * 2
      expect(result.unitCosts).toBe(3000000); // 15000 * 100 * 2
      expect(result.totalCost).toBe(3100000);
    });

    it("should scale unit costs with quantity", () => {
      const result50 = calculateCustomizationCost(
        mockPrintMethod,
        ["front"],
        50
      );
      const result100 = calculateCustomizationCost(
        mockPrintMethod,
        ["front"],
        100
      );

      expect(result100.unitCosts).toBe(result50.unitCosts * 2);
      expect(result100.setupFees).toBe(result50.setupFees); // Setup fee doesn't scale
    });

    it("should return zero cost for empty areas", () => {
      const result = calculateCustomizationCost(mockPrintMethod, [], 100);

      expect(result.setupFees).toBe(0);
      expect(result.unitCosts).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it("should ignore non-existent areas", () => {
      const result = calculateCustomizationCost(
        mockPrintMethod,
        ["front", "non_existent"],
        100
      );

      expect(result.setupFees).toBe(50000); // Only front
      expect(result.unitCosts).toBe(1500000); // Only front
    });
  });

  describe("validateArtworkForPrintMethod", () => {
    const mockRequirements: IArtworkRequirements = {
      minResolution: 300,
      acceptedFormats: ["AI", "EPS", "PDF"],
      colorMode: "CMYK",
      maxFileSize: 50,
      requiresVectorFile: true,
      requiresTransparentBackground: false,
    };

    it("should validate correct artwork", () => {
      const artwork = {
        resolution: 300,
        format: "AI",
        fileSize: 25,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: true,
      };

      const result = validateArtworkForPrintMethod(artwork, mockRequirements);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject low resolution artwork", () => {
      const artwork = {
        resolution: 150,
        format: "AI",
        fileSize: 25,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: true,
      };

      const result = validateArtworkForPrintMethod(artwork, mockRequirements);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining("Resolution 150dpi is below minimum 300dpi")
      );
    });

    it("should reject invalid file format", () => {
      const artwork = {
        resolution: 300,
        format: "JPG",
        fileSize: 25,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: true,
      };

      const result = validateArtworkForPrintMethod(artwork, mockRequirements);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining("Format JPG is not accepted")
      );
    });

    it("should reject oversized files", () => {
      const artwork = {
        resolution: 300,
        format: "AI",
        fileSize: 75,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: true,
      };

      const result = validateArtworkForPrintMethod(artwork, mockRequirements);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining("File size 75MB exceeds maximum 50MB")
      );
    });

    it("should reject non-vector when vector required", () => {
      const artwork = {
        resolution: 300,
        format: "AI",
        fileSize: 25,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: false,
      };

      const result = validateArtworkForPrintMethod(artwork, mockRequirements);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Vector file is required for this print method"
      );
    });

    it("should reject non-transparent when transparency required", () => {
      const requirements = {
        ...mockRequirements,
        requiresTransparentBackground: true,
      };

      const artwork = {
        resolution: 300,
        format: "AI",
        fileSize: 25,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: true,
      };

      const result = validateArtworkForPrintMethod(artwork, requirements);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Transparent background is required for this print method"
      );
    });

    it("should accumulate multiple errors", () => {
      const artwork = {
        resolution: 150,
        format: "JPG",
        fileSize: 75,
        colorMode: "CMYK",
        hasTransparency: false,
        isVector: false,
      };

      const result = validateArtworkForPrintMethod(artwork, mockRequirements);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("estimateLeadTime", () => {
    const mockProduct = {
      printMethods: [
        {
          method: "screen_print",
          leadTime: { min: 5, max: 7, unit: "days" as const },
        },
      ],
      productionComplexity: {
        score: 5,
        factors: ["standard"],
        estimatedLeadTimeDays: 7,
      },
    } as unknown as IEnhancedCatalogProduct;

    it("should calculate base lead time for simple product", () => {
      const result = estimateLeadTime(mockProduct, "screen_print", 50);

      expect(result.minDays).toBeGreaterThanOrEqual(5);
      expect(result.maxDays).toBeGreaterThanOrEqual(7);
    });

    it("should increase lead time for complex products", () => {
      const complexProduct = {
        ...mockProduct,
        productionComplexity: {
          score: 10,
          factors: ["multiple_techniques"],
          estimatedLeadTimeDays: 14,
        },
      } as unknown as IEnhancedCatalogProduct;

      const result = estimateLeadTime(complexProduct, "screen_print", 50);

      expect(result.minDays).toBeGreaterThan(5);
      expect(result.maxDays).toBeGreaterThan(7);
    });

    it("should increase lead time for large quantities", () => {
      const smallQty = estimateLeadTime(mockProduct, "screen_print", 50);
      const largeQty = estimateLeadTime(mockProduct, "screen_print", 150);

      expect(largeQty.minDays).toBeGreaterThan(smallQty.minDays);
      expect(largeQty.maxDays).toBeGreaterThan(smallQty.maxDays);
    });

    it("should add notes for high complexity", () => {
      const complexProduct = {
        ...mockProduct,
        productionComplexity: {
          score: 8,
          factors: ["complex"],
          estimatedLeadTimeDays: 12,
        },
      } as unknown as IEnhancedCatalogProduct;

      const result = estimateLeadTime(complexProduct, "screen_print", 50);

      expect(result.notes).toContain(
        expect.stringContaining("High complexity")
      );
    });

    it("should add notes for large quantities", () => {
      const result = estimateLeadTime(mockProduct, "screen_print", 150);

      expect(result.notes).toContain(expect.stringContaining("Large quantity"));
    });
  });

  describe("DEFAULT_PRINT_METHODS", () => {
    it("should have TSHIRT_SCREEN_PRINT template", () => {
      expect(DEFAULT_PRINT_METHODS.TSHIRT_SCREEN_PRINT).toBeDefined();
      expect(DEFAULT_PRINT_METHODS.TSHIRT_SCREEN_PRINT.method).toBe(
        "screen_print"
      );
      expect(
        DEFAULT_PRINT_METHODS.TSHIRT_SCREEN_PRINT.areas.length
      ).toBeGreaterThan(0);
    });

    it("should have TSHIRT_DTG template", () => {
      expect(DEFAULT_PRINT_METHODS.TSHIRT_DTG).toBeDefined();
      expect(DEFAULT_PRINT_METHODS.TSHIRT_DTG.method).toBe("dtg");
      expect(DEFAULT_PRINT_METHODS.TSHIRT_DTG.areas.length).toBeGreaterThan(0);
    });

    it("should have valid artwork requirements", () => {
      const template = DEFAULT_PRINT_METHODS.TSHIRT_SCREEN_PRINT;
      expect(template.artworkRequirements.minResolution).toBeGreaterThan(0);
      expect(
        template.artworkRequirements.acceptedFormats.length
      ).toBeGreaterThan(0);
      expect(template.artworkRequirements.maxFileSize).toBeGreaterThan(0);
    });

    it("should have valid lead times", () => {
      const template = DEFAULT_PRINT_METHODS.TSHIRT_SCREEN_PRINT;
      expect(template.leadTime.min).toBeGreaterThan(0);
      expect(template.leadTime.max).toBeGreaterThanOrEqual(
        template.leadTime.min
      );
    });
  });

  describe("Cost Calculation Edge Cases", () => {
    const mockPrintMethod: IPrintMethod = {
      method: "test",
      displayName: "Test",
      areas: [
        {
          name: "area1",
          displayName: "Area 1",
          maxWidth: 100,
          maxHeight: 100,
          allowedColors: 1,
          setupFee: 0,
          unitCost: 0,
          isRequired: false,
        },
      ],
      artworkRequirements: {
        minResolution: 300,
        acceptedFormats: ["AI"],
        colorMode: "CMYK",
        maxFileSize: 50,
        requiresVectorFile: false,
        requiresTransparentBackground: false,
      },
      leadTime: { min: 1, max: 1, unit: "days" },
      isActive: true,
      sortOrder: 1,
    };

    it("should handle zero setup fee", () => {
      const result = calculateCustomizationCost(
        mockPrintMethod,
        ["area1"],
        100
      );

      expect(result.setupFees).toBe(0);
    });

    it("should handle zero unit cost", () => {
      const result = calculateCustomizationCost(
        mockPrintMethod,
        ["area1"],
        100
      );

      expect(result.unitCosts).toBe(0);
    });

    it("should handle quantity of 1", () => {
      const printMethod = {
        ...mockPrintMethod,
        areas: [
          {
            ...mockPrintMethod.areas[0],
            setupFee: 50000,
            unitCost: 15000,
          },
        ],
      };

      const result = calculateCustomizationCost(printMethod, ["area1"], 1);

      expect(result.setupFees).toBe(50000);
      expect(result.unitCosts).toBe(15000);
      expect(result.totalCost).toBe(65000);
    });
  });
});
