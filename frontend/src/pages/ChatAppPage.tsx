// frontend/src/pages/ChatAppPage.tsx (RESPONSIVE)
import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import api from "@/lib/axios";
import { ChatMessage } from "@/types/chat";
import { MobileUserAvatar } from "../components/MobileUserAvatar";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 ">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <div className="lg:ml-20 pt-0 -mt-0 md:-mt-3 relative">
        {/* Quick Access Widget - Desktop Only */}
        <div className="hidden lg:block">
          <QuickAccessWidget
            recentMessages={recentMessages}
            onNewChat={handleNewChat}
          />
        </div>
        <MobileUserAvatar />
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
      </div>
    </div>
  );
}
