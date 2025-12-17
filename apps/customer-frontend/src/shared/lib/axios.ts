// frontend/src/lib/axios.ts
// ✅ PHIÊN BẢN SỬA LỖI (THEO NGUYÊN TẮC "SINGLE SOURCE OF TRUTH")

import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore"; // Đảm bảo đường dẫn này đúng

// ✅ FIX: Sử dụng relative path trong dev để đi qua Vite proxy (tránh cross-site cookie issue)
// Trong production, sử dụng absolute URL từ env
const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";
const API_HOST = import.meta.env.VITE_API_URL;

// ✅ FIX: Trong dev, sử dụng relative path để đi qua Vite proxy
// Điều này đảm bảo cookie được gửi đúng cách (same-origin)
// ✅ FIX: Trong production, BẮT BUỘC phải có VITE_API_URL
let baseURL: string;
if (isDevelopment) {
  baseURL = "/api"; // Relative path - đi qua Vite proxy
  console.log("🔧 [Axios] Development mode - using Vite proxy at /api");
} else {
  // Production mode
  if (!API_HOST) {
    const errorMsg =
      "❌ [Axios] VITE_API_URL is required in production! Please set it in your environment variables.";
    console.error(errorMsg);
    // ✅ FIX: Fallback về relative path nếu không có env (có thể dùng với reverse proxy)
    // Nhưng vẫn log warning để developer biết
    baseURL = "/api";
    console.warn(
      "⚠️ [Axios] Falling back to relative path /api. Make sure your production server has a reverse proxy configured."
    );
  } else {
    // ✅ FIX: Đảm bảo API_HOST không có trailing slash và có /api
    const cleanHost = API_HOST.replace(/\/+$/, ""); // Remove trailing slashes
    baseURL = `${cleanHost}/api`;
    console.log(`🔧 [Axios] Production mode - using API: ${baseURL}`);
  }
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // ✅ THÊM: Timeout 10s để tránh treo quá lâu
});

// --- Interceptors (Giữ nguyên - Rất tốt) ---

// Gắn access token vào req header (skip for public endpoints)
api.interceptors.request.use(
  (config) => {
    // Skip auth for public endpoints
    const publicEndpoints = ["/magazine", "/artisans"];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.startsWith(endpoint)
    );

    if (!isPublicEndpoint) {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
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
            // ✅ FIX: Đảm bảo request retry dùng token mới từ queue
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api({
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              },
            });
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Access token expired, refreshing...");
        console.log("🔄 [Frontend] Checking cookies:", document.cookie);
        console.log("🔄 [Frontend] Request URL:", originalRequest.url);

        // Quan trọng: Lời gọi refresh cũng là đường dẫn tương đối
        // ✅ FIX: Đảm bảo withCredentials được set đúng cách
        const refreshRes = await api.post(
          "/auth/refresh",
          {},
          {
            withCredentials: true, // ✅ Đảm bảo credentials được gửi
            headers: {
              // ✅ FIX: Đảm bảo không gửi Authorization header trong refresh request
              Authorization: undefined,
            },
          }
        );

        // Cập nhật theo cấu trúc data của anh
        const newAccessToken =
          refreshRes.data.accessToken || refreshRes.data.data?.accessToken;

        if (!newAccessToken) {
          console.error(
            "❌ [Frontend] No access token in refresh response:",
            refreshRes.data
          );
          throw new Error("No access token received from refresh");
        }

        console.log("✅ [Frontend] Token refreshed successfully");

        // ✅ FIX: Cập nhật token vào store TRƯỚC khi retry request
        useAuthStore.getState().setAccessToken(newAccessToken);

        // ✅ FIX: Đảm bảo request retry dùng token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // ✅ FIX: Process queue với token mới để các request đang chờ cũng dùng token mới
        processQueue(null, newAccessToken);

        // ✅ FIX: Retry request ban đầu với token mới
        // Đảm bảo không dùng interceptor request (đã set header trực tiếp)
        return api({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshError: any) {
        const errorMessage =
          refreshError.response?.data?.message || refreshError.message;
        const errorCode = refreshError.response?.status;

        console.error("❌ [Frontend] Failed to refresh token:", {
          message: errorMessage,
          status: errorCode,
          url: originalRequest.url,
          cookies: document.cookie,
        });

        processQueue(refreshError, null);
        useAuthStore.getState().clearState();

        // ✅ FIX: Chỉ redirect khi đang ở protected routes, không redirect ở public routes
        // ✅ FIX: Trong dev, không redirect ngay lập tức để tránh làm phiền
        if (typeof window !== "undefined") {
          const publicRoutes = [
            "/",
            "/signin",
            "/signup",
            "/shop",
            "/app",
            "/product",
            "/products",
            "/inspiration",
            "/rush",
            "/contact",
            "/policy",
            "/process",
          ];
          const isPublicRoute = publicRoutes.some(
            (route) =>
              window.location.pathname === route ||
              window.location.pathname.startsWith(route + "/")
          );

          // ✅ FIX: Chỉ redirect nếu không phải public route và chưa ở trang signin
          // ✅ FIX: Trong dev, chỉ redirect nếu thực sự cần thiết (không phải lỗi tạm thời)
          if (!isPublicRoute && !window.location.pathname.includes("/signin")) {
            // ✅ FIX: Delay redirect một chút để tránh redirect quá nhanh trong dev
            setTimeout(() => {
              console.log(
                "🔄 [Frontend] Redirecting to signin due to refresh token failure"
              );
              window.location.href = "/signin";
            }, 100);
          }
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
