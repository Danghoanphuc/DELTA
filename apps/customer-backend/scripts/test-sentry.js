#!/usr/bin/env node
// Test script to verify Sentry integration
// Usage: node scripts/test-sentry.js

import * as Sentry from "@sentry/node";
import { config } from "../src/config/env.config.js";

console.log("🧪 Testing Sentry Integration...\n");

// Test 1: Check if Sentry is initialized
console.log("Test 1: Sentry Initialization");
try {
  const client = Sentry.getCurrentHub().getClient();
  if (client && client.getDsn()) {
    console.log("✅ Sentry is initialized");
    console.log(`   DSN: ${client.getDsn().toString()}`);
  } else {
    console.log("❌ Sentry is NOT initialized");
    console.log("   Check SENTRY_DSN environment variable");
    process.exit(1);
  }
} catch (error) {
  console.log("❌ Error checking Sentry:", error.message);
  process.exit(1);
}

// Test 2: Test error capture
console.log("\nTest 2: Error Capture");
try {
  const eventId = Sentry.captureException(new Error("Test error from script"));
  console.log("✅ Test error captured");
  console.log(`   Event ID: ${eventId}`);
} catch (error) {
  console.log("❌ Failed to capture error:", error.message);
}

// Test 3: Test breadcrumbs
console.log("\nTest 3: Breadcrumbs");
try {
  Sentry.addBreadcrumb({
    category: "test",
    message: "Test breadcrumb",
    level: "info",
  });
  console.log("✅ Breadcrumb added");
} catch (error) {
  console.log("❌ Failed to add breadcrumb:", error.message);
}

// Test 4: Test user context
console.log("\nTest 4: User Context");
try {
  Sentry.setUser({
    id: "test_user_123",
    username: "test_user",
    email: "test@printz.vn",
  });
  console.log("✅ User context set");
} catch (error) {
  console.log("❌ Failed to set user context:", error.message);
}

// Test 5: Test tags
console.log("\nTest 5: Tags");
try {
  Sentry.setTags({
    environment: config.env,
    test: "true",
  });
  console.log("✅ Tags set");
} catch (error) {
  console.log("❌ Failed to set tags:", error.message);
}

// Test 6: Test transaction
console.log("\nTest 6: Transaction");
try {
  const transaction = Sentry.startTransaction({
    name: "test-transaction",
    op: "test",
  });

  const span = transaction.startChild({
    op: "test-operation",
    description: "Test operation",
  });

  // Simulate work
  setTimeout(() => {
    span.finish();
    transaction.finish();
    console.log("✅ Transaction completed");
  }, 100);
} catch (error) {
  console.log("❌ Failed to create transaction:", error.message);
}

// Test 7: Test manual instrumentation utilities
console.log("\nTest 7: Manual Instrumentation Utilities");
try {
  // Dynamic import to test utilities
  import("../src/infrastructure/sentry-utils.js").then((utils) => {
    console.log("✅ Sentry utilities loaded");
    console.log("   Available functions:");
    console.log("   - traceAIOperation");
    console.log("   - addAIBreadcrumb");
    console.log("   - trackTokenUsage");
    console.log("   - trackToolCalls");
    console.log("   - setSentryUser");
    console.log("   - clearSentryUser");
    console.log("   - addSentryTags");
    console.log("   - captureMetric");

    // Test traceAIOperation
    utils
      .traceAIOperation(
        "test.ai.operation",
        async () => {
          return "test result";
        },
        { testId: "123" }
      )
      .then((result) => {
        console.log("✅ traceAIOperation works");
        console.log(`   Result: ${result}`);
      })
      .catch((error) => {
        console.log("❌ traceAIOperation failed:", error.message);
      });

    // Test addAIBreadcrumb
    utils.addAIBreadcrumb("Test AI breadcrumb", { test: true });
    console.log("✅ addAIBreadcrumb works");

    // Test trackTokenUsage
    utils.trackTokenUsage({
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
    });
    console.log("✅ trackTokenUsage works");

    // Test trackToolCalls
    utils.trackToolCalls([
      {
        toolName: "test_tool",
        toolCallId: "call_123",
        args: { test: true },
      },
    ]);
    console.log("✅ trackToolCalls works");

    // Wait for async operations to complete
    setTimeout(() => {
      console.log("\n🎉 All tests completed!");
      console.log("\n📊 Next steps:");
      console.log("1. Check Sentry dashboard for test events");
      console.log("2. Verify breadcrumbs are captured");
      console.log("3. Confirm user context is set");
      console.log("4. Review transaction traces");
      console.log("\n🔗 Sentry Dashboard:");
      console.log("   https://sentry.io/organizations/printz/issues/");

      // Flush events before exit
      Sentry.close(2000).then(() => {
        console.log("\n✅ Sentry events flushed");
        process.exit(0);
      });
    }, 2000);
  });
} catch (error) {
  console.log("❌ Failed to load utilities:", error.message);
  process.exit(1);
}
