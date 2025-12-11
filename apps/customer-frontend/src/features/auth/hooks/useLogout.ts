// apps/customer-frontend/src/features/auth/hooks/useLogout.ts
// ✅ Custom hook để tách logic logout khỏi UI

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Hook xử lý logout logic
 *
 * @returns {Object} - Object chứa logout function
 * @returns {Function} logout - Function để thực hiện logout
 *
 * @example
 * const { logout } = useLogout();
 *
 * // Trong component
 * <Button onClick={logout}>Đăng xuất</Button>
 */
export function useLogout() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);

  const logout = async () => {
    try {
      await signOut();
      // Redirect về trang chủ sau khi logout
      navigate("/");
    } catch (error) {
      console.error("[useLogout] Error during logout:", error);
      // signOut đã xử lý toast và clear state
      // Vẫn redirect về trang chủ dù có lỗi
      navigate("/");
    }
  };

  return { logout };
}
