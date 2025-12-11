// apps/customer-frontend/src/features/auth/components/GoogleOneTapListener.tsx
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "@/shared/lib/axios";
import { toast } from "@/shared/utils/toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const GoogleOneTapListener = () => {
  const { user, setAccessToken, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  // Suppress Google SDK errors trong console (chỉ ở production)
  useEffect(() => {
    if (import.meta.env.PROD) {
      const originalError = console.error;
      const originalWarn = console.warn;

      // Intercept Google SDK errors để không spam console
      const errorHandler = (...args: any[]) => {
        const message = args[0]?.toString() || "";
        // Bỏ qua các lỗi từ Google SDK
        if (
          message.includes("GSI_LOGGER") ||
          message.includes("The given origin is not allowed") ||
          message.includes("FedCM") ||
          message.includes("credential_button_library")
        ) {
          return; // Suppress error
        }
        originalError.apply(console, args);
      };

      const warnHandler = (...args: any[]) => {
        const message = args[0]?.toString() || "";
        // Bỏ qua warnings từ Google SDK
        if (message.includes("GSI_LOGGER") || message.includes("FedCM")) {
          return;
        }
        originalWarn.apply(console, args);
      };

      console.error = errorHandler;
      console.warn = warnHandler;

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  // Chỉ hiển thị One Tap khi user chưa đăng nhập
  if (isAuthenticated) {
    return null;
  }

  // Component này sử dụng GoogleLogin với useOneTap để hiển thị One Tap
  // Ẩn button nhưng vẫn cho phép One Tap popup hiển thị
  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <GoogleLogin
        onSuccess={async (credentialResponse: CredentialResponse) => {
          const { credential } = credentialResponse;

          if (!credential) return;

          try {
            // Gọi API xác thực của Printz
            const res = await axios.post("/auth/google-verify", {
              credential,
              role: "customer",
            });

            const { accessToken, user: userData } = res.data.data;

            // Lưu thông tin đăng nhập
            setAccessToken(accessToken);
            await fetchMe();

            toast.success(
              `Chào mừng trở lại, ${userData?.displayName || "bạn"}!`
            );

            // ✅ Use centralized redirect helper (only if on landing/signin page)
            if (
              window.location.pathname === "/" ||
              window.location.pathname === "/signin"
            ) {
              const { redirectAfterAuth } = await import(
                "@/features/auth/utils/redirect-helpers"
              );
              redirectAfterAuth(navigate);
            }
          } catch (err: any) {
            const errorMsg =
              err.response?.data?.message || "Đăng nhập thất bại";
            // Chỉ hiển thị lỗi nếu không phải do user đóng popup
            if (err.response?.status !== 401) {
              toast.error(errorMsg);
            }
          }
        }}
        onError={() => {
          // Silent fail - không cần log
        }}
        useOneTap={true}
        auto_select={false}
        // Thêm các props cần thiết để tránh undefined
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
};
