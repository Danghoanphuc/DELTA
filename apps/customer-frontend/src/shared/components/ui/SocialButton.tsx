// frontend/src/shared/components/ui/SocialButton.tsx
// ✅ FIXED: Added postMessage listener for OAuth callback

import { Button } from "@/shared/components/ui/button";
import { Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface SocialButtonProps {
  provider: "google";
}

export function SocialButton({ provider }: SocialButtonProps) {
  const { setAccessToken, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  const openGooglePopup = () => {
    const searchParams = new URLSearchParams({
      origin: window.location.origin,
    });
    const url = `${API_URL}/api/auth/google?${searchParams.toString()}`;
    const name = "Google Login";
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      url,
      name,
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popup) {
      console.error("[OAuth] Popup blocked by browser");
      alert("Popup bị chặn! Vui lòng cho phép popup và thử lại.");
      return;
    }

    // ✅ THÊM: Lắng nghe postMessage từ popup
    const messageListener = async (event: MessageEvent) => {
      const allowedOrigins = new Set([
        "http://localhost:5173",
        "http://localhost:3000",
        window.location.origin,
      ]);

      try {
        const backendOrigin = new URL(API_URL).origin;
        allowedOrigins.add(backendOrigin);
      } catch (error) {
        console.warn("[OAuth] Cannot parse API_URL origin:", error);
      }

      if (!allowedOrigins.has(event.origin)) {
        console.log("[OAuth] Ignoring message from unauthorized origin:", event.origin);
        return;
      }

      if (event.data?.success && event.data?.accessToken) {
        console.log("[OAuth] Received access token from popup");
        
        // Xóa listener
        window.removeEventListener("message", messageListener);
        
        // Đóng popup
        if (popup && !popup.closed) {
          popup.close();
        }

        try {
          // Set token và fetch user
          setAccessToken(event.data.accessToken);
          await fetchMe();
          toast.success("Đăng nhập thành công!");
          
          // ✅ Redirect ngay vào /app
          navigate("/app", { replace: true });
        } catch (err: any) {
          console.error("[OAuth] Error after receiving token:", err);
          if (err.response?.status === 404) {
            toast.error("Tài khoản chưa được tạo. Vui lòng thử lại.");
          } else {
            toast.error("Lỗi khi tải thông tin người dùng");
          }
        }
      } else if (event.data?.error) {
        window.removeEventListener("message", messageListener);
        if (popup && !popup.closed) {
          popup.close();
        }
        toast.error("Đăng nhập thất bại", { description: event.data.error });
      }
    };

    // Lắng nghe message từ popup
    window.addEventListener("message", messageListener);

    // Cleanup: Xóa listener nếu popup đóng thủ công
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener("message", messageListener);
      }
    }, 1000);
  };

  return (
    <Button
      variant="outline"
      className="w-full h-12 text-base gap-3"
      onClick={openGooglePopup}
      type="button"
    >
      <Chrome className="w-5 h-5" />
      Tiếp tục với Google
    </Button>
  );
}
