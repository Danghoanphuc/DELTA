// src/features/printer/components/PrinterSidebar.tsx (✅ UPDATED WITH SHARED COMPONENT)
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  HelpCircle,
  User,
  Menu,
  X,
  Library,
  Wallet,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

// ✅ 1. Import component dùng chung mới
import { UserContextSwitcher } from "@/components/UserContextSwitcher";

interface PrinterSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PrinterSidebar({
  activeTab,
  onTabChange,
}: PrinterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ 2. Gỡ bỏ toàn bộ logic (useAuthStore, useNavigate, handleContextSwitch)

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: Package, label: "Sản phẩm", id: "products" },
    { icon: Library, label: "Kho Phôi (3D/2D)", id: "assets" },
    { icon: ShoppingCart, label: "Đơn hàng", id: "orders" },
    { icon: Wallet, label: "Ví của tôi", id: "wallet" },
    { icon: Settings, label: "Cài đặt", id: "settings" },
    { icon: HelpCircle, label: "Hỗ trợ", id: "support" },
    { icon: User, label: "Tài khoản", id: "account" },
  ];

  return (
    <TooltipProvider>
      {/* Nút toggle cho mobile (giữ nguyên) */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white border rounded-lg shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar (giữ nguyên) */}
      <div
        className={`fixed top-0 left-0 h-screen w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 z-40 transition-transform duration-300
        md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:flex`}
      >
        {/* Logo (giữ nguyên) */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>

        {/* Menu Items (giữ nguyên) */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-3">
          {menuItems.map((item) => (
            <Tooltip key={item.id} disableHoverableContent>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false); // auto close on mobile
                  }}
                  className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-orange-600"
                  }`}
                >
                  <item.icon size={24} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden md:block">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* ✅ 3. Gỡ bỏ Popover cũ, thay bằng component mới */}
        <div className="mt-auto mb-2">
          <UserContextSwitcher contextColor="orange" />
        </div>
      </div>

      {/* Overlay khi mở trên mobile (giữ nguyên) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </TooltipProvider>
  );
}
