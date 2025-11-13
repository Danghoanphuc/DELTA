// src/components/UserContextSwitcher.tsx (CẬP NHẬT)
import { LogIn, Store, Repeat, Loader2, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, AuthContext } from "@/stores/useAuthStore";
// ❌ GỠ BỎ: UserAvatarFallback
import { UserAvatar } from "@/components/UserAvatar"; // ✅ THAY THẾ
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import Logout from "@/features/auth/components/Logout";

interface UserContextSwitcherProps {
  contextColor: "blue" | "orange";
}

export function UserContextSwitcher({
  contextColor,
}: UserContextSwitcherProps) {
  const { user, activeContext, setActiveContext, isContextLoading } =
    useAuthStore();
  const navigate = useNavigate();

  const handleContextSwitch = (context: AuthContext) => {
    setActiveContext(context, navigate);
  };

  // (Màu sắc giữ nguyên)
  const colors = {
    blue: {
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      ringColor: "hover:ring-blue-400 focus:ring-blue-400",
      brandColor: "text-blue-600 hover:text-blue-700",
    },
    orange: {
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      ringColor: "hover:ring-orange-400 focus:ring-orange-400",
      brandColor: "text-orange-600 hover:text-orange-700",
    },
  };
  const theme = colors[contextColor];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`w-12 h-12 rounded-full overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.ringColor}`}
        >
          {/* ✅ SỬA LỖI TẠI ĐÂY */}
          <UserAvatar
            name={user?.displayName || "G"}
            src={user?.avatarUrl}
            size={48}
            className={user ? theme.textColor : "text-gray-600"}
            fallbackClassName={user ? theme.bgColor : "bg-gray-200"}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        className="w-60 p-4 rounded-lg shadow-lg bg-white border border-gray-100"
        sideOffset={16}
      >
        {user ? (
          <>
            <div className="flex items-center space-x-3 mb-4 border-b pb-3">
              {/* ✅ SỬA LỖI TẠI ĐÂY */}
              <UserAvatar
                name={user.displayName || user.username}
                src={user.avatarUrl}
                size={40}
                fallbackClassName={theme.bgColor}
                className={theme.textColor}
              />
              <div>
                <p
                  className="font-semibold text-sm truncate"
                  title={user.displayName}
                >
                  {user.displayName || user.username}
                </p>
                <p
                  className="text-xs text-gray-500 truncate"
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
            </div>
            {/* (Phần còn lại giữ nguyên) */}
            <div className="flex flex-col space-y-1">
              {isContextLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {activeContext === "customer" && (
                    <>
                      {user.printerProfileId ? (
                        <Button
                          variant="ghost"
                          className="text-left justify-start"
                          onClick={() => handleContextSwitch("printer")}
                        >
                          <Repeat size={16} className="mr-2" />
                          Chuyển sang Bán hàng
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className={`text-left justify-start ${colors.orange.brandColor}`}
                          onClick={() => navigate("/printer/onboarding")}
                        >
                          <Store size={16} className="mr-2" />
                          Mở Xưởng in (Miễn phí)
                        </Button>
                      )}
                    </>
                  )}
                  {activeContext === "printer" && (
                    <Button
                      variant="ghost"
                      className="text-left justify-start"
                      onClick={() => handleContextSwitch("customer")}
                    >
                      <Repeat size={16} className="mr-2" />
                      Chuyển sang Mua hàng
                    </Button>
                  )}
                </>
              )}
              <Separator className="my-1" />
              <Button
                variant="ghost"
                className="text-left justify-start"
                asChild
              >
                <Link
                  to={
                    activeContext === "printer"
                      ? "/printer/dashboard?tab=account"
                      : "/settings"
                  }
                >
                  <Settings size={16} className="mr-2" />
                  Cài đặt tài khoản
                </Link>
              </Button>
              <Separator className="my-1" />
              <Logout />
            </div>
          </>
        ) : (
          <>
            {/* (Phần Guest giữ nguyên) */}
            <div className="text-center mb-4">
              <p className="font-semibold text-sm">Chào mừng bạn!</p>
              <p className="text-xs text-gray-500">
                Vui lòng đăng nhập để trải nghiệm
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link to="/signin">
                  <LogIn size={16} className="mr-2" />
                  Đăng nhập
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/signup">Đăng ký</Link>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
