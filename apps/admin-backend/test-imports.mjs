// Test script để verify imports từ @printz/types
console.log("🧪 Testing @printz/types imports...\n");

try {
  console.log("1. Testing main export...");
  const { User } = await import("@printz/types");
  console.log("   ✅ Main export works");

  console.log("2. Testing model imports...");
  await import("@printz/types/models/user.model");
  console.log("   ✅ user.model works");

  await import("@printz/types/models/printer-profile.model");
  console.log("   ✅ printer-profile.model works");

  await import("@printz/types/models/product.model");
  console.log("   ✅ product.model works");

  await import("@printz/types/models/design-template.model");
  console.log("   ✅ design-template.model works");

  await import("@printz/types/models/customer-profile.model");
  console.log("   ✅ customer-profile.model works");

  console.log("\n✅ All imports successful!");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Import failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
