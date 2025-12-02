// apps/admin-frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Initialize Sentry
Sentry.init({
  dsn:
    import.meta.env.VITE_SENTRY_DSN ||
    "https://9dc828c2808a5a469349b03f2623a39c@o4510433602502656.ingest.us.sentry.io/4510462554734592",
  environment: import.meta.env.MODE || "development",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Sample rates
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Send default PII data (IP address, user agent, etc.)
  sendDefaultPii: true,

  // Filter and sanitize events
  beforeSend(event) {
    // Filter out non-critical errors in production
    if (import.meta.env.PROD) {
      if (event.exception?.values?.[0]?.type === "ChunkLoadError") {
        return null;
      }
    }

    // Remove sensitive data from request
    if (event.request?.data) {
      const data = event.request.data as any;
      if (data.password) delete data.password;
      if (data.token) delete data.token;
      if (data.apiKey) delete data.apiKey;
    }

    return event;
  },
});

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <SpeedInsights />
      <Analytics />
    </QueryClientProvider>
  </React.StrictMode>
);
