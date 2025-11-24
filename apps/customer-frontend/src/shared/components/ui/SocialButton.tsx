// apps/customer-frontend/src/shared/components/ui/SocialButton.tsx
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface SocialButtonProps {
  provider: "google";
  className?: string;
  mode?: "signIn" | "signUp"; // 🔥 Thêm prop này để biết ngữ cảnh
}

export function SocialButton({ provider, className, mode = "signIn" }: SocialButtonProps) {
  const { setAccessToken, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const isSignIn = mode === "signIn"; // Check mode

  // --- LOGIC OAUTH GIỮ NGUYÊN ---
  const openGooglePopup = () => {
    // ... (Giữ nguyên logic popup & postMessage cũ của bạn)
    console.log("[OAuth] Frontend - Opening Google popup...");
    const searchParams = new URLSearchParams({ origin: window.location.origin });
    const url = `${API_URL}/api/auth/google?${searchParams.toString()}`;
    const popup = window.open(url, "Google Login", "width=500,height=600");
    if (!popup) { alert("Popup bị chặn!"); return; }

    let messageReceived = false;
    const messageListener = async (event: MessageEvent) => {
       // ... (Logic cũ giữ nguyên)
       if (event.data?.success && event.data?.accessToken) {
          messageReceived = true;
          window.removeEventListener("message", messageListener);
          try { popup.close(); } catch(e){}
          setAccessToken(event.data.accessToken);
          await fetchMe();
          toast.success("Đăng nhập thành công!");
          navigate("/app", { replace: true });
       }
    };
    window.addEventListener("message", messageListener);
  };
  // ------------------------------

  // 🔥 TEXT & COLOR THEO NGỮ CẢNH
  const label = isSignIn ? "ĐĂNG NHẬP BẰNG GOOGLE" : "ĐĂNG KÝ BẰNG GOOGLE";
  const hoverColor = isSignIn ? "hover:border-indigo-600 hover:bg-indigo-50" : "hover:border-orange-500 hover:bg-orange-50";
  const textColor = isSignIn ? "group-hover:text-indigo-900" : "group-hover:text-orange-900";

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full h-11 gap-3 relative overflow-hidden group",
        "bg-white border-2 border-slate-200", // Mặc định trắng xám
        hoverColor, // 🔥 Đổi màu viền khi hover tùy mode
        "text-slate-700 font-bold uppercase tracking-wider text-xs md:text-sm",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "rounded-lg",
        className
      )}
      onClick={openGooglePopup}
      type="button"
    >
      <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
        <path d="M12 4.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      
      <span className={cn("transition-colors", textColor)}>
        {label} {/* 🔥 Text thay đổi */}
      </span>

      {/* Dấu chấm trạng thái */}
      <span className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors",
        "bg-slate-300", // Mặc định xám
        isSignIn ? "group-hover:bg-indigo-500" : "group-hover:bg-green-500" // Login: Tím, Signup: Xanh lá (New)
      )} />
    </Button>
  );
}