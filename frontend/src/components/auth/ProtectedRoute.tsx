// frontend/src/components/auth/ProtectedRoute.tsx (UPDATED)
import { useAuthStore } from "../../stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * ProtectedRoute - CHỈ dùng cho các routes thực sự cần authentication
 *
 * ✅ KHÔNG dùng cho: /, /shop, /products/:id, /inspiration, /trends
 * ✅ CHỈ dùng cho: /checkout, /orders, /printer/*, /settings, /designs
 */
const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const location = useLocation();

  const init = async () => {
    // Có thể xảy ra khi refresh trang
    if (!accessToken) {
      await refresh();
    }

    if (accessToken && !user) {
      await fetchMe();
    }

    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải trang...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    // Lưu lại trang người dùng muốn truy cập
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
