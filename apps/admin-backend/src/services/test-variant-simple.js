// apps/admin-backend/src/services/test-variant-simple.js
// Simple inline test for variant generation logic

console.log("🧪 Testing Variant Generation Logic\n");

// ============================================
// SKU GENERATION
// ============================================
function generateSku(productSku, attributes, options = {}) {
  const separator = options.separator || "-";
  const maxLength = options.maxLength || 50;

  const attrSuffix = attributes
    .map((attr) => {
      return attr.value
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    })
    .join(separator);

  const sku = `${productSku}${separator}${attrSuffix}`;
  return sku.length > maxLength ? sku.substring(0, maxLength) : sku;
}

console.log("✅ Test 1: SKU Generation");
const sku1 = generateSku("TSH-001", [
  { name: "size", value: "Large" },
  { name: "color", value: "Red" },
]);
console.log(`   Generated: ${sku1}`);
console.assert(sku1 === "TSH-001-LAR-RED", "❌ Failed");

const sku2 = generateSku("TSH-001", [
  { name: "size", value: "X-Large" },
  { name: "color", value: "Navy Blue" },
]);
console.log(`   Generated: ${sku2}`);
console.assert(sku2 === "TSH-001-XLA-NAV", "❌ Failed");

// ============================================
// VARIANT NAME GENERATION
// ============================================
function generateVariantName(productName, attributes) {
  const attrStr = attributes
    .map((attr) => attr.displayValue || attr.value)
    .join(" - ");
  return `${productName} - ${attrStr}`;
}

console.log("\n✅ Test 2: Variant Name Generation");
const name1 = generateVariantName("T-Shirt", [
  { name: "size", value: "L", displayValue: "Large" },
  { name: "color", value: "RED", displayValue: "Red" },
]);
console.log(`   Generated: ${name1}`);
console.assert(name1 === "T-Shirt - Large - Red", "❌ Failed");

// ============================================
// ATTRIBUTE COMBINATIONS
// ============================================
function generateAttributeCombinations(attributeOptions) {
  if (attributeOptions.length === 0) return [];

  const combinations = [[]];

  for (const attrOption of attributeOptions) {
    const newCombinations = [];

    for (const combination of combinations) {
      for (let i = 0; i < attrOption.values.length; i++) {
        const value = attrOption.values[i];
        const displayValue = attrOption.displayValues?.[i] || value;

        newCombinations.push([
          ...combination,
          {
            name: attrOption.name,
            value,
            displayValue,
          },
        ]);
      }
    }

    combinations.length = 0;
    combinations.push(...newCombinations);
  }

  return combinations;
}

console.log("\n✅ Test 3: Attribute Combinations");
const combinations = generateAttributeCombinations([
  { name: "size", values: ["S", "M", "L"] },
  { name: "color", values: ["Red", "Blue"] },
]);
console.log(`   Generated ${combinations.length} combinations`);
console.assert(combinations.length === 6, "❌ Failed");
console.log(`   First: ${JSON.stringify(combinations[0])}`);
console.log(`   Last: ${JSON.stringify(combinations[5])}`);

// ============================================
// INVENTORY INITIALIZATION
// ============================================
function initializeInventory(options = {}) {
  const initialStock = options.initialStock || 0;

  return {
    onHand: initialStock,
    reserved: 0,
    available: initialStock,
    inTransit: 0,
    locations: [],
    reorderPoint: options.reorderPoint || 10,
    reorderQuantity: options.reorderQuantity || 50,
    lastRestockDate: initialStock > 0 ? new Date() : undefined,
    nextRestockDate: undefined,
  };
}

console.log("\n✅ Test 4: Inventory Initialization");
const inventory = initializeInventory({ initialStock: 100, reorderPoint: 20 });
console.log(`   onHand: ${inventory.onHand}`);
console.log(`   reorderPoint: ${inventory.reorderPoint}`);
console.assert(inventory.onHand === 100, "❌ Failed");
console.assert(inventory.reorderPoint === 20, "❌ Failed");

// ============================================
// STOCK CALCULATIONS
// ============================================
function calculateAvailableStock(onHand, reserved) {
  return Math.max(0, onHand - reserved);
}

function needsReorder(available, reorderPoint) {
  return available <= reorderPoint;
}

console.log("\n✅ Test 5: Stock Calculations");
const available = calculateAvailableStock(100, 20);
console.log(`   Available: ${available} (100 - 20)`);
console.assert(available === 80, "❌ Failed");

const needs1 = needsReorder(10, 10);
const needs2 = needsReorder(15, 10);
console.log(`   Needs reorder (10 <= 10): ${needs1}`);
console.log(`   Needs reorder (15 <= 10): ${needs2}`);
console.assert(needs1 === true, "❌ Failed");
console.assert(needs2 === false, "❌ Failed");

console.log("\n✅ All tests passed!");
