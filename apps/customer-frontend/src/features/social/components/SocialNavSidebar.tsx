// apps/customer-frontend/src/features/social/components/SocialNavSidebar.tsx
// ✅ NEW: Thanh điều hướng chính (Messages - Friends - AI - Settings)

import { Link, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  Contact, 
  Settings, 
  Bot, // Icon cho AI
  LogOut 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";
import { useAuthStore } from "@/stores/useAuthStore";

export function SocialNavSidebar() {
  const location = useLocation();
  const { signOut } = useAuthStore();

  const navItems = [
    { 
      icon: MessageCircle, 
      label: "Tin nhắn", 
      path: "/messages",
      activePattern: /^\/messages/ 
    },
    { 
      icon: Contact, 
      label: "Danh bạ", 
      path: "/friends",
      activePattern: /^\/friends/ 
    },
    // Bạn có thể thêm Icon Todo/Task ở đây nếu cần giống Zalo hơn
  ];

  const bottomItems = [
    {
      icon: Bot,
      label: "Zin AI",
      path: "/chat",
      activePattern: /^\/chat/,
      highlight: true // Màu đặc biệt cho AI
    },
    {
      icon: Settings,
      label: "Cài đặt",
      path: "/settings",
      activePattern: /^\/settings/
    }
  ];

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  return (
    <div className="hidden lg:flex w-[64px] flex-col items-center py-6 bg-blue-700 h-full flex-shrink-0 z-50">
      <TooltipProvider delayDuration={0}>
        
        {/* TOP NAV */}
        <div className="flex flex-col gap-6 w-full items-center">
          {navItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-blue-600",
                    isActive(item.activePattern) 
                      ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-500" 
                      : "text-blue-200 hover:text-white"
                  )}
                >
                  <item.icon size={24} strokeWidth={isActive(item.activePattern) ? 2.5 : 2} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white border-0">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* BOTTOM NAV */}
        <div className="mt-auto flex flex-col gap-6 w-full items-center">
           {bottomItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                    isActive(item.activePattern) 
                      ? "bg-blue-600 text-white" 
                      : "text-blue-200 hover:text-white hover:bg-blue-600",
                    item.highlight && !isActive(item.activePattern) && "text-blue-100"
                  )}
                >
                  <item.icon size={24} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white border-0">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Nút Logout nhỏ */}
          <button 
            onClick={() => signOut()}
            className="text-blue-300 hover:text-red-300 transition-colors mt-2"
            title="Đăng xuất"
          >
             <LogOut size={20} />
          </button>
        </div>

      </TooltipProvider>
    </div>
  );
}