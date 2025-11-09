// frontend/src/shared/components/ui/SocialButton.tsx
// BÀN GIAO: Đã áp dụng bản vá (chỉ nhận accessToken, gọi fetchMe)
// vào logic phức tạp có sẵn (redirect 'from', merge cart).

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { Chrome } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";

// Đọc API_URL từ .env (Giữ nguyên)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
// Lấy CLIENT_URL từ window.location (Giữ nguyên)
const CLIENT_URL = window.location.origin;

export function SocialButton({ provider }: { provider: "google" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SỬA: Lấy 'fetchMe' thay vì 'setUser'.
  // 'user' vẫn được lấy để dùng cho useEffect redirect bên dưới.
  const { setAccessToken, fetchMe, user } = useAuthStore.getState();

  const openGooglePopup = () => {
    const url = `${API_URL}/api/auth/google`;
    // (logic mở popup... giữ nguyên)
    const name = "Google Đăng nhập";
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      url,
      name,
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 1. KIỂM TRA BẢO MẬT (Giữ nguyên)
      if (event.origin !== CLIENT_URL) {
        // console.warn("Tin nhắn bị chặn từ origin:", event.origin);
        return;
      }

      const { data } = event;

      // ✅ 2. SỬA LẠI LOGIC XỬ LÝ PAYLOAD
      // Chỉ mong đợi 'accessToken', KHÔNG mong đợi 'user'
      if (data.success === true && data.accessToken) {
        toast.success("Đăng nhập Google thành công!");

        // 3. CẬP NHẬT STATE (Chỉ set token)
        setAccessToken(data.accessToken);
        // ❌ KHÔNG GỌI: setUser(data.user);

        // 4. GỌI FETCHME ĐỂ LẤY USER
        // Sau khi fetchMe() xong, MỚI merge giỏ hàng và điều hướng
        fetchMe().then(() => {
          // 5. MERGE GIỎ HÀNG (Sau khi đã có user)
          useCartStore.getState().mergeGuestCartToServer();

          // 6. ĐIỀU HƯỚNG (Logic cũ của anh)
          const from = location.state?.from?.pathname;
          if (from) {
            navigate(from, { replace: true });
          } else {
            // Mặc định về trang chủ (sẽ tự động sang /app nếu đã login)
            navigate("/", { replace: true });
          }
        });
      } else if (data.success === false) {
        toast.error(data.message || "Đăng nhập OAuth thất bại.");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };

    // ✅ SỬA: Thay 'setUser' bằng 'fetchMe'
  }, [navigate, location.state, setAccessToken, fetchMe]);

  // Redirect nếu đã login (Logic này của anh giữ nguyên)
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      navigate(from || "/", { replace: true });
    }
  }, [user, navigate, location.state]);

  return (
    <Button
      variant="outline"
      className="w-full h-12 text-base gap-3"
      onClick={openGooglePopup}
    >
      <Chrome className="w-5 h-5" />
      Tiếp tục với Google
    </Button>
  );
}
