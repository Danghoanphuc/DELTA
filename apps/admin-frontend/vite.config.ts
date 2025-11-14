// apps/admin-frontend/vite.config.ts
import { defineConfig } from "vite"; // 1. Bỏ loadEnv vì không cần nữa
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // 2. Bỏ function bọc ngoài
  plugins: [react()],
  server: {
    port: 3000,
    // 3. "Đánh thức" proxy
    proxy: {
      "/api": {
        // 4. "Viết cứng" URL local.
        //    Lưu ý: Chúng ta trỏ về ROOT, không phải /api/admin
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
        // 5. "Bí thuật": Chúng ta phải "viết lại" đường dẫn
        //    để "sửa" sự bất đồng bộ của Phúc
        //    Nó sẽ biến /api/v1... thành /api/admin/v1...
        rewrite: (path) => path.replace(/^\/api/, "/api/admin"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
