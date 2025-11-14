// apps/admin-frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        // Trỏ về GỐC của server local
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
        // "Bí thuật" viết lại đường dẫn
        // Biến /api/v1... thành /api/admin/v1...
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
