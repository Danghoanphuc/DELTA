// apps/customer-frontend/vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "vite"; // <-- Import loadEnv
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  // Tải các biến .env dựa trên 'mode' (development, production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // === PHẦN MỚI (GĐ 5.R3) ===
    // Định nghĩa các biến môi trường để client-side có thể truy cập
    // thông qua process.env.VITE_...
    define: {
      "process.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_STRIPE_PUBLISHABLE_KEY
      ),
      "process.env.VITE_BACKEND_URL": JSON.stringify(env.VITE_BACKEND_URL),
      // (Thêm các biến VITE_ khác nếu Phúc có)
    },
    // === HẾT PHẦN MỚI ===

    server: {
      port: 5173, // Cổng frontend của Phúc
      proxy: {
        // (Giữ nguyên proxy của Phúc nếu có)
        "/api": {
          target: env.VITE_BACKEND_URL || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
