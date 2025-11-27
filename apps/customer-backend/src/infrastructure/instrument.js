// apps/customer-backend/src/infrastructure/instrument.js
// ✅ Sentry Instrumentation (Updated for Sentry v8)

import * as Sentry from "@sentry/node";
// 👇 THAY ĐỔI QUAN TRỌNG: Import đúng function cho v8
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// ✅ Wrap trong try-catch để không block server startup nếu Sentry fail
try {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 1.0, // Capture 100% transactions for dev
      profilesSampleRate: 1.0, // Capture 100% profiles for dev
      integrations: [
        // 👇 THAY ĐỔI QUAN TRỌNG: Gọi hàm thay vì new Class
        nodeProfilingIntegration(),
      ],
    });
    console.log("[Sentry] Initialized successfully");
  } else {
    console.warn("[Sentry] SENTRY_DSN not set, skipping initialization");
  }
} catch (error) {
  console.error("[Sentry] Initialization failed:", error);
  // ✅ Không throw để server vẫn có thể khởi động
}

