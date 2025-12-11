// apps/customer-frontend/src/features/auth/components/GoogleLoginButton.tsx
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { toast } from "@/shared/utils/toast";
import axios from "@/shared/lib/axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { setAccessToken, fetchMe } = useAuthStore();

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse: CredentialResponse) => {
          try {
            const { credential } = credentialResponse;
            if (!credential) return;

            // Gọi Backend Printz
            const res = await axios.post("/auth/google-verify", {
              credential,
              role: "customer",
            });

            const { accessToken, user } = res.data.data;

            // Lưu vào Store
            setAccessToken(accessToken);
            await fetchMe();

            toast.success(`Chào mừng ${user?.displayName || "bạn"}!`);

            // ✅ Use centralized redirect helper
            const { redirectAfterAuth } = await import(
              "@/features/auth/utils/redirect-helpers"
            );
            redirectAfterAuth(navigate);
          } catch (err: any) {
            const errorMsg =
              err.response?.data?.message || "Lỗi xác thực Google";
            toast.error(errorMsg);
          }
        }}
        onError={() => {
          toast.error("Đăng nhập Google thất bại");
        }}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
};

// Component đơn giản với One Tap (tự động hiển thị popup)
export const GoogleLoginButtonSimple = () => {
  const navigate = useNavigate();
  const { setAccessToken, fetchMe } = useAuthStore();

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse: CredentialResponse) => {
          try {
            const { credential } = credentialResponse;
            if (!credential) return;

            // Gọi Backend
            const res = await axios.post("/auth/google-verify", {
              credential,
              role: "customer",
            });

            const { accessToken, user } = res.data.data;

            setAccessToken(accessToken);
            await fetchMe();

            toast.success("Đăng nhập thành công!");

            // ✅ Use centralized redirect helper
            const { redirectAfterAuth } = await import(
              "@/features/auth/utils/redirect-helpers"
            );
            redirectAfterAuth(navigate);
          } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Lỗi đăng nhập";
            toast.error(errorMsg);
          }
        }}
        onError={() => {
          toast.error("Đăng nhập Google thất bại");
        }}
        useOneTap
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
};
