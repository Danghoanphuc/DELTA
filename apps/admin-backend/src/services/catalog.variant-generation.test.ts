// apps/admin-backend/src/services/catalog.variant-generation.test.ts
// ✅ Unit Tests for Variant Generation Service

import {
  VariantGenerationService,
  IAttributeCombination,
} from "./catalog.variant-generation.service";

describe("VariantGenerationService", () => {
  let service: VariantGenerationService;

  beforeEach(() => {
    service = new VariantGenerationService();
  });

  // ============================================
  // SKU GENERATION TESTS
  // ============================================
  describe("generateSku", () => {
    it("should generate SKU with default separator", () => {
      const productSku = "TSH-001";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "Large" },
        { name: "color", value: "Red" },
      ];

      const sku = service.generateSku(productSku, attributes);

      expect(sku).toBe("TSH-001-LAR-RED");
    });

    it("should generate SKU with custom separator", () => {
      const productSku = "TSH-001";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "Medium" },
        { name: "color", value: "Blue" },
      ];

      const sku = service.generateSku(productSku, attributes, {
        separator: "_",
      });

      expect(sku).toBe("TSH-001_MED_BLU");
    });

    it("should handle special characters in attribute values", () => {
      const productSku = "TSH-001";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "X-Large" },
        { name: "color", value: "Navy Blue" },
      ];

      const sku = service.generateSku(productSku, attributes);

      expect(sku).toBe("TSH-001-XLA-NAV");
    });

    it("should truncate SKU if exceeds max length", () => {
      const productSku = "VERY-LONG-PRODUCT-SKU-CODE";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "ExtraLarge" },
        { name: "color", value: "DarkBlue" },
        { name: "material", value: "Cotton" },
      ];

      const sku = service.generateSku(productSku, attributes, {
        maxLength: 30,
      });

      expect(sku.length).toBeLessThanOrEqual(30);
    });

    it("should handle empty attributes", () => {
      const productSku = "TSH-001";
      const attributes: IAttributeCombination[] = [];

      const sku = service.generateSku(productSku, attributes);

      expect(sku).toBe("TSH-001-");
    });

    it("should handle single attribute", () => {
      const productSku = "TSH-001";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "Small" },
      ];

      const sku = service.generateSku(productSku, attributes);

      expect(sku).toBe("TSH-001-SMA");
    });
  });

  // ============================================
  // VARIANT NAME GENERATION TESTS
  // ============================================
  describe("generateVariantName", () => {
    it("should generate name with attribute values", () => {
      const productName = "T-Shirt";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "Large" },
        { name: "color", value: "Red" },
      ];

      const name = service.generateVariantName(productName, attributes);

      expect(name).toBe("T-Shirt - Large - Red");
    });

    it("should use displayValue if provided", () => {
      const productName = "T-Shirt";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "L", displayValue: "Large" },
        { name: "color", value: "RED", displayValue: "Red" },
      ];

      const name = service.generateVariantName(productName, attributes);

      expect(name).toBe("T-Shirt - Large - Red");
    });

    it("should handle single attribute", () => {
      const productName = "T-Shirt";
      const attributes: IAttributeCombination[] = [
        { name: "size", value: "Medium" },
      ];

      const name = service.generateVariantName(productName, attributes);

      expect(name).toBe("T-Shirt - Medium");
    });

    it("should handle empty attributes", () => {
      const productName = "T-Shirt";
      const attributes: IAttributeCombination[] = [];

      const name = service.generateVariantName(productName, attributes);

      expect(name).toBe("T-Shirt - ");
    });
  });

  // ============================================
  // ATTRIBUTE COMBINATION GENERATION TESTS
  // ============================================
  describe("generateAttributeCombinations", () => {
    it("should generate all combinations for 2 attributes", () => {
      const attributeOptions = [
        { name: "size", values: ["S", "M", "L"] },
        { name: "color", values: ["Red", "Blue"] },
      ];

      const combinations =
        service.generateAttributeCombinations(attributeOptions);

      expect(combinations).toHaveLength(6); // 3 sizes × 2 colors
      expect(combinations[0]).toEqual([
        { name: "size", value: "S", displayValue: "S" },
        { name: "color", value: "Red", displayValue: "Red" },
      ]);
      expect(combinations[5]).toEqual([
        { name: "size", value: "L", displayValue: "L" },
        { name: "color", value: "Blue", displayValue: "Blue" },
      ]);
    });

    it("should generate all combinations for 3 attributes", () => {
      const attributeOptions = [
        { name: "size", values: ["S", "M"] },
        { name: "color", values: ["Red", "Blue"] },
        { name: "material", values: ["Cotton", "Polyester"] },
      ];

      const combinations =
        service.generateAttributeCombinations(attributeOptions);

      expect(combinations).toHaveLength(8); // 2 × 2 × 2
    });

    it("should use displayValues if provided", () => {
      const attributeOptions = [
        {
          name: "size",
          values: ["S", "M"],
          displayValues: ["Small", "Medium"],
        },
      ];

      const combinations =
        service.generateAttributeCombinations(attributeOptions);

      expect(combinations[0][0].displayValue).toBe("Small");
      expect(combinations[1][0].displayValue).toBe("Medium");
    });

    it("should handle single attribute", () => {
      const attributeOptions = [{ name: "size", values: ["S", "M", "L"] }];

      const combinations =
        service.generateAttributeCombinations(attributeOptions);

      expect(combinations).toHaveLength(3);
    });

    it("should return empty array for no attributes", () => {
      const attributeOptions: any[] = [];

      const combinations =
        service.generateAttributeCombinations(attributeOptions);

      expect(combinations).toEqual([]);
    });

    it("should handle attribute with single value", () => {
      const attributeOptions = [
        { name: "size", values: ["OneSize"] },
        { name: "color", values: ["Red", "Blue"] },
      ];

      const combinations =
        service.generateAttributeCombinations(attributeOptions);

      expect(combinations).toHaveLength(2);
    });
  });

  // ============================================
  // INVENTORY INITIALIZATION TESTS
  // ============================================
  describe("initializeInventory", () => {
    it("should initialize with default values", () => {
      const inventory = service.initializeInventory();

      expect(inventory).toEqual({
        onHand: 0,
        reserved: 0,
        available: 0,
        inTransit: 0,
        locations: [],
        reorderPoint: 10,
        reorderQuantity: 50,
        lastRestockDate: undefined,
        nextRestockDate: undefined,
      });
    });

    it("should initialize with custom initial stock", () => {
      const inventory = service.initializeInventory({ initialStock: 100 });

      expect(inventory.onHand).toBe(100);
      expect(inventory.available).toBe(100);
      expect(inventory.lastRestockDate).toBeDefined();
    });

    it("should initialize with custom reorder point", () => {
      const inventory = service.initializeInventory({ reorderPoint: 20 });

      expect(inventory.reorderPoint).toBe(20);
    });

    it("should initialize with custom reorder quantity", () => {
      const inventory = service.initializeInventory({ reorderQuantity: 100 });

      expect(inventory.reorderQuantity).toBe(100);
    });

    it("should set lastRestockDate only if initial stock > 0", () => {
      const inventory1 = service.initializeInventory({ initialStock: 0 });
      const inventory2 = service.initializeInventory({ initialStock: 50 });

      expect(inventory1.lastRestockDate).toBeUndefined();
      expect(inventory2.lastRestockDate).toBeDefined();
    });
  });

  // ============================================
  // METRICS INITIALIZATION TESTS
  // ============================================
  describe("initializeMetrics", () => {
    it("should initialize all metrics to zero", () => {
      const metrics = service.initializeMetrics();

      expect(metrics).toEqual({
        totalSold: 0,
        totalRevenue: 0,
        averageMargin: 0,
        returnRate: 0,
        averageLeadTime: 0,
      });
    });
  });

  // ============================================
  // STOCK CALCULATION TESTS
  // ============================================
  describe("calculateAvailableStock", () => {
    it("should calculate available stock correctly", () => {
      const available = service.calculateAvailableStock(100, 20);
      expect(available).toBe(80);
    });

    it("should return 0 if reserved exceeds onHand", () => {
      const available = service.calculateAvailableStock(50, 60);
      expect(available).toBe(0);
    });

    it("should handle zero values", () => {
      const available = service.calculateAvailableStock(0, 0);
      expect(available).toBe(0);
    });

    it("should return onHand if no reservations", () => {
      const available = service.calculateAvailableStock(100, 0);
      expect(available).toBe(100);
    });
  });

  // ============================================
  // REORDER CHECK TESTS
  // ============================================
  describe("needsReorder", () => {
    it("should return true if available <= reorder point", () => {
      expect(service.needsReorder(10, 10)).toBe(true);
      expect(service.needsReorder(5, 10)).toBe(true);
    });

    it("should return false if available > reorder point", () => {
      expect(service.needsReorder(15, 10)).toBe(false);
      expect(service.needsReorder(100, 10)).toBe(false);
    });

    it("should handle zero values", () => {
      expect(service.needsReorder(0, 0)).toBe(true);
      expect(service.needsReorder(0, 10)).toBe(true);
    });

    it("should handle edge case at reorder point", () => {
      expect(service.needsReorder(10, 10)).toBe(true);
    });
  });
});

// ============================================
// INTEGRATION TESTS (commented out - require DB)
// ============================================
/*
describe("VariantGenerationService - Integration", () => {
  // These tests require database connection
  // Run with: npm test -- --testPathPattern=variant-generation.test.ts --runInBand
  
  describe("generateVariants", () => {
    it("should generate variants for a product", async () => {
      // Setup: Create test product
      // Execute: Generate variants
      // Assert: Variants created correctly
    });

    it("should skip existing SKUs", async () => {
      // Setup: Create product with existing variant
      // Execute: Try to generate same variant
      // Assert: Skipped duplicate
    });

    it("should update product with variant attributes", async () => {
      // Setup: Create product
      // Execute: Generate variants
      // Assert: Product.hasVariants = true, variantAttributes set
    });
  });

  describe("createSupplierMappings", () => {
    it("should create supplier mapping from product supplier", async () => {
      // Setup: Create product with supplier
      // Execute: Create mappings
      // Assert: Mapping created with correct supplier
    });

    it("should use default supplier if provided", async () => {
      // Setup: Create product and supplier
      // Execute: Create mappings with default supplier
      // Assert: Uses default supplier
    });
  });

  describe("getLowStockVariants", () => {
    it("should return variants below threshold", async () => {
      // Setup: Create variants with different stock levels
      // Execute: Get low stock variants
      // Assert: Only low stock variants returned
    });

    it("should use variant's own threshold if no threshold provided", async () => {
      // Setup: Create variants with different thresholds
      // Execute: Get low stock variants
      // Assert: Uses each variant's threshold
    });
  });
});
*/
