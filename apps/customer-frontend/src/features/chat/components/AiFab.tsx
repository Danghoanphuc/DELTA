// features/chat/components/AiFab.tsx
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";

export const AiFab = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // ✅ Ẩn trên mobile
  if (isMobile) return null;

  return (
    <button
      aria-label="Trợ lý AI Zin"
      className="fixed bottom-24 right-4 z-40 rounded-full bg-blue-600 text-white p-4 shadow-lg hover:bg-blue-700 transition-colors"
      onClick={() => {
        // Navigate to chat page
        navigate("/chat");
      }}
    >
      <MessageCircle size={22} />
    </button>
  );
};


