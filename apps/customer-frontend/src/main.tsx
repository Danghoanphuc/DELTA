import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
// 👇 1. Thêm Import này
import { GoogleOAuthProvider } from "@react-oauth/google";


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

// Check nhanh để debug nếu quên set env
if (!GOOGLE_CLIENT_ID) {
  console.error("🚨 VITE_GOOGLE_CLIENT_ID is missing in .env file!");
} else if (import.meta.env.DEV) {
  // Debug info trong dev mode
  console.log(`🔑 [Google OAuth] Client ID: ${GOOGLE_CLIENT_ID.substring(0, 30)}...`);
  console.log(`🌐 [Google OAuth] Current Origin: ${window.location.origin}`);
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {/* 👇 3. Bọc App bằng GoogleOAuthProvider */}
    
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </QueryClientProvider>
);