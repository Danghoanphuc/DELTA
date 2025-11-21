// apps/customer-frontend/src/features/customer/pages/CustomerSettingsPage.tsx
// ✅ SETTINGS V4: Master-Detail Pattern (Mobile-First UX)

import { useState } from "react";
import { 
  User, Lock, MapPin, Palette, Sparkles, 
  ChevronRight, ArrowLeft 
} from "lucide-react";
import { ProfileSettingsTab } from "../components/settings/ProfileSettingsTab";
import { SecuritySettingsTab } from "../components/settings/SecuritySettingsTab";
import { BrandKitTab } from "../components/settings/BrandKitTab";
import { AddressSettingsTab } from "../components/settings/AddressSettingsTab";
import { SocialNavSidebar } from "@/features/social/components/SocialNavSidebar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { value: "profile", label: "Hồ sơ cá nhân", icon: User, description: "Tên, avatar, thông tin cơ bản" },
  { value: "brand-kit", label: "Brand Kit", icon: Palette, description: "Logo, màu sắc thương hiệu" },
  { value: "address", label: "Sổ địa chỉ", icon: MapPin, description: "Quản lý địa chỉ giao hàng" },
  { value: "security", label: "Bảo mật & Đăng nhập", icon: Lock, description: "Đổi mật khẩu, 2FA" },
  { value: "ai", label: "Cá nhân hóa AI", icon: Sparkles, description: "Dạy Zin AI hiểu gu của bạn" },
];

export function CustomerSettingsPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Render Content Component dựa trên activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettingsTab />;
      case "brand-kit": return <BrandKitTab />;
      case "address": return <AddressSettingsTab />;
      case "security": return <SecuritySettingsTab />;
      case "ai": 
        return (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300 mt-4">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900">Zin AI đang học...</h3>
            <p className="text-gray-500 mt-2 text-sm">Tính năng cá nhân hóa bằng AI sẽ sớm ra mắt.</p>
          </div>
        );
      default: return null;
    }
  };

  // --- MOBILE LAYOUT: Master-Detail ---
  if (isMobile) {
    return (
      <div className="relative w-full h-[100dvh] bg-gray-50 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          
          {/* VIEW 1: MENU LIST (Master) */}
          {!isMobileDetailOpen ? (
            <motion.div 
              key="menu"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="px-5 pt-6 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
              </div>
              
              <ScrollArea className="flex-1 px-4 py-4 pb-24"> {/* pb-24 để tránh Bottom Nav */}
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
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 flex-shrink-0">
                        <tab.icon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 text-sm">{tab.label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tab.description}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                   <p className="text-xs text-gray-400">Phiên bản 1.0.0</p>
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            
            /* VIEW 2: DETAIL CONTENT (Detail) */
            <motion.div 
              key="detail"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-gray-50 z-20 flex flex-col h-full"
            >
              {/* Header Chi tiết */}
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

              {/* Content Area */}
              <ScrollArea className="flex-1">
                <div className="p-4 pb-24 w-full max-w-full overflow-x-hidden">
                   {/* Render nội dung settings */}
                   {renderContent()}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- DESKTOP LAYOUT: Sidebar + Tabs (Giữ nguyên layout cũ đã ổn) ---
  return (
    <div className="flex w-full bg-gray-50 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="hidden lg:block h-full flex-shrink-0">
        <SocialNavSidebar />
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt tài khoản</h1>
            <p className="text-gray-600">Quản lý thông tin cá nhân, thương hiệu và bảo mật.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-8 items-start">
            <TabsList className="flex flex-col h-auto p-2 bg-white w-64 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 sticky top-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full justify-start text-sm p-3 rounded-xl border border-transparent data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:font-medium transition-all mb-1"
                >
                  <tab.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 w-full min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                {renderContent()}
              </div>
            </div>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}