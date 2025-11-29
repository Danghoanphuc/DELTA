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
          replacement: path.resolve(
            __dirname,
            "node_modules/mapbox-gl/dist/mapbox-gl.js"
          ),
        },
        // ✅ FIX: Alias cho zod/v4/core - @hookform/resolvers cần import này
        {
          find: /^zod\/v4\/core$/,
          replacement: "zod",
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
        // ✅ FIX: Proxy config để đảm bảo cookies được forward đúng cách
        "/api": {
          // ✅ FIX: Luôn dùng localhost:5001 trong dev mode (backend mặc định)
          target:
            mode === "development"
              ? "http://localhost:5001"
              : env.VITE_BACKEND_URL || "http://localhost:5001",
          changeOrigin: true,
          secure: false,
          // ✅ FIX: Thêm timeout và retry để tránh lỗi khi backend chưa sẵn sàng
          timeout: 30000,
          // ✅ FIX: Đảm bảo cookies được forward
          cookieDomainRewrite: "",
          cookiePathRewrite: "/",
          // ✅ FIX: Forward credentials
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              // Forward cookies từ request
              if (req.headers.cookie) {
                proxyReq.setHeader("Cookie", req.headers.cookie);
              }
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              // Forward Set-Cookie headers từ response
              const setCookieHeaders = proxyRes.headers["set-cookie"];
              if (setCookieHeaders) {
                res.setHeader("Set-Cookie", setCookieHeaders);
              }
            });
            // ✅ FIX: Xử lý lỗi proxy một cách graceful
            proxy.on("error", (err, req, res) => {
              console.error("[Vite Proxy] Error:", err.message);
              if (!res.headersSent) {
                res.writeHead(503, {
                  "Content-Type": "application/json",
                });
                res.end(
                  JSON.stringify({
                    error: "Service Unavailable",
                    message:
                      "Backend server is not ready. Please wait a moment and refresh.",
                  })
                );
              }
            });
          },
        },
      },
    },

    // ✅ FIX: Optimize dependencies - Không include react-map-gl vì có vấn đề với exports
    optimizeDeps: {
      include: ["mapbox-gl", "react-intersection-observer"],
      // ✅ KHÔNG exclude react-map-gl - để Vite tự resolve khi runtime
      esbuildOptions: {
        // ✅ FIX: Đảm bảo resolve đúng các package có vấn đề với exports
        mainFields: ["module", "main", "browser"],
        // ✅ FIX: Thêm alias cho zod/v4/core trong esbuild để resolve đúng khi pre-bundle
        alias: {
          "zod/v4/core": "zod",
        },
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
