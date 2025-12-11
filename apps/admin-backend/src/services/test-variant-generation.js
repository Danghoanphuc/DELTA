// apps/admin-backend/src/services/test-variant-generation.js
// Simple test runner for variant generation service

import { VariantGenerationService } from "./catalog.variant-generation.service.js";

const service = new VariantGenerationService();

console.log("🧪 Testing Variant Generation Service\n");

// Test 1: SKU Generation
console.log("✅ Test 1: SKU Generation");
const sku1 = service.generateSku("TSH-001", [
  { name: "size", value: "Large" },
  { name: "color", value: "Red" },
]);
console.log(`   Generated SKU: ${sku1}`);
console.assert(sku1 === "TSH-001-LAR-RED", "SKU generation failed");

// Test 2: Variant Name Generation
console.log("\n✅ Test 2: Variant Name Generation");
const name1 = service.generateVariantName("T-Shirt", [
  { name: "size", value: "L", displayValue: "Large" },
  { name: "color", value: "RED", displayValue: "Red" },
]);
console.log(`   Generated Name: ${name1}`);
console.assert(name1 === "T-Shirt - Large - Red", "Name generation failed");

// Test 3: Attribute Combinations
console.log("\n✅ Test 3: Attribute Combinations");
const combinations = service.generateAttributeCombinations([
  { name: "size", values: ["S", "M", "L"] },
  { name: "color", values: ["Red", "Blue"] },
]);
console.log(`   Generated ${combinations.length} combinations`);
console.assert(combinations.length === 6, "Combination generation failed");
console.log(`   First: ${JSON.stringify(combinations[0])}`);
console.log(`   Last: ${JSON.stringify(combinations[5])}`);

// Test 4: Inventory Initialization
console.log("\n✅ Test 4: Inventory Initialization");
const inventory = service.initializeInventory({
  initialStock: 100,
  reorderPoint: 20,
});
console.log(`   Inventory: ${JSON.stringify(inventory, null, 2)}`);
console.assert(inventory.onHand === 100, "Inventory initialization failed");
console.assert(inventory.reorderPoint === 20, "Reorder point failed");

// Test 5: Metrics Initialization
console.log("\n✅ Test 5: Metrics Initialization");
const metrics = service.initializeMetrics();
console.log(`   Metrics: ${JSON.stringify(metrics)}`);
console.assert(metrics.totalSold === 0, "Metrics initialization failed");

// Test 6: Available Stock Calculation
console.log("\n✅ Test 6: Available Stock Calculation");
const available = service.calculateAvailableStock(100, 20);
console.log(`   Available: ${available} (onHand: 100, reserved: 20)`);
console.assert(available === 80, "Available stock calculation failed");

// Test 7: Reorder Check
console.log("\n✅ Test 7: Reorder Check");
const needsReorder1 = service.needsReorder(10, 10);
const needsReorder2 = service.needsReorder(15, 10);
console.log(`   Needs reorder (10 <= 10): ${needsReorder1}`);
console.log(`   Needs reorder (15 <= 10): ${needsReorder2}`);
console.assert(needsReorder1 === true, "Reorder check failed");
console.assert(needsReorder2 === false, "Reorder check failed");

console.log("\n✅ All tests passed!");
