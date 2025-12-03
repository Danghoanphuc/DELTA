// apps/customer-frontend/src/features/social/components/SocialNavSidebar.tsx

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
  UserPlus,
  Home,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/shared/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useAuthStore } from "@/stores/useAuthStore";
import { CreateGroupModal } from "./CreateGroupModal";

export function SocialNavSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const navItems = [
    {
      icon: MessageSquare,
      label: "Tin nhắn",
      path: "/messages",
      activePattern: /^\/messages/,
    },
    {
      icon: Users,
      label: "Danh bạ",
      path: "/friends",
      activePattern: /^\/friends/,
    },
  ];

  const bottomItems = [
    {
      icon: Settings,
      label: "Cài đặt",
      path: "/settings",
      activePattern: /^\/settings/,
    },
  ];

  const isActive = (pattern: RegExp) => pattern.test(location.pathname);

  // Helper Component
  const NavItem = ({
    item,
    isSpecial = false,
  }: {
    item: any;
    isSpecial?: boolean;
  }) => {
    const active = isActive(item.activePattern);
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            className={cn(
              "relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
              // Style Logic:
              // Active: Màu đậm (Stone-900), nền nhẹ (Stone-100)
              // Inactive: Màu nhạt (Stone-400), hover đậm lên
              active
                ? "text-stone-900 bg-stone-100"
                : "text-stone-400 hover:text-stone-600 hover:bg-stone-50",

              // Special Item (Zin AI)
              isSpecial &&
                !active &&
                "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700"
            )}
          >
            {/* Indicator: Thanh gạch dọc tinh tế bên trái (Thay vì tô màu cả nút) */}
            {active && (
              <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-stone-900" />
            )}

            <item.icon
              size={20}
              strokeWidth={active ? 2.5 : 2}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </Link>
        </TooltipTrigger>
        {/* Tooltip phong cách tối giản */}
        <TooltipContent
          side="right"
          className="bg-stone-900 text-stone-50 text-[10px] font-bold uppercase tracking-wider border-none px-3 py-1.5 ml-2 shadow-xl"
        >
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="hidden lg:flex w-[72px] flex-col items-center py-6 bg-white border-r border-stone-100 h-full flex-shrink-0 z-50">
      <TooltipProvider delayDuration={100}>
        {/* 1. LOGO HOME (Thoát ra dashboard chính) */}
        <div className="mb-6">
          <Link
            to="/app"
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-lg shadow-stone-200 transition-all hover:bg-black hover:shadow-xl"
          >
            <Home size={20} strokeWidth={2} />
          </Link>
        </div>

        {/* 2. ACTION HUB (Create) */}
        <div className="mb-6">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-10 h-10 rounded-full border border-dashed border-stone-300 flex items-center justify-center transition-all duration-300",
                      isPopoverOpen
                        ? "bg-primary border-primary text-white rotate-45 shadow-md"
                        : "text-stone-400 hover:border-primary hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Plus size={20} strokeWidth={2} />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-stone-900 text-white text-[10px] uppercase font-bold ml-2 border-none"
              >
                <p>Tạo mới</p>
              </TooltipContent>
            </Tooltip>

            <PopoverContent
              side="right"
              align="start"
              className="w-64 p-1.5 ml-3 rounded-2xl shadow-2xl border-stone-100 bg-white/95 backdrop-blur-xl"
            >
              <div className="grid gap-1">
                <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Hội thoại
                </div>
                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setIsCreateGroupOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700 rounded-xl hover:bg-stone-100 transition-colors w-full text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-500 group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-sm">
                    <MessageCirclePlus size={16} />
                  </div>
                  Tạo nhóm chat
                </button>
                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    navigate("/friends");
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700 rounded-xl hover:bg-stone-100 transition-colors w-full text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-500 group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-sm">
                    <UserPlus size={16} />
                  </div>
                  Kết bạn mới
                </button>

                <div className="h-px bg-stone-100 my-1 mx-2" />

                <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Kinh doanh
                </div>
                <Link
                  to="/shop"
                  onClick={() => setIsPopoverOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700 rounded-xl hover:bg-stone-100 transition-colors w-full text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-500 group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-sm">
                    <ShoppingBag size={16} />
                  </div>
                  Đặt hàng in ấn
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setIsPopoverOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-700 rounded-xl hover:bg-stone-100 transition-colors w-full text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-100 flex items-center justify-center text-stone-500 group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-sm">
                    <UploadCloud size={16} />
                  </div>
                  Upload file
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Separator */}
        <div className="w-6 h-px bg-stone-100 mb-6" />

        {/* 3. MAIN NAV */}
        <div className="flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        {/* 4. AI BOT (Special) */}
        <div className="mt-auto mb-4">
          <NavItem
            item={{
              icon: Bot,
              label: "Trợ lý AI",
              path: "/chat",
              activePattern: /^\/chat/,
            }}
            isSpecial={true}
          />
        </div>

        {/* 5. SETTINGS & LOGOUT */}
        <div className="flex flex-col gap-3 w-full items-center pb-2">
          {bottomItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          <div className="mt-2 pt-2 border-t border-stone-100 w-full flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className="text-stone-300 hover:text-red-600 hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                >
                  <LogOut size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-red-600 text-white border-none text-[10px] font-bold uppercase ml-2"
              >
                <p>Đăng xuất</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={(newId) => navigate(`/messages?conversationId=${newId}`)}
      />
    </div>
  );
}
