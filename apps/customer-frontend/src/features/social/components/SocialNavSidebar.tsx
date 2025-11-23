// apps/customer-frontend/src/features/social/components/SocialNavSidebar.tsx
// ✅ FINAL VERSION: Desktop Sidebar hoàn chỉnh
// - UI: Modern White Theme (SaaS Style)
// - UX: Smart Action Popover (Group, 1-1, Order, Upload)
// - Feature: Global Create Group Modal

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Bot, 
  LogOut,
  Plus,
  ShoppingBag,
  UploadCloud,
  MessageCirclePlus,
  UserPlus
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useAuthStore } from "@/stores/useAuthStore";
import { CreateGroupModal } from "./CreateGroupModal";

export function SocialNavSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  
  // State quản lý Modal và Popover
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const navItems = [
    { 
      icon: MessageSquare, 
      label: "Tin nhắn", 
      path: "/messages",
      activePattern: /^\/messages/ 
    },
    { 
      icon: Users, 
      label: "Danh bạ", 
      path: "/friends",
      activePattern: /^\/friends/ 
    },
  ];

  const bottomItems = [
    {
      icon: Settings,
      label: "Cài đặt",
      path: "/settings",
      activePattern: /^\/settings/
    }
  ];

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  // Helper render Nav Item
  const NavItem = ({ item, isSpecial = false }: { item: any, isSpecial?: boolean }) => {
    const active = isActive(item.activePattern);
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            className={cn(
              "relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
              active 
                ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100" 
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
              isSpecial && !active && "text-purple-600 bg-purple-50 hover:bg-purple-100"
            )}
          >
            {/* Indicator Line cho trạng thái Active */}
            {active && (
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
            )}
            <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-900 text-white border-0 text-xs font-medium ml-2">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="hidden lg:flex w-[72px] flex-col items-center py-6 bg-white border-r border-gray-200 h-full flex-shrink-0 z-50 shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
      <TooltipProvider delayDuration={0}>
        
        {/* 1. SMART ACTION HUB - Nút tạo mới đa năng */}
        <div className="mb-6">
             <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <button 
                                className={cn(
                                    "w-10 h-10 rounded-full border border-dashed flex items-center justify-center transition-all duration-300",
                                    isPopoverOpen 
                                        ? "bg-blue-600 border-transparent text-white rotate-45 shadow-md" 
                                        : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50"
                                )}
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2"><p>Tạo mới</p></TooltipContent>
                </Tooltip>

                <PopoverContent side="right" align="start" className="w-60 p-1 ml-2 rounded-xl shadow-xl border-gray-100 bg-white">
                    <div className="grid gap-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Hội thoại
                        </div>
                        
                        {/* Tạo nhóm chat */}
                        <button 
                            onClick={() => {
                                setIsPopoverOpen(false);
                                setIsCreateGroupOpen(true);
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors w-full text-left group"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <MessageCirclePlus size={16} />
                            </div>
                            Tạo nhóm mới
                        </button>

                        {/* Chat 1-1 (Link sang Friends) */}
                        <button 
                            onClick={() => {
                                setIsPopoverOpen(false);
                                navigate("/friends");
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors w-full text-left group"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <UserPlus size={16} />
                            </div>
                            Tin nhắn riêng
                        </button>

                        <div className="h-px bg-gray-100 my-1" />
                        
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Kinh doanh
                        </div>

                        {/* Tạo đơn hàng */}
                        <Link 
                            to="/shop" 
                            onClick={() => setIsPopoverOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors w-full text-left group"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <ShoppingBag size={16} />
                            </div>
                            Tạo đơn hàng
                        </Link>

                        {/* Upload thiết kế */}
                        <Link 
                            to="/upload" 
                            onClick={() => setIsPopoverOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors w-full text-left group"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <UploadCloud size={16} />
                            </div>
                            Upload thiết kế
                        </Link>
                    </div>
                </PopoverContent>
             </Popover>
        </div>

        {/* Separator */}
        <div className="w-8 h-px bg-gray-100 mb-6" />

        {/* 2. MAIN NAV */}
        <div className="flex flex-col gap-3 w-full items-center">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {/* 3. AI BOT (Special Item) */}
        <div className="mt-auto mb-3">
             <NavItem 
                item={{ 
                    icon: Bot, 
                    label: "Zin AI", 
                    path: "/chat", 
                    activePattern: /^\/chat/ 
                }} 
                isSpecial={true} 
             />
        </div>

        {/* 4. BOTTOM NAV */}
        <div className="flex flex-col gap-3 w-full items-center pb-2">
           {bottomItems.map((item) => (
             <NavItem key={item.path} item={item} />
           ))}
          
          {/* Logout Button */}
          <div className="mt-2 pt-2 border-t border-gray-100 w-full flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => signOut()}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Đăng xuất</p></TooltipContent>
              </Tooltip>
          </div>
        </div>

      </TooltipProvider>

      {/* GLOBAL MODAL: Cho phép tạo nhóm từ bất kỳ đâu */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={(newId) => {
            // Điều hướng ngay tới nhóm vừa tạo
            navigate(`/messages?conversationId=${newId}`);
        }}
      />
    </div>
  );
}