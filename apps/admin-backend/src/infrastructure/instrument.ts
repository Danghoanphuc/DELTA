// apps/admin-backend/src/infrastructure/instrument.ts
// ✅ Sentry Instrumentation (Optimized for Sentry v8 + ESM)

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// ✅ Wrap trong try-catch để không block server startup nếu Sentry fail
try {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",

      // ✅ Điều chỉnh sample rates dựa trên môi trường
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

      integrations: [nodeProfilingIntegration()],

      // ✅ CRITICAL FIX: Exclude problematic ESM packages
      registerEsmLoaderHooks: {
        onlyIncludeInstrumentedModules: true,
      },

      // ✅ Thêm skipOpenTelemetrySetup để tránh xung đột với OpenTelemetry
      skipOpenTelemetrySetup: true,

      // ✅ Tối ưu performance
      beforeSend(event) {
        // Filter out noise trong development
        if (process.env.NODE_ENV !== "production") {
          // Skip một số errors không quan trọng
          if (event.exception?.values?.[0]?.type === "NotFoundException") {
            return null;
          }
        }
        return event;
      },
    });
    console.log("[Sentry] Initialized successfully");
  } else {
    console.warn("[Sentry] SENTRY_DSN not set, skipping initialization");
  }
} catch (error) {
  console.error("[Sentry] Initialization failed:", error);
  // ✅ Không throw để server vẫn có thể khởi động
}
