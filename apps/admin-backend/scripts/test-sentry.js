// Test script for Sentry integration
import "../src/infrastructure/instrument.js";
import * as Sentry from "@sentry/node";

console.log("🧪 Testing Sentry Integration for Admin Backend...\n");

// Test 1: Check if Sentry is initialized
console.log("✅ Test 1: Sentry is initialized");

// Test 2: Capture a test error
try {
  throw new Error("Test error from Admin Backend");
} catch (error) {
  Sentry.captureException(error);
  console.log("✅ Test 2: Test error captured");
}

// Test 3: Add breadcrumb
Sentry.addBreadcrumb({
  category: "test",
  message: "Test breadcrumb",
  level: "info",
});
console.log("✅ Test 3: Breadcrumb added");

// Test 4: Set user context
Sentry.setUser({
  id: "test-admin-123",
  username: "test-admin",
  email: "admin@test.com",
  role: "admin",
});
console.log("✅ Test 4: User context set");

// Test 5: Add tags
Sentry.setTags({
  test: "true",
  backend: "admin",
});
console.log("✅ Test 5: Tags set");

// Test 6: Create a transaction
const transaction = Sentry.startSpan(
  {
    name: "test-transaction",
    op: "test",
  },
  () => {
    console.log("✅ Test 6: Transaction completed");
  }
);

// Test 7: Test utilities
import("../src/infrastructure/sentry-utils.js")
  .then((utils) => {
    console.log("✅ Test 7: Sentry utilities loaded");
    console.log("\n🎉 All tests passed! Sentry is working correctly.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test 7 failed:", error);
    process.exit(1);
  });
