// apps/admin-frontend/src/lib/axios.ts
import axios from "axios";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

// 1. Lấy biến môi trường một cách an toàn
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL;

// 2. Xử lý lỗi cấu hình (Best Practice)
//    Kiểm tra xem biến VITE_ADMIN_API_URL đã được định nghĩa
//    trong .env.development hoặc trên Vercel/Render chưa.
if (!API_BASE_URL || typeof API_BASE_URL !== "string") {
  console.error(
    "CRITICAL CONFIG ERROR: VITE_ADMIN_API_URL is not defined or is not a string."
  );
  console.error(
    "Please check your .env files or hosting environment variables."
  );
  // Ném lỗi để dừng ứng dụng ngay, giúp phát hiện lỗi sớm.
  throw new Error(
    "API_BASE_URL is missing. The application cannot start."
  );
}

// 3. Tạo một instance axios cho Admin API
const api = axios.create({
  // ✅ ĐÃ VÁ: Sử dụng biến môi trường, không còn hardcode
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 4. Cấu hình Request Interceptor (Gắn token vào header)
//    (Logic của anh được giữ nguyên)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store
    const token = useAdminAuthStore.getState().token;

    if (token) {
      // Gắn token vào header Authorization
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 5. Cấu hình Response Interceptor (Tự động logout khi hết hạn)
//    (Logic của anh được giữ nguyên)
api.interceptors.response.use(
  (response) => {
    // Bất kỳ status code nào trong dải 2xx sẽ đi qua đây
    return response;
  },
  (error) => {
    // Bất kỳ status code nào ngoài dải 2xx sẽ đi qua đây
    const { response } = error;

    // Chỉ xử lý lỗi 401 (Unauthorized)
    if (response && response.status === 401) {
      const { logout, token } = useAdminAuthStore.getState();

      // Chỉ gọi logout() nếu thực sự ĐÃ CÓ token (đã đăng nhập)
      if (token) {
        console.error(
          "Phiên đăng nhập hết hạn hoặc không hợp lệ. Tự động đăng xuất."
        );
        logout();
      }
    }

    // Quan trọng: Ném lỗi ra lại
    return Promise.reject(error);
  }
);

export default api;