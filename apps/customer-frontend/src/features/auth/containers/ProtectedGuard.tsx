// apps/customer-frontend/src/features/auth/containers/ProtectedGuard.tsx
// ✅ Container component thay thế ProtectedRoute với tên mới và cải thiện UX

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card } from "@/shared/components/ui/card";
import { AuthLayout } from "../components/AuthLayout";

/**
 * ProtectedGuard - Bảo vệ các routes cần authentication
 *
 * ✅ KHÔNG dùng cho: /, /shop, /products/:id, /inspiration, /app
 * ✅ CHỈ dùng cho: /checkout, /orders, /printer/*, /settings
 */
export default function ProtectedGuard() {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Có thể xảy ra khi refresh trang
        if (!accessToken) {
          await refresh();
        }

        if (accessToken && !user) {
          await fetchMe();
        }

        if (isMounted) {
          setError(null);
        }
      } catch (err: any) {
        console.error("[ProtectedGuard] Init error:", err);
        if (isMounted) {
          setError(
            err.response?.data?.message || "Không thể xác thực người dùng"
          );
        }
      } finally {
        if (isMounted) {
          setStarting(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
    // ✅ CRITICAL: Empty dependency array - chỉ chạy 1 lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading state với UX tốt hơn
  if (starting || loading) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-sm p-8 bg-white/95 backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Đang tải trang...
            </h2>
            <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  // ✅ BƯỚC 6: Error state - Không redirect ngay, cho user đọc lỗi trước
  if (error && !accessToken) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-sm p-8 bg-white/95 backdrop-blur-md shadow-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-600">
              Xác thực thất bại
            </h2>
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-500">
              Vui lòng đăng nhập lại để tiếp tục
            </p>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={() =>
                  navigate("/signin", {
                    state: { from: location },
                    replace: true,
                  })
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/", { replace: true })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  // Chưa đăng nhập -> Redirect
  if (!accessToken) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Đã đăng nhập -> Render children
  return <Outlet />;
}
