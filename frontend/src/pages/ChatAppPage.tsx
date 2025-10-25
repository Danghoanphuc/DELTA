// frontend/src/pages/ChatAppPage.tsx
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { ChatMessage } from "@/types/chat";

import { Sidebar } from "@/components/Sidebar";
import { QuickAccessWidget } from "@/components/QuickAccessWidget";
import { HeroSection } from "@/components/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";

export default function ChatAppPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // ✅ SỬA: Bỏ /api ở đầu
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/chat/history"); // ✅ Đã sửa
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Không thể tải lịch sử trò chuyện:", err);
      }
    };
    fetchHistory();
  }, []);

  const handleSendMessage = async (
    textToSend: string,
    latitude?: number,
    longitude?: number
  ) => {
    const userMessage: ChatMessage = {
      _id: `temp-user-${Date.now()}`,
      senderType: "User",
      content: { text: textToSend },
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoadingAI(true);

    try {
      const payload = { message: textToSend, latitude, longitude };
      const res = await api.post("/chat/message", payload); // ✅ Đã sửa
      const aiResponseText = res.data?.content?.text;
      if (!aiResponseText) throw new Error("Phản hồi từ AI không hợp lệ");
      const aiMessage: ChatMessage = {
        _id: `temp-ai-${Date.now()}`,
        senderType: "AI",
        content: { text: aiResponseText },
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Lỗi gửi tin nhắn:", err);
      setMessages((prev) => prev.filter((msg) => msg._id !== userMessage._id));
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsChatExpanded(false);
  };

  const recentMessages = messages.slice(-3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      <Sidebar />
      <div className="ml-20 relative">
        <QuickAccessWidget
          recentMessages={recentMessages}
          onNewChat={handleNewChat}
        />
        <HeroSection
          messages={messages}
          isLoadingAI={isLoadingAI}
          isExpanded={isChatExpanded}
          setIsExpanded={setIsChatExpanded}
          onSendMessage={handleSendMessage}
        />
        <CategoryCards />
      </div>
    </div>
  );
}
