// apps/admin-frontend/src/lib/axios.ts
// ✅ STANDARDIZED: Admin frontend axios with cookie-based refresh token

import axios from "axios";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // ✅ STANDARDIZED: Send cookies for refresh token
  timeout: 10000,
});

// ✅ STANDARDIZED: Auto-refresh logic similar to customer frontend
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

// ✅ REQUEST INTERCEPTOR: Add Bearer token
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

// ✅ RESPONSE INTERCEPTOR: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 error and prevent refresh loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith("/auth/refresh") &&
      !originalRequest.url.endsWith("/auth/signin")
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 [Admin] Access token expired, refreshing...");

        // ✅ STANDARDIZED: Call refresh endpoint with cookies
        const refreshRes = await api.post(
          "/admin/auth/refresh",
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: undefined, // Don't send expired token
            },
          }
        );

        const newAccessToken = refreshRes.data?.data?.accessToken;

        if (!newAccessToken) {
          console.error("❌ [Admin] No access token in refresh response");
          throw new Error("No access token received from refresh");
        }

        console.log("✅ [Admin] Token refreshed successfully");

        // ✅ STANDARDIZED: Update token in store
        useAdminAuthStore.getState().setToken(newAccessToken);

        // ✅ STANDARDIZED: Update request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // ✅ STANDARDIZED: Process queued requests
        processQueue(null, newAccessToken);

        // ✅ STANDARDIZED: Retry original request
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("❌ [Admin] Failed to refresh token:", refreshError);

        processQueue(refreshError, null);

        // ✅ STANDARDIZED: Clear auth state and redirect
        const { logout } = useAdminAuthStore.getState();
        logout();

        // ✅ ADMIN SECURITY: Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
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
