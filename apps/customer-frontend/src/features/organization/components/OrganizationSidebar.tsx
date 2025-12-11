// src/features/organization/components/OrganizationSidebar.tsx
// ✅ B2B Organization Sidebar (Desktop + Mobile) - Tiếng Việt thuần

import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  User,
  Users,
  Menu,
  Gift,
  UserCheck,
  BarChart3,
  Store,
  ChevronDown,
  ChevronRight,
  MapPin,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { UserContextSwitcher } from "@/components/UserContextSwitcher";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface NavItem {
  icon: any;
  label: string;
  id: string;
  children?: { label: string; id: string; description?: string }[];
}

interface OrganizationSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function OrganizationSidebar({
  activeTab,
  onTabChange,
}: OrganizationSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "gift-management",
    "recipients-delivery",
  ]);

  const mainNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Tổng quan", id: "dashboard" },
    {
      icon: Gift,
      label: "Đơn hàng & Quà tặng",
      id: "gift-management",
      children: [
        {
          label: "Tạo đơn mới",
          id: "send-swag",
          description: "Gửi quà cho người nhận",
        },
        {
          label: "Lịch sử đơn hàng",
          id: "swag-orders",
          description: "Xem các đơn đã tạo",
        },
        {
          label: "Bộ quà sẵn có",
          id: "swag-packs",
          description: "Quản lý các bộ quà",
        },
      ],
    },
    {
      icon: UserCheck,
      label: "Người nhận & Giao hàng",
      id: "recipients-delivery",
      children: [
        {
          label: "Danh sách người nhận",
          id: "recipients",
          description: "Quản lý người nhận",
        },
        {
          label: "Bản đồ giao hàng",
          id: "delivery-map",
          description: "Theo dõi vị trí",
        },
      ],
    },
    {
      icon: Store,
      label: "Chương trình đổi quà",
      id: "self-service",
      children: [
        {
          label: "Link đổi quà",
          id: "redemption-links",
          description: "Link 1 lần dùng",
        },
        {
          label: "Cửa hàng nội bộ",
          id: "company-store",
          description: "Store lâu dài",
        },
      ],
    },
    { icon: Users, label: "Quản lý thành viên", id: "team" },
    { icon: BarChart3, label: "Báo cáo & Phân tích", id: "analytics" },
  ];

  const secondaryNavItems: NavItem[] = [
    { icon: Settings, label: "Cài đặt", id: "settings" },
    { icon: HelpCircle, label: "Hỗ trợ", id: "support" },
    { icon: User, label: "Tài khoản", id: "account" },
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupActive = (item: NavItem) => {
    if (item.id === activeTab) return true;
    if (item.children) {
      return item.children.some((child) => child.id === activeTab);
    }
    return false;
  };

  // --- DESKTOP SIDEBAR ---
  const DesktopSidebar = () => (
    <div className="hidden lg:flex w-64 flex-col border-r border-stone-200 bg-white h-full fixed left-0 top-0 z-30 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 h-16 flex items-center bg-gradient-to-br from-orange-50 to-white">
        <div className="flex items-center gap-3 w-full">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-stone-900 truncate">
              {useAuthStore.getState().activeOrganizationProfile
                ?.businessName || "Organization"}
            </h2>
            <p className="text-xs text-stone-500">Enterprise Portal</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4 bg-stone-50/30">
        <div className="px-3 space-y-1">
          <p className="px-4 text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-[0.15em] mb-3 mt-2">
            Quản lý
          </p>
          {mainNavItems.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              <button
                onClick={() => {
                  if (item.children) {
                    toggleGroup(item.id);
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg",
                  isGroupActive(item)
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-200"
                    : "text-stone-700 hover:bg-white hover:text-stone-900 hover:shadow-sm"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    isGroupActive(item) ? "text-white" : "text-stone-400"
                  )}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.children &&
                  (expandedGroups.includes(item.id) ? (
                    <ChevronDown
                      size={16}
                      className={cn(
                        isGroupActive(item) ? "text-white/80" : "text-stone-400"
                      )}
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className={cn(
                        isGroupActive(item) ? "text-white/80" : "text-stone-400"
                      )}
                    />
                  ))}
              </button>

              {/* Children Items */}
              {item.children && expandedGroups.includes(item.id) && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-200 pl-3">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onTabChange(child.id)}
                      className={cn(
                        "w-full flex flex-col items-start gap-0.5 px-3 py-2 text-sm transition-all duration-200 rounded-md",
                        activeTab === child.id
                          ? "bg-orange-100 text-orange-900 font-medium shadow-sm"
                          : "text-stone-600 hover:bg-white hover:text-stone-900"
                      )}
                    >
                      <span>{child.label}</span>
                      {child.description && (
                        <span
                          className={cn(
                            "text-xs font-mono",
                            activeTab === child.id
                              ? "text-orange-700"
                              : "text-stone-400"
                          )}
                        >
                          {child.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <p className="px-4 text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-[0.15em] mb-3 mt-6">
            Hệ thống
          </p>
          {secondaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg",
                activeTab === item.id
                  ? "bg-gradient-to-r from-stone-700 to-stone-800 text-white shadow-md"
                  : "text-stone-700 hover:bg-white hover:text-stone-900 hover:shadow-sm"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  activeTab === item.id ? "text-white" : "text-stone-400"
                )}
              />
              {item.label}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-stone-200 bg-gradient-to-br from-stone-50 to-white text-[10px] font-mono text-center text-stone-400 tracking-wider">
        PrintZ Enterprise Portal v1.0
      </div>
    </div>
  );

  // --- MOBILE BOTTOM BAR ---
  const MobileBottomBar = () => {
    // Lấy 4 items quan trọng nhất cho bottom bar
    const mobileQuickItems = [
      mainNavItems[0], // Tổng quan
      mainNavItems[1], // Đơn hàng & Quà tặng (group)
      mainNavItems[2], // Người nhận & Giao hàng (group)
      mainNavItems[4], // Quản lý thành viên
    ];

    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileQuickItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.children) {
                  // Nếu là group, mở child đầu tiên
                  onTabChange(item.children[0].id);
                } else {
                  onTabChange(item.id);
                }
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-95 rounded-lg mx-1",
                isGroupActive(item)
                  ? "text-orange-600 bg-orange-50"
                  : "text-stone-500 hover:text-stone-700"
              )}
            >
              <item.icon
                size={24}
                strokeWidth={isGroupActive(item) ? 2.5 : 2}
                className={cn(
                  "transition-transform",
                  isGroupActive(item) && "-translate-y-0.5"
                )}
              />
              <span className="text-[10px] font-mono font-medium leading-none tracking-wide">
                {item.label.split(" ")[0]}
              </span>
            </button>
          ))}

          {/* More Button */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-95 rounded-lg mx-1",
                  secondaryNavItems.some((i) => i.id === activeTab) ||
                    mainNavItems[3].id === activeTab || // Chương trình đổi quà
                    mainNavItems[5].id === activeTab // Báo cáo & Phân tích
                    ? "text-orange-600 bg-orange-50"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                <Menu size={24} />
                <span className="text-[10px] font-mono font-medium leading-none tracking-wide">
                  Thêm
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
              <div className="flex flex-col h-full bg-stone-50">
                <div className="p-5 bg-gradient-to-br from-orange-50 to-white border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-stone-900">
                        {useAuthStore.getState().activeOrganizationProfile
                          ?.businessName || "Organization"}
                      </h2>
                      <p className="text-xs text-stone-500">
                        Enterprise Portal
                      </p>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {/* Remaining main items */}
                    <div>
                      <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-[0.15em] mb-3">
                        Tính năng khác
                      </p>
                      <div className="space-y-3">
                        {/* Self-service group */}
                        {(() => {
                          const selfServiceItem = mainNavItems[3];
                          const SelfServiceIcon = selfServiceItem.icon;

                          return selfServiceItem.children ? (
                            <div className="bg-white border-2 border-stone-200 rounded-xl shadow-sm overflow-hidden">
                              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-500 rounded-lg">
                                  <SelfServiceIcon
                                    size={16}
                                    className="text-white"
                                  />
                                </div>
                                <span className="font-semibold text-sm text-blue-900">
                                  {selfServiceItem.label}
                                </span>
                              </div>
                              {selfServiceItem.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => {
                                    onTabChange(child.id);
                                    document.body.click();
                                  }}
                                  className={cn(
                                    "w-full flex flex-col items-start gap-1 p-3 border-b last:border-b-0 border-stone-100 transition-all",
                                    activeTab === child.id
                                      ? "bg-blue-50 text-blue-900"
                                      : "hover:bg-stone-50 text-stone-700"
                                  )}
                                >
                                  <span className="font-medium text-sm">
                                    {child.label}
                                  </span>
                                  {child.description && (
                                    <span
                                      className={cn(
                                        "text-xs font-mono",
                                        activeTab === child.id
                                          ? "text-blue-600"
                                          : "text-stone-400"
                                      )}
                                    >
                                      {child.description}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}

                        {/* Báo cáo */}
                        {(() => {
                          const analyticsItem = mainNavItems[5];
                          const AnalyticsIcon = analyticsItem.icon;

                          return (
                            <button
                              onClick={() => {
                                onTabChange(analyticsItem.id);
                                document.body.click();
                              }}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 bg-white border-2 rounded-xl shadow-sm active:scale-98 transition-all",
                                activeTab === analyticsItem.id
                                  ? "border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 shadow-purple-100"
                                  : "border-stone-200 hover:border-purple-200"
                              )}
                            >
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  activeTab === analyticsItem.id
                                    ? "bg-purple-500 text-white"
                                    : "bg-stone-100 text-stone-600"
                                )}
                              >
                                <AnalyticsIcon size={20} />
                              </div>
                              <span
                                className={cn(
                                  "font-semibold",
                                  activeTab === analyticsItem.id
                                    ? "text-purple-900"
                                    : "text-stone-700"
                                )}
                              >
                                {analyticsItem.label}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Secondary items */}
                    <div>
                      <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-[0.15em] mb-3">
                        Hệ thống
                      </p>
                      <div className="space-y-2">
                        {secondaryNavItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              onTabChange(item.id);
                              document.body.click();
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 bg-white border-2 rounded-xl shadow-sm active:scale-98 transition-all",
                              activeTab === item.id
                                ? "border-stone-400 bg-gradient-to-r from-stone-100 to-stone-50 shadow-stone-200"
                                : "border-stone-200 hover:border-stone-300"
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                activeTab === item.id
                                  ? "bg-stone-700 text-white"
                                  : "bg-stone-100 text-stone-600"
                              )}
                            >
                              <item.icon size={20} />
                            </div>
                            <span
                              className={cn(
                                "font-semibold",
                                activeTab === item.id
                                  ? "text-stone-900"
                                  : "text-stone-700"
                              )}
                            >
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t-2 border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-stone-700 text-stone-700 hover:bg-stone-700 hover:text-white font-semibold transition-all rounded-xl"
                    onClick={() => document.body.click()}
                  >
                    Đóng menu
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  };

  return (
    <>
      <DesktopSidebar />
      <MobileBottomBar />
    </>
  );
}

export default OrganizationSidebar;
