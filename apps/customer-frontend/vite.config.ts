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
      alias: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
        // ✅ FIX: Alias cho mapbox-gl JS - chỉ match exact "mapbox-gl", không match "mapbox-gl/dist/..."
        {
          find: /^mapbox-gl$/,
          replacement: path.resolve(__dirname, "node_modules/mapbox-gl/dist/mapbox-gl.js"),
        },
      ],
      // ✅ FIX: Đảm bảo resolve đúng các package
      dedupe: ["react", "react-dom"],
      // ✅ FIX: Thêm conditions để resolve đúng exports
      conditions: ["import", "module", "browser", "default"],
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

    // ✅ FIX: Optimize dependencies - Không include react-map-gl vì có vấn đề với exports
    optimizeDeps: {
      include: [
        "mapbox-gl",
        "react-intersection-observer",
      ],
      // ✅ KHÔNG exclude react-map-gl - để Vite tự resolve khi runtime
      esbuildOptions: {
        // ✅ FIX: Đảm bảo resolve đúng các package có vấn đề với exports
        mainFields: ["module", "main", "browser"],
      },
    },

    // ✅ FIX: Cấu hình build để xử lý mapbox-gl worker
    build: {
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "mapbox-gl": ["mapbox-gl"],
            "react-map-gl": ["react-map-gl"],
          },
        },
      },
    },
  };
});
