// src/features/chat/components/ChatTeaserSidebar.tsx (ĐÃ TINH GIẢN)
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sparkles, MessageSquarePlus, ArrowRight } from "lucide-react";

// ❌ GỠ BỎ: useChatContext, Clock, NativeScrollArea, cn
import zinAvatar from "@/assets/img/zin-avatar.png";

/**
 * Teaser cho Chat AI, nằm ở cột trái trang chủ
 * (Đã Tinh Giản - Không còn phụ thuộc vào useChatContext)
 */
export const ChatTeaserSidebar = () => {
  // ❌ GỠ BỎ: Toàn bộ logic useChatContext

  return (
    // ✅ Thêm h-full để đảm bảo chiều cao bằng component UserQuickActions
    <Card className="sticky top-24 shadow-sm border-none bg-white h-full">
      {/* 1. Header & CTA Chính */}
      <CardHeader className="text-center">
        <img
          src={zinAvatar}
          alt="Zin AI Avatar"
          className="w-16 h-16 mx-auto rounded-2xl shadow-lg"
        />
        <h3 className="text-xl font-bold text-gray-900 pt-2">Trợ lý AI Zin</h3>
        <p className="text-sm text-gray-500 pb-2">
          Tôi có thể giúp bạn thiết kế, tìm sản phẩm, hoặc theo dõi đơn hàng.
        </p>
        <Button
          asChild
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Link to="/app">
            <Sparkles size={18} className="mr-2" />
            Hỏi Zin bất cứ điều gì
          </Link>
        </Button>
      </CardHeader>

      {/* 2. Lịch sử chat (Đã gỡ bỏ) */}
      {/* ✅ THAY THẾ: Bằng một link "Chat Mới" đơn giản */}
      <CardContent className="border-t pt-4">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/app">
            <MessageSquarePlus size={18} className="mr-2" />
            Bắt đầu hội thoại mới
            <ArrowRight size={16} className="ml-auto" />
          </Link>
        </Button>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Lịch sử chat của bạn sẽ được hiển thị đầy đủ tại trang chat chuyên
          dụng.
        </p>
      </CardContent>
    </Card>
  );
};
