// apps/admin-frontend/src/router/AdminProtectedRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

/**
 * Component "gác cổng" (Gatekeeper)
 * 1. Kiểm tra xem token có tồn tại trong Zustand store không.
 * 2. Tự động "lắng nghe" (subscribe) sự thay đổi của state.
 * 3. Nếu không có token (kể cả khi bị logout bởi interceptor),
 * tự động điều hướng về trang /login.
 */
export const AdminProtectedRoute = () => {
  // Lấy token và trạng thái từ store.
  // Component này sẽ re-render MỖI KHI token hoặc status thay đổi.
  const { token, status } = useAdminAuthStore((state) => ({
    token: state.token,
    status: state.status,
  }));

  // Xử lý logic điều hướng khi state thay đổi
  // (Đây chính là phần "toàn diện" mà Phúc yêu cầu)
  if (status !== "loading" && !token) {
    // Nếu không loading VÀ không có token, điều hướng đến /login
    // replace={true} để người dùng không thể "Back" lại trang admin
    return <Navigate to="/login" replace />;
  }

  // Xử lý trạng thái loading (ví dụ: đang fetchMe)
  // (Chúng ta sẽ làm trang Loading đẹp sau, giờ chỉ cần tạm)
  if (status === "loading") {
    return (
      <div style={{ padding: "20px" }}>Đang tải thông tin xác thực...</div>
    );
  }

  // Nếu có token và không loading, hiển thị các route con (Dashboard, v.v.)
  return <Outlet />;
};
