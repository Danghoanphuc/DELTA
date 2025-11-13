// src/features/chat/components/MiniChatWidget.tsx 
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import zinAvatar from "@/assets/img/zin-avatar.png";

export const MiniChatWidget = () => {
  return (
    <Card className="shadow-lg border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="p-5 text-center">
        <img
          src={zinAvatar}
          alt="Zin AI Avatar"
          className="w-16 h-16 mx-auto rounded-2xl shadow-lg mb-3"
        />
        <h3 className="text-lg font-semibold text-gray-900">
          Đặt hàng bằng AI, thử ngay!
        </h3>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          Từ chọn mẫu, chọn nhà in, đến theo dõi đơn hàng...
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
          <Link to="/app">
            Bắt đầu Chat
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
