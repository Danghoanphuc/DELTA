// frontend/src/components/ui/SocialButton.tsx (CẬP NHẬT)
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Mail } from "lucide-react"; // <-- THÊM

const API_BASE_URL = import.meta.env.VITE_API_URL;
type SocialProvider = "google" | "email"; // <-- THÊM "email"
type AuthRole = "customer" | "printer"; // <-- THÊM

interface SocialButtonProps {
  provider: SocialProvider;
  role: AuthRole; // <-- THÊM role
  className?: string;
  onClick?: () => void; // <-- THÊM onClick cho nút Email
  children?: React.ReactNode; // <-- THÊM children
}

export function SocialButton({
  provider,
  role,
  className,
  onClick,
  children,
}: SocialButtonProps) {
  const { setAccessToken, setUser, fetchMe } = useAuthStore();

  const providerConfig = {
    google: {
      name: "Google",
      bgColor: "bg-white hover:bg-gray-50",
      borderColor: "border-gray-200 hover:border-gray-300",
      textColor: "text-gray-700",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ),
    },
    // (MỚI) Định nghĩa cho nút email
    email: {
      name: "Tiếp tục với Email",
      bgColor: "bg-gray-900 hover:bg-gray-800",
      borderColor: "border-gray-900",
      textColor: "text-white",
      icon: <Mail className="w-5 h-5" />,
    },
  };

  const config = providerConfig[provider];

  // ✅ Lắng nghe message từ popup OAuth
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Kiểm tra origin an toàn
      const allowedOrigins = [
        API_BASE_URL,
        window.location.origin,
        "http://localhost:5001",
        "https://delta-j7qn.onrender.com",
      ];

      if (
        !allowedOrigins.some((origin) =>
          event.origin.includes(origin.replace(/^https?:\/\//, ""))
        )
      ) {
        console.warn("⚠️ Message từ origin không hợp lệ:", event.origin);
        return;
      }

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data?.type === "GOOGLE_AUTH_SUCCESS" && data?.accessToken) {
          console.log("✅ Nhận được auth data từ popup:", data.user?.email);

          // 1. Lưu accessToken vào store
          setAccessToken(data.accessToken);
          console.log("✅ Đã lưu accessToken vào store");

          // 2. Lưu user vào store
          if (data.user) {
            setUser(data.user);
            console.log("✅ Đã lưu user vào store");
          }

          // 3. Fetch thông tin user đầy đủ
          fetchMe(true).then(() => {
            console.log("✅ Đã fetch user info");
            toast.success(
              `Chào mừng ${data.user?.displayName || "bạn"} đến với PrintZ! 🎉`
            );

            // 4. Chuyển hướng về trang chủ
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          });
        }
      } catch (err) {
        console.error("❌ Lỗi xử lý message:", err);
        toast.error("Đăng nhập thất bại, vui lòng thử lại!");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setAccessToken, setUser, fetchMe]);

  // ✅ Hàm mở popup OAuth (CẬP NHẬT)
  const openOAuthPopup = () => {
    // Nếu là 'email', chỉ cần gọi onClick
    if (provider === "email" && onClick) {
      onClick();
      return;
    }

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // ✅ GẮN VAI TRÒ (role) VÀO URL
    const oauthUrl = `${API_BASE_URL}/api/auth/google?role=${role}`;

    console.log(`🔄 Mở popup OAuth: ${oauthUrl}`);

    const popup = window.open(
      oauthUrl,
      "googleLogin",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      toast.error("Không thể mở cửa sổ đăng nhập. Vui lòng cho phép popup!");
      return;
    }

    // Kiểm tra popup có bị đóng giữa chừng không
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        console.log("ℹ️ Popup đã đóng");
      }
    }, 1000);
  };

  return (
    <Button
      variant={provider === "google" ? "outline" : "default"}
      type="button"
      className={cn(
        "w-full h-12 gap-2.5 transition-all duration-200",
        config.bgColor,
        config.borderColor,
        config.textColor,
        "shadow-sm hover:shadow-md group",
        className
      )}
      onClick={openOAuthPopup}
    >
      <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
        {config.icon}
      </span>
      {/* (SỬA) Dùng children nếu có, nếu không thì dùng config.name */}
      <span className="flex-1 text-center font-semibold">
        {children || config.name}
      </span>
    </Button>
  );
}
