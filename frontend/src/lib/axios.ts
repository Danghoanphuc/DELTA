// frontend/src/lib/axios.ts
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore"; // Đảm bảo đường dẫn này đúng

// Lấy URL backend từ biến môi trường, fallback về localhost nếu không có
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const api = axios.create({
  // Nối '/api' nếu backend routes của bạn bắt đầu bằng /api
  // Nếu VITE_API_URL đã bao gồm /api thì chỉ cần API_BASE_URL
  baseURL: API_BASE_URL + "/api",
  withCredentials: true,
});

// --- Interceptors giữ nguyên ---
// Gắn access token vào req header
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự động gọi refresh api khi access token hết hạn (401 Unauthorized)
// (Kiểm tra mã lỗi backend trả về khi token hết hạn là 401 hay 403 và sửa lại nếu cần)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra lỗi 401, chưa retry, và không phải là request refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;
      console.log("Access token expired, attempting refresh...");
      try {
        const refreshRes = await api.post("/auth/refresh"); // Không cần baseURL ở đây nữa
        const newAccessToken = refreshRes.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Gửi lại request cũ với token mới
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        useAuthStore.getState().clearState(); // Đăng xuất nếu refresh lỗi
        // Chuyển hướng về trang đăng nhập (có thể cần xử lý khác tùy logic app)
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
