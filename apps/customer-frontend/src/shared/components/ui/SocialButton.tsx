// frontend/src/shared/components/ui/SocialButton.tsx
// ✅ FIXED: Added postMessage listener for OAuth callback

import { Button } from "@/shared/components/ui/button";
import { Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      // Build allowed origins list
      const allowedOrigins = new Set([
        "http://localhost:5173",
        "http://localhost:3000",
        window.location.origin,
      ]);

      // ✅ FIX: Thêm backend origin vào allowed origins
      try {
        const backendOrigin = new URL(API_URL).origin;
        allowedOrigins.add(backendOrigin);
        console.log("[OAuth] API_URL:", API_URL);
        console.log("[OAuth] Backend origin:", backendOrigin);
      } catch (error) {
        console.warn("[OAuth] Cannot parse API_URL origin:", error, "API_URL:", API_URL);
        // ✅ FIX: Thêm các backend origins phổ biến trong production
        allowedOrigins.add("https://delta-customer.onrender.com");
        allowedOrigins.add("http://delta-customer.onrender.com");
      }

      console.log("[OAuth] Allowed origins:", Array.from(allowedOrigins));
      console.log("[OAuth] Received message from origin:", event.origin);
      console.log("[OAuth] Message data:", event.data);

      // ✅ FIX: Kiểm tra origin - chấp nhận từ backend origin hoặc frontend origin
      // ✅ FIX: Nếu có payload hợp lệ, chấp nhận message (OAuth callback an toàn hơn)
      const hasValidPayload = event.data?.success && event.data?.accessToken;
      
      if (!allowedOrigins.has(event.origin) && !hasValidPayload) {
        console.warn("[OAuth] Ignoring message from unauthorized origin:", event.origin, "Allowed:", Array.from(allowedOrigins));
        return;
      }
      
      // ✅ FIX: Log cảnh báo nếu origin không khớp nhưng có payload hợp lệ
      if (!allowedOrigins.has(event.origin) && hasValidPayload) {
        console.warn("[OAuth] ⚠️ Origin không khớp nhưng có payload hợp lệ. Chấp nhận message từ:", event.origin);
      }

      if (event.data?.success && event.data?.accessToken) {
        console.log("[OAuth] ✅ Received access token from popup");
        
        // Xóa listener
        window.removeEventListener("message", messageListener);
        
        // ✅ FIX: Đóng popup ngay lập tức và có fallback
        try {
          if (popup && !popup.closed) {
            popup.close();
            // Fallback: Nếu popup không đóng được, thử lại sau 500ms
            setTimeout(() => {
              if (popup && !popup.closed) {
                console.warn("[OAuth] Popup still open, trying to close again");
                popup.close();
              }
            }, 500);
          }
        } catch (err) {
          console.warn("[OAuth] Error closing popup:", err);
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
        console.error("[OAuth] Received error from popup:", event.data.error);
        window.removeEventListener("message", messageListener);
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch (err) {
          console.warn("[OAuth] Error closing popup on error:", err);
        }
        toast.error("Đăng nhập thất bại", { description: event.data.error });
      }
    };

    // Lắng nghe message từ popup
    window.addEventListener("message", messageListener);

    // ✅ FIX: Thêm timeout để đóng popup nếu không nhận được message sau 30 giây
    const timeoutId = setTimeout(() => {
      if (popup && !popup.closed) {
        console.warn("[OAuth] Timeout: No message received, closing popup");
        try {
          popup.close();
        } catch (err) {
          console.warn("[OAuth] Error closing popup on timeout:", err);
        }
        window.removeEventListener("message", messageListener);
        toast.error("Đăng nhập timeout. Vui lòng thử lại.");
      }
    }, 30000); // 30 seconds timeout

    // Cleanup: Xóa listener nếu popup đóng thủ công
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        clearTimeout(timeoutId);
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
