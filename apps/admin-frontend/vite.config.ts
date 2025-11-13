// apps/admin-frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // (Tùy chọn) Proxy API requests to admin-backend (để tránh lỗi CORS sau này)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5002', // Cổng của admin-backend
    //     changeOrigin: true,
    //   }
    // }
  },
  resolve: {
    alias: {
      // Cho phép import kiểu: import Component from '@/components/...'
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
