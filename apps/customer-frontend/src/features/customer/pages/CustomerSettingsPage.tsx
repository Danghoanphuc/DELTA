// apps/customer-frontend/src/features/customer/pages/CustomerSettingsPage.tsx
// ✅ SETTINGS V5: Personal Hub Layout (Juicy & Smooth)

import { useState } from "react";
import { 
  User, Lock, MapPin, Palette, Sparkles, 
  ChevronRight, ArrowLeft, LogOut, ShieldCheck
} from "lucide-react";
import { ProfileSettingsTab } from "../components/settings/ProfileSettingsTab";
import { SecuritySettingsTab } from "../components/settings/SecuritySettingsTab";
import { BrandKitTab } from "../components/settings/BrandKitTab";
import { AddressSettingsTab } from "../components/settings/AddressSettingsTab";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import { Separator } from "@/shared/components/ui/separator";

// Cấu hình Menu
const tabs = [
  { 
    value: "profile", 
    label: "Hồ sơ cá nhân", 
    icon: User, 
    color: "text-blue-600",
    bg: "bg-blue-50",
    description: "Quản lý thông tin hiển thị của bạn" 
  },
  { 
    value: "brand-kit", 
    label: "Brand Kit", 
    icon: Palette, 
    color: "text-purple-600",
    bg: "bg-purple-50",
    description: "Logo & Màu sắc thương hiệu" 
  },
  { 
    value: "address", 
    label: "Sổ địa chỉ", 
    icon: MapPin, 
    color: "text-green-600",
    bg: "bg-green-50",
    description: "Địa chỉ giao hàng mặc định" 
  },
  { 
    value: "security", 
    label: "Bảo mật", 
    icon: Lock, 
    color: "text-orange-600",
    bg: "bg-orange-50",
    description: "Mật khẩu & Xác thực 2 lớp" 
  },
  { 
    value: "ai", 
    label: "Cá nhân hóa AI", 
    icon: Sparkles, 
    color: "text-pink-600", 
    bg: "bg-pink-50",
    description: "Dạy Zin AI hiểu gu của bạn" 
  },
];

export function CustomerSettingsPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const { user, signOut} = useAuthStore();

  // Helper render nội dung
  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettingsTab />;
      case "brand-kit": return <BrandKitTab />;
      case "address": return <AddressSettingsTab />;
      case "security": return <SecuritySettingsTab />;
      case "ai": 
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 text-center border border-dashed border-purple-200 mt-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
               <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Zin AI đang học...</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Tính năng này sẽ giúp AI tự động đề xuất các mẫu thiết kế dựa trên lịch sử mua hàng và phong cách của bạn.
            </p>
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full" disabled>
              Sắp ra mắt
            </Button>
          </div>
        );
      default: return null;
    }
  };

  // --- MOBILE LAYOUT: Master-Detail (Updated Visuals) ---
  if (isMobile) {
    return (
      <div className="relative w-full h-[100dvh] bg-gray-50 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          
          {/* VIEW 1: MENU LIST */}
          {!isMobileDetailOpen ? (
            <motion.div 
              key="menu"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="p-6 bg-white pb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Cài đặt</h1>
                <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <UserAvatar 
                      name={user?.displayName || "Me"} 
                      src={user?.avatarUrl} 
                      size={40} 
                      className="ring-2 ring-white"
                   />
                   <div className="overflow-hidden">
                      <p className="font-semibold text-sm truncate">{user?.displayName || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                   </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1 px-4 py-2 pb-24">
                <div className="space-y-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => {
                        setActiveTab(tab.value);
                        setIsMobileDetailOpen(true);
                      }}
                      className="w-full flex items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0", tab.bg, tab.color)}>
                        <tab.icon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 text-sm">{tab.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tab.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  ))}

                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center p-4 mt-6 bg-red-50 rounded-2xl border border-red-100 active:scale-[0.98] transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
                      <LogOut size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-red-700 text-sm">Đăng xuất</h3>
                    </div>
                  </button>
                </div>
                
                <div className="mt-8 text-center pb-4">
                   <p className="text-xs text-gray-400">Printz App v1.0.0</p>
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            /* VIEW 2: DETAIL CONTENT */
            <motion.div 
              key="detail"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-gray-50 z-20 flex flex-col h-full"
            >
              <div className="h-14 px-4 bg-white border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="-ml-2 h-10 w-10 rounded-full text-gray-600"
                  onClick={() => setIsMobileDetailOpen(false)}
                >
                  <ArrowLeft size={22} />
                </Button>
                <h2 className="font-bold text-lg text-gray-900 truncate">
                  {tabs.find(t => t.value === activeTab)?.label}
                </h2>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 pb-24 w-full max-w-full overflow-x-hidden">
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                   >
                     {renderContent()}
                   </motion.div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- DESKTOP LAYOUT: Split View (Juicy) ---
  return (
    <div className="w-full bg-gray-50/50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
            <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và bảo mật.</p>
          </div>
          {/* Mini Profile Badge */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
             <UserAvatar name={user?.displayName || "U"} src={user?.avatarUrl} size={32} />
             <div className="text-sm">
                <p className="font-semibold text-gray-900 leading-none">{user?.displayName}</p>
                <p className="text-xs text-gray-500 leading-none mt-1">Thành viên</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Navigation */}
          <div className="col-span-3 sticky top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2 space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "w-full flex items-center p-3 rounded-xl transition-all duration-200 group text-left",
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors",
                      isActive ? "bg-white text-blue-600 shadow-sm" : "bg-gray-100 text-gray-500 group-hover:bg-white"
                    )}>
                      <tab.icon size={20} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", isActive ? "text-blue-700" : "text-gray-900")}>
                        {tab.label}
                      </p>
                      <p className={cn("text-xs mt-0.5 truncate max-w-[140px]", isActive ? "text-blue-500/80" : "text-gray-400")}>
                        {tab.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                      />
                    )}
                  </button>
                );
              })}
              
              <Separator className="my-2" />
              
              <button
                onClick={() => signOut()}
                className="w-full flex items-center p-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mr-3 text-red-500">
                  <LogOut size={20} />
                </div>
                <span className="text-sm font-semibold">Đăng xuất</span>
              </button>
            </div>

            {/* Security Badge */}
            <div className="mt-6 bg-green-50 rounded-2xl p-4 border border-green-100 flex items-start gap-3">
               <ShieldCheck className="text-green-600 w-5 h-5 mt-0.5" />
               <div>
                  <p className="text-sm font-bold text-green-800">Tài khoản an toàn</p>
                  <p className="text-xs text-green-700/80 mt-1 leading-relaxed">
                    Dữ liệu của bạn được mã hóa và bảo vệ an toàn tuyệt đối.
                  </p>
               </div>
            </div>
          </div>

          {/* RIGHT SIDE: Content */}
          <div className="col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="min-h-[500px]"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}