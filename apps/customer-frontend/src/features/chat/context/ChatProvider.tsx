// src/features/chat/context/ChatProvider.tsx (TẠO MỚI)
import { createContext, useContext, ReactNode } from "react";
import { useChat, UseChatReturn } from "../hooks/useChat";

// 1. Tạo Context
const ChatContext = createContext<UseChatReturn | null>(null);

// 2. Tạo Provider
// Provider này sẽ gọi hook useChat (service) và "cung cấp" nó
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const chatState = useChat();

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
