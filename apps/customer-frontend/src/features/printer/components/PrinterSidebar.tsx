// src/features/printer/components/PrinterSidebar.tsx
// ✅ RE-DESIGN: Desktop Sidebar + Mobile Bottom Bar (App-like Experience)

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  HelpCircle,
  User,
  Wallet,
  Library,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { UserContextSwitcher } from "@/components/UserContextSwitcher";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface PrinterSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PrinterSidebar({
  activeTab,
  onTabChange,
}: PrinterSidebarProps) {
  const mainNavItems = [
    { icon: LayoutDashboard, label: "Tổng quan", id: "dashboard" },
    { icon: ShoppingCart, label: "Đơn hàng", id: "orders" },
    { icon: Package, label: "Sản phẩm", id: "products" },
    { icon: Library, label: "Kho phôi", id: "assets" },
  ];

  const secondaryNavItems = [
    { icon: Wallet, label: "Ví tiền", id: "wallet" },
    { icon: Settings, label: "Cài đặt", id: "settings" },
    { icon: HelpCircle, label: "Hỗ trợ", id: "support" },
    { icon: User, label: "Tài khoản", id: "account" },
  ];

  // --- DESKTOP SIDEBAR (Clean & Professional) ---
  const DesktopSidebar = () => (
    <div className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white h-full fixed left-0 top-0 z-30">
      {/* Header / Context Switcher */}
      <div className="p-4 border-b border-gray-100 h-16 flex items-center">
        <UserContextSwitcher />
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
            Quản lý
          </p>
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === item.id
                  ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  activeTab === item.id ? "text-orange-600" : "text-gray-400"
                )}
              />
              {item.label}
            </button>
          ))}

          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">
            Hệ thống
          </p>
          {secondaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === item.id
                  ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  activeTab === item.id ? "text-orange-600" : "text-gray-400"
                )}
              />
              {item.label}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-xs text-center text-gray-400">
        PrintZ Printer Portal v1.0
      </div>
    </div>
  );

  // --- MOBILE BOTTOM BAR (Native App Feel) ---
  const MobileBottomBar = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around h-16 px-1">
        {mainNavItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-95",
              activeTab === item.id ? "text-orange-600" : "text-gray-400"
            )}
          >
            <item.icon
              size={24}
              strokeWidth={activeTab === item.id ? 2.5 : 2}
              className={cn(
                "transition-transform",
                activeTab === item.id && "-translate-y-0.5"
              )}
            />
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </button>
        ))}

        {/* "More" Button triggers Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-95",
                secondaryNavItems.some((i) => i.id === activeTab)
                  ? "text-orange-600"
                  : "text-gray-400"
              )}
            >
              <Menu size={24} />
              <span className="text-[10px] font-medium leading-none">Thêm</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
            <div className="flex flex-col h-full bg-gray-50">
              <div className="p-5 bg-white border-b">
                <UserContextSwitcher />
              </div>
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Tiện ích khác
                </p>
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      document.body.click();
                    }} // Close sheet trick
                    className={cn(
                      "w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-98 transition-all",
                      activeTab === item.id
                        ? "ring-2 ring-orange-500 border-transparent"
                        : ""
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-full bg-gray-100",
                        activeTab === item.id && "bg-orange-100 text-orange-600"
                      )}
                    >
                      <item.icon size={20} />
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t bg-white pb-[env(safe-area-inset-bottom)]">
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  Đóng menu
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomBar />
    </>
  );
}
