// src/pages/ChatAppPage.tsx (HOÀN CHỈNH - Khôi Phục Layout & Chat Mới)

import { useState, useEffect } from "react";
import api from "@/lib/axios"; //
import { ChatMessage } from "@/types/chat"; //

import { Sidebar } from "@/components/Sidebar"; //
import { QuickAccessWidget } from "@/components/QuickAccessWidget"; //
import { HeroSection } from "@/components/HeroSection"; //
import { CategoryCards } from "@/components/CategoryCards"; //

export default function ChatAppPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Tải Lịch sử Chat
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/api/chat/history"); //
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Không thể tải lịch sử trò chuyện:", err);
      }
    };
    fetchHistory();
  }, []);

  // Hàm xử lý gửi tin nhắn
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
    // Không cần setIsChatExpanded ở đây nữa, Chatbar tự xử lý

    try {
      const payload = { message: textToSend, latitude, longitude };
      const res = await api.post("/api/chat/message", payload); //
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
      // Có thể thêm toast lỗi ở đây nếu muốn
      // toast.error( err.response?.data?.message || "AI đang gặp lỗi, thử lại sau!");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Hàm xử lý Chat Mới (Không Reload)
  const handleNewChat = () => {
    setMessages([]); // Xóa tin nhắn trên UI
    setIsChatExpanded(false); // Thu gọn Chatbar
  };

  // Lấy tin nhắn gần đây cho widget
  const recentMessages = messages.slice(-3);

  return (
    // Cấu trúc layout gốc
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100">
      {" "}
      {/* */}
      <Sidebar />
      <div className="ml-20 relative">
        {" "}
        {/* Giữ ml-20 và relative */}
        {/* Truyền handleNewChat xuống Widget */}
        <QuickAccessWidget
          recentMessages={recentMessages}
          onNewChat={handleNewChat}
        />
        {/* HeroSection chứa Tiêu đề và Chatbar */}
        <HeroSection
          messages={messages}
          isLoadingAI={isLoadingAI}
          isExpanded={isChatExpanded}
          setIsExpanded={setIsChatExpanded}
          onSendMessage={handleSendMessage}
        />
        {/* CategoryCards */}
        <CategoryCards />
        {/* Tính năng nổi bật */}
        <div className="w-full px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-6 text-gray-800 text-lg font-semibold">
              Tính năng nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all">
                {" "}
                {/* */}
                {/* ... Feature 1 ... */}
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all">
                {" "}
                {/* */}
                {/* ... Feature 2 ... */}
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all">
                {" "}
                {/* */}
                {/* ... Feature 3 ... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
