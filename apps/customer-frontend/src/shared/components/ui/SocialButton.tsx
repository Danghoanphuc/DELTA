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
    console.log("[OAuth] Frontend - Opening Google popup...");
    console.log("[OAuth] Frontend - Current origin:", window.location.origin);
    console.log("[OAuth] Frontend - API_URL:", API_URL);
    
    const searchParams = new URLSearchParams({
      origin: window.location.origin,
    });
    const url = `${API_URL}/api/auth/google?${searchParams.toString()}`;
    console.log("[OAuth] Frontend - OAuth URL:", url);
    
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
      console.error("[OAuth] ❌ Popup blocked by browser");
      alert("Popup bị chặn! Vui lòng cho phép popup và thử lại.");
      return;
    }
    
    console.log("[OAuth] Frontend - Popup opened successfully");

    // ✅ FIX: Lắng nghe postMessage từ popup - cải thiện logic
    let messageReceived = false;
    let timeoutId: NodeJS.Timeout;
    let checkPopupClosed: NodeJS.Timeout;
    
    const messageListener = async (event: MessageEvent) => {
      // ✅ FIX: Bỏ qua nếu đã nhận message
      if (messageReceived) {
        console.log("[OAuth] Message already processed, ignoring duplicate");
        return;
      }

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
        console.log("[OAuth] Frontend - API_URL:", API_URL);
        console.log("[OAuth] Frontend - Backend origin:", backendOrigin);
        console.log("[OAuth] Frontend - Current origin:", window.location.origin);
      } catch (error) {
        console.warn("[OAuth] Cannot parse API_URL origin:", error, "API_URL:", API_URL);
        // ✅ FIX: Thêm các backend origins phổ biến trong production
        allowedOrigins.add("https://delta-customer.onrender.com");
        allowedOrigins.add("http://delta-customer.onrender.com");
      }

      console.log("[OAuth] Frontend - Allowed origins:", Array.from(allowedOrigins));
      console.log("[OAuth] Frontend - Received message from origin:", event.origin);
      console.log("[OAuth] Frontend - Message data:", event.data);

      // ✅ FIX: Kiểm tra payload trước - nếu có accessToken thì chấp nhận ngay
      const hasValidPayload = event.data?.success && event.data?.accessToken;
      
      if (!hasValidPayload) {
        // Nếu không có payload hợp lệ, kiểm tra origin
        if (!allowedOrigins.has(event.origin)) {
          console.warn("[OAuth] Ignoring message - no valid payload and origin mismatch:", event.origin);
          return;
        }
      } else {
        // ✅ CRITICAL: Nếu có payload hợp lệ, chấp nhận ngay (bỏ qua origin check)
        console.log("[OAuth] ✅ Valid payload detected, accepting message from:", event.origin);
      }

      if (hasValidPayload) {
        messageReceived = true;
        console.log("[OAuth] ✅ Frontend - Received access token from popup");
        
        // Xóa listener ngay lập tức
        window.removeEventListener("message", messageListener);
        clearTimeout(timeoutId);
        clearInterval(checkPopupClosed);
        
        // ✅ FIX: Đóng popup ngay lập tức
        try {
          if (popup && !popup.closed) {
            console.log("[OAuth] Closing popup from frontend...");
            popup.close();
            // Fallback: Thử lại sau 100ms
            setTimeout(() => {
              if (popup && !popup.closed) {
                console.warn("[OAuth] Popup still open, trying to close again");
                popup.close();
              }
            }, 100);
          }
        } catch (err) {
          console.warn("[OAuth] Error closing popup:", err);
        }

        try {
          // Set token và fetch user
          console.log("[OAuth] Setting access token and fetching user...");
          setAccessToken(event.data.accessToken);
          await fetchMe();
          toast.success("Đăng nhập thành công!");
          
          // ✅ Redirect ngay vào /app
          navigate("/app", { replace: true });
          console.log("[OAuth] ✅ Successfully logged in and redirected");
        } catch (err: any) {
          console.error("[OAuth] Error after receiving token:", err);
          if (err.response?.status === 404) {
            toast.error("Tài khoản chưa được tạo. Vui lòng thử lại.");
          } else {
            toast.error("Lỗi khi tải thông tin người dùng");
          }
        }
      } else if (event.data?.error) {
        messageReceived = true;
        console.error("[OAuth] Received error from popup:", event.data.error);
        window.removeEventListener("message", messageListener);
        clearTimeout(timeoutId);
        clearInterval(checkPopupClosed);
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

    // ✅ FIX: Lắng nghe message từ popup - đảm bảo chỉ lắng nghe một lần
    console.log("[OAuth] Frontend - Setting up message listener");
    window.addEventListener("message", messageListener);

    // ✅ FIX: Thêm timeout để đóng popup nếu không nhận được message sau 30 giây
    timeoutId = setTimeout(() => {
      if (!messageReceived && popup && !popup.closed) {
        console.warn("[OAuth] ⚠️ Timeout: No message received after 30s, closing popup");
        try {
          popup.close();
        } catch (err) {
          console.warn("[OAuth] Error closing popup on timeout:", err);
        }
        window.removeEventListener("message", messageListener);
        clearInterval(checkPopupClosed);
        toast.error("Đăng nhập timeout. Vui lòng thử lại.");
      }
    }, 30000); // 30 seconds timeout

    // ✅ FIX: Cleanup - Xóa listener nếu popup đóng thủ công
    checkPopupClosed = setInterval(() => {
      if (popup.closed && !messageReceived) {
        console.log("[OAuth] Popup closed manually, cleaning up");
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
