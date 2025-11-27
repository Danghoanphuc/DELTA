// src/features/chat/context/ChatProvider.tsx (TẠO MỚI)
import { createContext, useContext, ReactNode } from "react";
import { useChat } from "../hooks/useChat";
import { useChatVercel } from "../hooks/useChatVercel";

// Type inference từ return type của hook
type UseChatReturn = ReturnType<typeof useChat>;
type UseChatVercelReturn = ReturnType<typeof useChatVercel>;

// Union type để hỗ trợ cả hai hook
type ChatContextType = UseChatReturn | UseChatVercelReturn | null;

// 1. Tạo Context
const ChatContext = createContext<ChatContextType>(null);

// 2. Tạo Provider
// Provider này sẽ gọi hook useChat (service) và "cung cấp" nó
// ✅ MỚI: Có thể switch giữa hook cũ và mới qua env variable
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Switch hook dựa trên env variable (mặc định dùng Vercel)
  const useVercelHook = import.meta.env.VITE_USE_VERCEL_CHAT !== "false";
  
  const chatStateOld = useChat();
  const chatStateVercel = useChatVercel();
  
  const chatState = useVercelHook ? chatStateVercel : chatStateOld;

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};

// 3. Tạo hook "consumer" (người tiêu dùng)
// Đây là cách các component khác "inject" (tiêm) service
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext phải được dùng bên trong ChatProvider");
  }
  return context;
};
