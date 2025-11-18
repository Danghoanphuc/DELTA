// features/chat/components/AiFab.tsx
import { MessageCircle } from "lucide-react";

export const AiFab = () => {
  return (
    <button
      aria-label="Trợ lý AI Zin"
      className="fixed bottom-24 right-4 z-40 rounded-full bg-blue-600 text-white p-4 shadow-lg hover:bg-blue-700 transition-colors"
      onClick={() => {
        // Open chat route
        window.location.href = "/app#chat";
      }}
    >
      <MessageCircle size={22} />
    </button>
  );
};


