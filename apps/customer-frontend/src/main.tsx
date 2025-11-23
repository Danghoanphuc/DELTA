import { createRoot } from "react-dom/client";
import "./styles/globals.css";
// ✅ FIX: Import mapbox-gl CSS - Vite sẽ tự resolve từ node_modules
// Lưu ý: Alias chỉ áp dụng cho JS imports, không ảnh hưởng CSS
import "mapbox-gl/dist/mapbox-gl.css";
import App from "./App";
// ✅ 1. Import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ 2. Tạo một client duy nhất
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút
      refetchOnWindowFocus: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  // ✅ 3. Bọc <App />
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
