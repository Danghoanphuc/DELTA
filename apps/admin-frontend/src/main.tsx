// apps/admin-frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // <-- Import
import App from "./App";
import "./index.css"; // <-- Import TailwindCSS
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// 1. Tạo QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tắt tự động refetch khi focus
      retry: 1, // Thử lại 1 lần nếu lỗi
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 2. Bọc App trong Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
      <SpeedInsights />
      <Analytics />
    </QueryClientProvider>
  </React.StrictMode>
);
