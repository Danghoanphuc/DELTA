// apps/customer-frontend/src/features/chat/components/ContextNav.tsx

import {
  Wand2,
  Building2,
  Timer,
  CalendarDays,
  ChevronRight,
  LayoutGrid,
  Wallet,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

// Cấu hình Menu Điều hướng - QUIET LUXURY EDITION (Tiếng Việt)
const items = [
  {
    id: "studio",
    label: "AI Studio",
    sublabel: "Tự thiết kế Free",
    icon: Wand2,
    href: "/design-editor",
    // Style: Giấy mỹ thuật trắng + Viền đá xám
    bg: "bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400",
    iconColor: "text-stone-600",
    badge: "BETA",
    badgeColor: "bg-stone-100 text-stone-600 border-stone-200",
  },
  {
    id: "fast",
    label: "In Gấp 2H",
    sublabel: "Giao ngay trong ngày",
    icon: Timer,
    href: "/rush",
    bg: "bg-white hover:bg-stone-50 border border-stone-200 hover:border-orange-300",
    iconColor: "text-orange-700", // Cam đất (Burnt Orange) sang hơn cam tươi
    badge: "EXPRESS",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-100 font-medium",
  },
  // 🔥 HERO ITEM: GIÁ SỈ & CÔNG NỢ (Không bôi đen, chỉ nhấn viền sang)
  {
    id: "b2b",
    label: "Doanh Nghiệp", // Tiếng Việt thực dụng
    sublabel: "Chiết khấu - Ưu đãi",
    icon: Wallet,
    href: "/business/contract",
    // Style: Trắng sạch + Highlight nhẹ Blue Navy (Sang trọng)
    bg: "bg-white hover:bg-blue-50/30 border border-stone-200 hover:border-blue-800 shadow-sm",
    iconColor: "text-blue-900", // Xanh Navy đậm quyền lực
    badge: "VIP",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-100 font-bold",
  },
  {
    id: "event",
    label: "Sự Kiện ",
    sublabel: "Lễ, Tết, Year End",
    icon: CalendarDays,
    href: "/inspiration",
    bg: "bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400",
    iconColor: "text-stone-600",
    badge: "COMBO",
    badgeColor: "",
  },
  {
    id: "quote", // Đổi ID từ fast -> quote (hoặc giữ fast nếu muốn logic cũ)
    label: "Báo Giá", // Đổi tên để đánh trúng nỗi đau chờ đợi
    sublabel: "Tải PDF có mộc đỏ", // Benefit cực mạnh
    icon: FileText, // Icon giấy tờ
    href: "/quote", // Vẫn trỏ về luồng đặt nhanh
    bg: "bg-white hover:bg-stone-50 border border-stone-200 hover:border-orange-300",
    iconColor: "text-orange-700",
    badge: "AUTO",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-100 font-medium",
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
  // === RENDER CHO MOBILE (Lưới tối giản - Sang trọng) ===
  if (layout === "mobile-grid") {
    return (
      <div className={cn("grid grid-cols-4 gap-3", className)}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-2 p-2.5 rounded-sm border transition-all active:scale-95 relative bg-white",
              // Mobile style: Border mỏng, màu sắc tinh tế
              item.id === "b2b" ? "border-blue-900/30" : "border-stone-100"
            )}
          >
            {/* Badge nhỏ cho B2B */}
            {item.id === "b2b" && (
              <span className="absolute top-0 right-0 bg-blue-900 text-white text-[8px] font-serif italic px-1.5 py-0.5">
                -30%
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
                "text-[9px] uppercase tracking-widest font-medium text-center leading-tight text-stone-600",
                item.id === "b2b" && "text-blue-900 font-bold"
              )}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
    );
  }

  // === RENDER CHO DESKTOP (Vertical List - Editorial Style) ===
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
            Menu
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-5 rounded-sm px-5 py-5 transition-all duration-500 ease-out",
                // Hover effect: Dịch chuyển nhẹ sang phải (Slide)
                "hover:pl-7",
                item.bg,
                compact && "px-4 py-3"
              )}
            >
              {/* Icon - Stroke siêu mỏng (1.2) = Luxury */}
              <div
                className={cn(
                  "flex items-center justify-center transition-transform duration-500 group-hover:scale-105",
                  item.iconColor
                )}
              >
                <item.icon size={24} strokeWidth={1.2} />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  {/* Font Serif cho tiêu đề -> Cảm giác tạp chí */}
                  <span className="text-lg font-serif font-medium text-stone-900 tracking-tight group-hover:text-black transition-colors">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 border uppercase tracking-widest leading-none",
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {/* Font Mono cho phụ đề -> Cảm giác kỹ thuật/chính xác */}
                <div className="text-xs font-mono text-stone-400 mt-1 uppercase tracking-wider group-hover:text-stone-600 transition-colors">
                  {item.sublabel}
                </div>
              </div>

              {/* Arrow Mảnh */}
              <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-stone-800">
                <ChevronRight size={16} strokeWidth={1.5} />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
