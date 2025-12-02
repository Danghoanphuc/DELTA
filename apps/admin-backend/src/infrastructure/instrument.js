// apps/admin-backend/src/infrastructure/instrument.js
// ✅ Sentry Instrumentation for Admin Backend

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

try {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",

      // Sample rates based on environment
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

      integrations: [nodeProfilingIntegration()],

      // ESM loader hooks configuration
      registerEsmLoaderHooks: {
        onlyIncludeInstrumentedModules: true,
      },

      skipOpenTelemetrySetup: true,

      beforeSend(event) {
        // Filter out noise in development
        if (process.env.NODE_ENV !== "production") {
          if (event.exception?.values?.[0]?.type === "NotFoundException") {
            return null;
          }
        }
        return event;
      },
    });
    console.log("[Sentry] Admin Backend initialized successfully");
  } else {
    console.warn("[Sentry] SENTRY_DSN not set, skipping initialization");
  }
} catch (error) {
  console.error("[Sentry] Initialization failed:", error);
}
