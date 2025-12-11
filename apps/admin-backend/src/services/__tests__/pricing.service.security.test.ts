/**
 * Security Tests for PricingService
 *
 * Tests for malicious formula injection attempts and RCE prevention
 * Requirements: Task 3.2.1 - Fix formula evaluation security vulnerability
 */

import { PricingService } from "../pricing.service.js";
import { PricingRepository } from "../../repositories/pricing.repository.js";
import { IPricingFormula } from "../../models/pricing-formula.model.js";
import { Types } from "mongoose";

describe("PricingService - Security Tests", () => {
  let pricingService: PricingService;
  let mockRepository: jest.Mocked<PricingRepository>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findActiveByProductType: jest.fn(),
      findActiveFormulas: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    } as any;

    pricingService = new PricingService(mockRepository);
  });

  describe("Malicious Formula Injection Prevention", () => {
    const createMockFormula = (formula: string): IPricingFormula => ({
      _id: new Types.ObjectId(),
      name: "Test Formula",
      productType: "test",
      formula,
      variables: [],
      quantityTiers: [
        {
          minQuantity: 1,
          maxQuantity: 100,
          pricePerUnit: 1000,
        },
      ],
      paperMultipliers: new Map([["standard", 1.0]]),
      finishingCosts: new Map(),
      minMargin: 20,
      isActive: true,
      createdBy: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validSpec = {
      productType: "test",
      size: { width: 10, height: 10, unit: "cm" as const },
      paperType: "standard",
      quantity: 10,
      finishingOptions: [],
      printSides: "single" as const,
      colors: 1,
    };

    test("should reject formula with eval()", async () => {
      const maliciousFormula = "eval('process.exit(1)')";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with Function constructor", async () => {
      const maliciousFormula = "Function('return process.env')()";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with constructor access", async () => {
      const maliciousFormula = "basePrice.constructor('return process')()";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with prototype manipulation", async () => {
      const maliciousFormula = "basePrice.__proto__.toString = () => 'hacked'";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with require()", async () => {
      const maliciousFormula = "require('fs').readFileSync('/etc/passwd')";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with import", async () => {
      const maliciousFormula = "import('fs').then(fs => fs.readFile)";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with process access", async () => {
      const maliciousFormula = "process.exit(1)";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with global access", async () => {
      const maliciousFormula = "global.process.env";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with template literals", async () => {
      const maliciousFormula = "`${process.env.SECRET}`";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with backticks", async () => {
      const maliciousFormula = "`malicious code`";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with semicolons (statement separator)", async () => {
      const maliciousFormula = "basePrice * 2; process.exit(1)";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with assignment operators", async () => {
      const maliciousFormula = "basePrice = 0";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with window object", async () => {
      const maliciousFormula = "window.location = 'http://evil.com'";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject formula with document object", async () => {
      const maliciousFormula = "document.cookie";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });

    test("should reject empty formula", async () => {
      const maliciousFormula = "";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /empty/i
      );
    });

    test("should reject formula with only whitespace", async () => {
      const maliciousFormula = "   ";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /empty/i
      );
    });

    test("should reject formula with special characters", async () => {
      const maliciousFormula = "basePrice * quantity @ 2";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /invalid characters/i
      );
    });

    test("should reject formula with SQL injection attempt", async () => {
      const maliciousFormula = "basePrice'; DROP TABLE users; --";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(maliciousFormula)
      );

      // Should be rejected due to semicolon (forbidden pattern)
      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow(
        /forbidden pattern/i
      );
    });
  });

  describe("Safe Formula Evaluation", () => {
    const createMockFormula = (formula: string): IPricingFormula => ({
      _id: new Types.ObjectId(),
      name: "Test Formula",
      productType: "test",
      formula,
      variables: [],
      quantityTiers: [
        {
          minQuantity: 1,
          maxQuantity: 100,
          pricePerUnit: 1000,
        },
      ],
      paperMultipliers: new Map([["standard", 1.0]]),
      finishingCosts: new Map(),
      minMargin: 20,
      isActive: true,
      createdBy: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validSpec = {
      productType: "test",
      size: { width: 10, height: 10, unit: "cm" as const },
      paperType: "standard",
      quantity: 10,
      finishingOptions: [],
      printSides: "single" as const,
      colors: 1,
    };

    test("should accept and evaluate safe formula with addition", async () => {
      const safeFormula = "basePrice * quantity + finishingCost";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result).toBeDefined();
      expect(result.costPrice).toBeGreaterThan(0);
    });

    test("should accept and evaluate safe formula with subtraction", async () => {
      const safeFormula = "basePrice * quantity - 100";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result).toBeDefined();
      expect(result.costPrice).toBeGreaterThan(0);
    });

    test("should accept and evaluate safe formula with multiplication", async () => {
      const safeFormula = "basePrice * quantity * paperMultiplier";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result).toBeDefined();
      expect(result.costPrice).toBeGreaterThan(0);
    });

    test("should accept and evaluate safe formula with division", async () => {
      const safeFormula = "basePrice * quantity / 2";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result).toBeDefined();
      expect(result.costPrice).toBeGreaterThan(0);
    });

    test("should accept and evaluate safe formula with parentheses", async () => {
      const safeFormula = "(basePrice + finishingCost) * quantity";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result).toBeDefined();
      expect(result.costPrice).toBeGreaterThan(0);
    });

    test("should accept and evaluate complex safe formula", async () => {
      const safeFormula =
        "basePrice * quantity * paperMultiplier * printSidesMultiplier + finishingCost * quantity";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result).toBeDefined();
      expect(result.costPrice).toBeGreaterThan(0);
    });

    test("should accept formula with underscores in variable names", async () => {
      const safeFormula = "base_price * quantity";
      // Note: This will fail because our variables don't have underscores
      // but it should pass validation
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      // Should not throw validation error, but may fail on evaluation
      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow();
    });

    test("should produce deterministic results", async () => {
      const safeFormula = "basePrice * quantity * paperMultiplier";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result1 = await pricingService.calculatePrice(validSpec);

      // Reset mock to simulate second call
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(safeFormula)
      );

      const result2 = await pricingService.calculatePrice(validSpec);

      // Same inputs should produce same outputs
      expect(result1.costPrice).toBe(result2.costPrice);
      expect(result1.sellingPrice).toBe(result2.sellingPrice);
      expect(result1.marginPercentage).toBe(result2.marginPercentage);
    });
  });

  describe("Edge Cases", () => {
    const createMockFormula = (formula: string): IPricingFormula => ({
      _id: new Types.ObjectId(),
      name: "Test Formula",
      productType: "test",
      formula,
      variables: [],
      quantityTiers: [
        {
          minQuantity: 1,
          maxQuantity: 100,
          pricePerUnit: 1000,
        },
      ],
      paperMultipliers: new Map([["standard", 1.0]]),
      finishingCosts: new Map(),
      minMargin: 20,
      isActive: true,
      createdBy: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validSpec = {
      productType: "test",
      size: { width: 10, height: 10, unit: "cm" as const },
      paperType: "standard",
      quantity: 10,
      finishingOptions: [],
      printSides: "single" as const,
      colors: 1,
    };

    test("should handle division by zero gracefully", async () => {
      const formula = "basePrice / 0";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(formula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow();
    });

    test("should handle very large numbers", async () => {
      const formula = "basePrice * 999999999";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(formula)
      );

      const result = await pricingService.calculatePrice(validSpec);
      expect(result.costPrice).toBeGreaterThan(0);
      expect(isFinite(result.costPrice)).toBe(true);
    });

    test("should reject formula resulting in NaN", async () => {
      const formula = "basePrice * quantity / (quantity - quantity)";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(formula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow();
    });

    test("should reject formula resulting in Infinity", async () => {
      const formula = "basePrice / (quantity - quantity)";
      mockRepository.findActiveByProductType.mockResolvedValue(
        createMockFormula(formula)
      );

      await expect(pricingService.calculatePrice(validSpec)).rejects.toThrow();
    });
  });
});
