// frontend/src/lib/api.ts

import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore"; // Import store Zustand của bạn

// 1. Lấy URL backend từ biến môi trường (.env)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// 2. Tạo "Trạm chỉ huy" (axios instance)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // RẤT QUAN TRỌNG: Để gửi/nhận cookie (cho refreshToken)
});

// 3. Tự động GẮN TOKEN vào mọi request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ store (Zustand)
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Tự động XỬ LÝ TOKEN HẾT HẠN (Lỗi 401)
api.interceptors.response.use(
  (response) => response, // Nếu OK, cho qua
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 (Token hết hạn), CHƯA thử lại, VÀ không phải là đang gọi refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true; // Đánh dấu là đã thử 1 lần

      try {
        console.log("Token hết hạn, đang làm mới (refresh)...");

        // 4.1. Gọi API /refresh để lấy token mới
        const { data } = await api.post("/auth/refresh");

        // 4.2. Cập nhật token mới vào store (Zustand)
        useAuthStore.getState().setAccessToken(data.accessToken);

        // 4.3. Cập nhật header cho request cũ
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;

        // 4.4. Gửi lại request cũ (đã có token mới)
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("Không thể làm mới token:", refreshError);

        // 4.5. Nếu refresh thất bại (ví dụ: cookie hết hạn) -> Đăng xuất
        useAuthStore.getState().clearState(); // <-- Bạn cần có hàm logout trong store
        window.location.href = "/signin"; // Đá về trang đăng nhập
        return Promise.reject(refreshError);
      }
    }

    // Nếu là lỗi khác 401, cứ báo lỗi như thường
    return Promise.reject(error);
  }
);

export default api;
