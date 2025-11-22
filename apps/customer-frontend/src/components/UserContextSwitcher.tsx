// src/components/UserContextSwitcher.tsx (CẬP NHẬT)
import { useState, useEffect } from "react";
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
  // ✅ FIX: Lấy user riêng lẻ để đảm bảo re-render khi user.printerProfileId thay đổi
  const user = useAuthStore((s) => s.user);
  const activeContext = useAuthStore((s) => s.activeContext);
  const setActiveContext = useAuthStore((s) => s.setActiveContext);
  const isContextLoading = useAuthStore((s) => s.isContextLoading);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // ❌ REMOVED: useEffect gọi fetchMe - đã gây ra vòng lặp vô hạn
  // App.tsx đã có logic fetchMe khi mount, không cần gọi lại ở đây

  const handleContextSwitch = async (context: AuthContext) => {
    try {
      // ✅ FIX: Đóng Popover trước khi chuyển context để tránh UI bị stuck
      setIsOpen(false);
      
      // Gọi setActiveContext (async)
      await setActiveContext(context, navigate);
    } catch (error) {
      console.error("❌ [UserContextSwitcher] Lỗi khi chuyển context:", error);
      // Mở lại Popover nếu có lỗi
      setIsOpen(true);
    }
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                          disabled={isContextLoading}
                        >
                          {isContextLoading ? (
                            <Loader2 size={16} className="mr-2 animate-spin" />
                          ) : (
                            <Repeat size={16} className="mr-2" />
                          )}
                          Chuyển sang Bán hàng
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className={`text-left justify-start ${colors.orange.brandColor}`}
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/printer/onboarding");
                          }}
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
                      disabled={isContextLoading}
                    >
                      {isContextLoading ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Repeat size={16} className="mr-2" />
                      )}
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
