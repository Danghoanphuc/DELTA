// frontend/src/pages/ChatAppPage.tsx (RESPONSIVE)
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import api from "@/lib/axios";
import { ChatMessage } from "@/types/chat";

import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { QuickAccessWidget } from "@/components/QuickAccessWidget";
import { HeroSection } from "@/components/HeroSection";
import { CategoryCards } from "@/components/CategoryCards";

export default function ChatAppPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/chat/history");
        setMessages(
          Array.isArray(res.data?.data?.messages) ? res.data.data.messages : []
        );
      } catch (err) {
        console.error("Không thể tải lịch sử:", err);
      }
    };
    fetchHistory();
  }, []);

  const addUserMessageToState = (textToSend: string): ChatMessage => {
    const userMessage: ChatMessage = {
      _id: `temp-user-${Date.now()}`,
      senderType: "User",
      content: { text: textToSend },
    };

    flushSync(() => {
      setMessages((prev) => [...prev, userMessage]);
      setIsLoadingAI(true);
    });
    return userMessage;
  };

  const getAIResponse = async (
    userMessage: ChatMessage,
    latitude?: number,
    longitude?: number
  ) => {
    try {
      const payload = {
        message: userMessage.content.text,
        latitude,
        longitude,
      };
      const res = await api.post("/chat/message", payload);
      const aiResponseText = res.data?.data?.content?.text;
      if (!aiResponseText) throw new Error("Phản hồi không hợp lệ");
      const aiMessage: ChatMessage = {
        _id: `temp-ai-${Date.now()}`,
        senderType: "AI",
        content: { text: aiResponseText },
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Lỗi gửi tin nhắn:", err);
      // remove the user message on failure
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
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <div className="lg:ml-20 pt-16 lg:pt-0 relative">
        {/* Quick Access Widget - Desktop Only */}
        <div className="hidden lg:block">
          <QuickAccessWidget
            recentMessages={recentMessages}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Hero Section */}
        <HeroSection
          messages={messages}
          isLoadingAI={isLoadingAI}
          isExpanded={isChatExpanded}
          setIsExpanded={setIsChatExpanded}
          onAddUserMessage={addUserMessageToState}
          onGetAIResponse={getAIResponse}
        />

        {/* Category Cards */}
        <CategoryCards />

        {/* Features Section */}
        <div className="w-full px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-4 md:mb-6 text-gray-800 text-base md:text-lg font-semibold">
              Tính năng nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  title: "Tìm nhà in nhanh",
                  desc: "AI tự động tìm nhà in phù hợp nhất",
                  icon: "🔍",
                },
                {
                  title: "Báo giá tức thì",
                  desc: "Nhận báo giá ngay lập tức từ nhiều nhà in",
                  icon: "💰",
                },
                {
                  title: "Giao hàng tận nơi",
                  desc: "Theo dõi đơn hàng và nhận hàng tại nhà",
                  icon: "🚚",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200/50 hover:shadow-lg transition-all"
                >
                  <div className="text-3xl md:text-4xl mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
