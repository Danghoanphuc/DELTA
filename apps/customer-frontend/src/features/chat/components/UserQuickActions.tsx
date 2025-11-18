// src/features/chat/components/UserQuickActions.tsx (CẬP NHẬT)
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Star, Heart, Clock, Package, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/shared/lib/utils";

interface AiAssistantCTAProps {
  onOpenChat?: () => void;
}

const AiAssistantCTA = ({ onOpenChat }: AiAssistantCTAProps) => (
  <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-3 text-white flex items-center gap-3 shadow-[0_15px_40px_rgba(59,130,246,0.35)]">
    <span className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
      <Sparkles size={22} className="text-white" />
    </span>
    <div className="flex-1">
      <p className="text-sm font-semibold">Zin AI Assistant</p>
      <p className="text-xs text-white/80">
        Trao đổi ý tưởng & đặt hàng cùng AI
      </p>
    </div>
    {onOpenChat ? (
      <Button
        size="sm"
        className="bg-white text-blue-700 hover:bg-white/90"
        type="button"
        onClick={onOpenChat}
      >
        Chat
      </Button>
    ) : (
      <Button
        asChild
        size="sm"
        className="bg-white text-blue-700 hover:bg-white/90"
      >
        <Link to="/chat">Chat</Link>
      </Button>
    )}
  </div>
);

// --- Phần đã đăng nhập ---
const AuthenticatedView = ({
  user,
  onOpenChat,
}: {
  user: any;
  onOpenChat?: () => void;
}) => {
  const actions = [
    { label: "Yêu thích của bạn", icon: Star, path: "/settings" },
    { label: "Thiết kế đã lưu", icon: Heart, path: "/designs" },
    { label: "Xem gần đây", icon: Clock, path: "/app" },
    { label: "Đơn hàng của tôi", icon: Package, path: "/orders" },
  ];

  return (
    <Card className="shadow-sm border-none bg-white h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <UserAvatar
            name={user.displayName || "User"}
            src={user.avatarUrl}
            size={40}
            fallbackClassName="bg-blue-100 text-blue-600"
          />
          <div>
            <p className="text-sm text-gray-500">Xin chào!</p>
            <p className="font-semibold text-gray-900 truncate">
              {user.displayName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 flex-1">
          {actions.map((action) => (
            <Button
              key={action.path}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-blue-600"
              asChild
            >
              <Link to={action.path}>
                <action.icon className="w-4 h-4 mr-3" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
        <AiAssistantCTA onOpenChat={onOpenChat} />
      </CardContent>
    </Card>
  );
};

// --- Phần chưa đăng nhập ---
const GuestView = ({ onOpenChat }: { onOpenChat?: () => void }) => {
  const navigate = useNavigate();
  return (
    <Card className="shadow-sm border-none bg-white h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Guest Info */}
        <div className="flex items-center gap-3 mb-4">
          <UserAvatar
            name="?"
            size={40}
            fallbackClassName="bg-gray-200 text-gray-600"
          />
          <div>
            <p className="text-sm text-gray-500">Xin chào!</p>
            <p className="font-semibold text-gray-900">Đăng nhập vào Printz </p>
          </div>
        </div>

        {/* (Buttons Đăng nhập/Đăng ký) */}
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 mb-2"
          onClick={() => navigate("/signin")}
        >
          Đăng nhập ngay
        </Button>
    

        {/* (Các nút actions mờ) */}
        <div className="space-y-2 opacity-60 flex-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
            disabled
          >
            <Star className="w-4 h-4 mr-3" />
            Yêu thích của bạn
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
            disabled
          >
            <Heart className="w-4 h-4 mr-3" />
            Đã lưu
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
            disabled
          >
            <Clock className="w-4 h-4 mr-3" />
            Xem gần đây
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700"
            disabled
          >
            <Package className="w-4 h-4 mr-3" />
            Đơn hàng của tôi
          </Button>
        </div>
        <AiAssistantCTA onOpenChat={onOpenChat} />
      </CardContent>
    </Card>
  );
};

interface UserQuickActionsProps {
  className?: string;
  onOpenChat?: () => void;
}

export const UserQuickActions = ({
  className = "",
  onOpenChat,
}: UserQuickActionsProps) => {
  const { user } = useAuthStore();

  return (
    <div className={cn("h-full min-h-[360px]", className)}>
      {user ? (
        <AuthenticatedView user={user} onOpenChat={onOpenChat} />
      ) : (
        <GuestView onOpenChat={onOpenChat} />
      )}
    </div>
  );
};