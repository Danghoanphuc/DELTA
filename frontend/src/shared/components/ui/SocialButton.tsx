// frontend/src/shared/components/ui/SocialButton.tsx
// ✅ FIXED: Removed duplicate OAuth handler, now handled by App.tsx

import { Button } from "@/shared/components/ui/button";
import { Chrome } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface SocialButtonProps {
  provider: "google";
}

export function SocialButton({ provider }: SocialButtonProps) {
  const openGooglePopup = () => {
    const url = `${API_URL}/api/auth/google`;
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
    }
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
