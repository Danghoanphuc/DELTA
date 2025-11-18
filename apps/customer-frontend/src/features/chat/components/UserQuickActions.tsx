// src/features/chat/components/UserQuickActions.tsx (CẬP NHẬT)
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Star, Heart, Clock, Package } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import zinGift from "@/assets/img/zin-avatar.png";

// --- Phần đã đăng nhập ---
const AuthenticatedView = ({ user }: { user: any }) => {
  const actions = [
    { label: "Yêu thích của bạn", icon: Star, path: "/settings" },
    { label: "Thiết kế đã lưu", icon: Heart, path: "/designs" },
    { label: "Xem gần đây", icon: Clock, path: "/app" },
    { label: "Đơn hàng của tôi", icon: Package, path: "/orders" },
  ];

  return (
    // ✅ SỬA: min-h-[21.5rem] -> min-h-[17rem]
    <Card className="shadow-sm border-none bg-white h-full flex flex-col min-h-[17rem]">
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
      </CardContent>
    </Card>
  );
};

// --- Phần chưa đăng nhập ---
const GuestView = () => {
  const navigate = useNavigate();
  return (
    // ✅ SỬA: min-h-[21.5rem] -> min-h-[17rem]
    <Card className="shadow-sm border-none bg-white h-full flex flex-col min-h-[17rem]">
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
      </CardContent>
    </Card>
  );
};

export const UserQuickActions = () => {
  const { user } = useAuthStore();

  return (
    <div>
      {user ? <AuthenticatedView user={user} /> : <GuestView />}
    </div>
  );
};