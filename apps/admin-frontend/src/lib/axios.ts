// apps/admin-frontend/src/lib/axios.ts
import axios from "axios";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

const api = axios.create({
  // ✅ "TỚI BẾN": Code đã "sạch", không còn phụ thuộc vào .env
  baseURL: "/api",
  withCredentials: true,
});

// (Toàn bộ logic Interceptors của Phúc được giữ nguyên)
// ...
api.interceptors.request.use(
  (config) => {
    const token = useAdminAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      const { logout, token } = useAdminAuthStore.getState();
      if (token) {
        console.error(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Tự động đăng xuất."
        );
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
