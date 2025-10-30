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

// Auto-refresh access token on 401 errors
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 error and prevent refresh loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/signin" &&
      originalRequest.url !== "/auth/signup"
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Access token expired, refreshing...");
        const refreshRes = await api.post("/auth/refresh");
        const newAccessToken = refreshRes.data.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token received");
        }

        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Failed to refresh token:", refreshError);
        processQueue(refreshError, null);
        useAuthStore.getState().clearState();
        
        // Redirect to signin page
        if (typeof window !== "undefined" && !window.location.pathname.includes("/signin")) {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
