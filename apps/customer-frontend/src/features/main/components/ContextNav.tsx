// apps/customer-frontend/src/features/chat/components/ContextNav.tsx

import {
  Gem, // Thay Wand2 (Studio) -> Gem (Chế tác)
  Clock, // Thay Timer
  Users, // Thay Wallet (B2B)
  CalendarDays,
  ChevronRight,
  LayoutGrid,
  Scroll, // Thay FileText (Catalog)
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

// Cấu hình Menu - AN NAM CURATOR EDITION
const items = [
  {
    id: "bespoke",
    label: "Chế Tác Riêng",
    sublabel: "Khắc tên & Logo",
    icon: Gem,
    href: "/bespoke",
    // Style: Giấy Dó + Viền Amber
    bg: "bg-[#F9F8F6] hover:bg-white border border-stone-200 hover:border-amber-400",
    iconColor: "text-amber-800",
    badge: "BESPOKE",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-100 font-serif italic",
  },
  {
    id: "ready",
    label: "Sẵn Có & Giao Ngay",
    sublabel: "Ship hỏa tốc 4H",
    icon: Clock,
    href: "/ready-to-ship",
    bg: "bg-[#F9F8F6] hover:bg-white border border-stone-200 hover:border-stone-400",
    iconColor: "text-stone-600",
    badge: "EXPRESS",
    badgeColor: "bg-stone-100 text-stone-600 border-stone-200",
  },
  // 🔥 HERO ITEM: TƯ VẤN NGOẠI GIAO
  {
    id: "diplomacy",
    label: "Gói Ngoại Giao",
    sublabel: "Dành cho DN & VIP",
    icon: Users,
    href: "/business/consulting",
    // Style: Nền tối sang trọng
    bg: "bg-stone-900 hover:bg-stone-800 border border-stone-900 shadow-md group",
    iconColor: "text-amber-400", // Vàng kim trên nền đen
    textColor: "text-white group-hover:text-amber-50",
    subTextColor: "text-stone-400 group-hover:text-stone-300",
    badge: "CORPORATE",
    badgeColor: "bg-amber-900/30 text-amber-400 border-amber-800/50",
  },
  {
    id: "tet",
    label: "Quà Tết 2026",
    sublabel: "BST Ất Tỵ",
    icon: CalendarDays,
    href: "/collection/tet-2026",
    bg: "bg-[#F9F8F6] hover:bg-red-50 border border-stone-200 hover:border-red-200",
    iconColor: "text-red-800", // Đỏ trầm lễ hội
    badge: "NEW",
    badgeColor: "bg-red-50 text-red-700 border-red-100",
  },
  {
    id: "catalog",
    label: "Catalog Điện Tử",
    sublabel: "Tải PDF chi tiết",
    icon: Scroll,
    href: "/catalog",
    bg: "bg-[#F9F8F6] hover:bg-white border border-stone-200 hover:border-amber-400",
    iconColor: "text-stone-600",
    badge: "PDF",
    badgeColor: "bg-stone-100 text-stone-600 border-stone-200",
  },
];

interface ContextNavProps {
  className?: string;
  compact?: boolean;
  layout?: "vertical" | "mobile-grid";
}

export const ContextNav = ({
  className = "",
  compact = false,
  layout = "vertical",
}: ContextNavProps) => {
  // === RENDER CHO MOBILE ===
  if (layout === "mobile-grid") {
    return (
      <div className={cn("grid grid-cols-4 gap-3", className)}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-2 p-2.5 rounded-sm border transition-all active:scale-95 relative",
              item.id === "diplomacy"
                ? "bg-stone-900 border-stone-900 shadow-md"
                : "bg-white border-stone-100"
            )}
          >
            {/* Badge nhỏ */}
            {item.id === "diplomacy" && (
              <span className="absolute -top-1.5 right-0 bg-amber-700 text-white text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-full border border-stone-900">
                VIP
              </span>
            )}

            <div
              className={cn(
                "w-6 h-6 flex items-center justify-center",
                item.iconColor
              )}
            >
              <item.icon size={20} strokeWidth={1.5} />
            </div>
            <span
              className={cn(
                "text-[9px] uppercase tracking-wider font-medium text-center leading-tight",
                item.id === "diplomacy" ? "text-amber-50" : "text-stone-600"
              )}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
    );
  }

  // === RENDER CHO DESKTOP ===
  return (
    <Card
      className={cn(
        "border-none shadow-none bg-transparent h-full font-sans",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          <LayoutGrid size={12} className="text-stone-400" />
          <h3 className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
            Dịch vụ
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-5 rounded-sm px-5 py-4 transition-all duration-500 ease-out",
                "hover:pl-7",
                item.bg,
                compact && "px-4 py-3"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                  item.iconColor
                )}
              >
                <item.icon size={24} strokeWidth={1.2} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-lg font-serif font-bold tracking-tight transition-colors",
                      // @ts-ignore
                      item.textColor || "text-stone-900 group-hover:text-black"
                    )}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[8px] px-1.5 py-0.5 border uppercase tracking-widest leading-none rounded-sm",
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "text-xs font-mono mt-1 uppercase tracking-wider transition-colors font-light",
                    // @ts-ignore
                    item.subTextColor ||
                      "text-stone-500 group-hover:text-stone-700"
                  )}
                >
                  {item.sublabel}
                </div>
              </div>

              <div
                className={cn(
                  "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500",
                  // @ts-ignore
                  item.id === "diplomacy" ? "text-amber-400" : "text-stone-800"
                )}
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
