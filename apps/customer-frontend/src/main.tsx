import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./lib/mapConfig"; // ✅ Import map config to disable Mapbox telemetry
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
// 👇 1. Thêm Import này
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Sentry Init (Giữ nguyên)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // ✅ Ignore Mapbox telemetry errors
  ignoreErrors: [
    /events\.mapbox\.com/,
    /api\.mapbox\.com\/map-sessions/,
    "mapbox",
  ],
  beforeSend(event) {
    // Filter out Mapbox telemetry errors
    if (event.request?.url?.includes("mapbox.com")) {
      return null;
    }
    return event;
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
    },
  },
});

// 👇 2. Lấy Client ID từ biến môi trường
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Check nhanh để debug nếu quên set env (chỉ log ở dev)
if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
  console.error("🚨 VITE_GOOGLE_CLIENT_ID is missing in .env file!");
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {/* 👇 3. Bọc App bằng GoogleOAuthProvider */}

    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      <SpeedInsights />
      <Analytics />
    </GoogleOAuthProvider>
  </QueryClientProvider>
);
