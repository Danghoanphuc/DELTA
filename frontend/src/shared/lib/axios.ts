// frontend/src/lib/axios.ts
// ✅ PHIÊN BẢN SỬA LỖI (THEO NGUYÊN TẮC "SINGLE SOURCE OF TRUTH")

import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore"; // Đảm bảo đường dẫn này đúng

const API_HOST = import.meta.env.VITE_API_URL;

if (!API_HOST) {
  console.error(
    "Lỗi cấu hình: VITE_API_URL chưa được định nghĩa trong file .env"
  );
}

const api = axios.create({
  // ✅ SỬA LỖI: Gắn cứng hậu tố /api tại đây.
  // Giờ đây baseURL sẽ là 'http://localhost:5001/api' (local)
  // hoặc 'https://delta-j7qn.onrender.com/api' (production)
  baseURL: `${API_HOST}/api`,
  withCredentials: true,
});

// --- Interceptors (Giữ nguyên - Rất tốt) ---

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
      // ✅ SỬA LOGIC: Đường dẫn bây giờ là tương đối (đã bao gồm /api)
      !originalRequest.url.endsWith("/auth/refresh") &&
      !originalRequest.url.endsWith("/auth/signin") &&
      !originalRequest.url.endsWith("/auth/signup")
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
        // Quan trọng: Lời gọi refresh cũng là đường dẫn tương đối
        const refreshRes = await api.post("/auth/refresh");

        // Cập nhật theo cấu trúc data của anh
        const newAccessToken =
          refreshRes.data.accessToken || refreshRes.data.data.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token received from refresh");
        }

        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error(
          "❌ Failed to refresh token:",
          refreshError.response?.data?.message || refreshError.message
        );
        processQueue(refreshError, null);
        useAuthStore.getState().clearState();

        // Redirect to signin page
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/signin")
        ) {
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
