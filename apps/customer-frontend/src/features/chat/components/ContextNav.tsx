import { Wand2, Building2, Timer, CalendarDays, ChevronRight, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

// 🧠 PSYCHOLOGY-DRIVEN CONFIG (UPDATED: CLEAN VERSION)
const items = [
  {
    id: "studio",
    label: "AI Studio",
    sublabel: "Thiết kế chỉ 1 cú click", // Ease of use (Dễ dàng)
    icon: Wand2,
    href: "/design-editor",
    // Chuyển về style chuẩn: Nền trắng, hover nhẹ nhàng
    bg: "bg-white hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200",
    iconBg: "bg-indigo-100 text-indigo-600",
    badge: "AI BETA", 
    badgeColor: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  },
  {
    id: "fast",
    label: "Printz",
    sublabel: "In ngay, lấy gấp trong ngày ", // Scarcity (Sợ bỏ lỡ)
    icon: Timer,
    href: "/rush", // ✅ CẬP NHẬT: Trỏ thẳng sang trang Rush Page
    bg: "bg-white hover:bg-orange-50 border border-gray-100 hover:border-orange-200",
    iconBg: "bg-orange-100 text-orange-600",
    badge: "Express",
    badgeColor: "bg-red-100 text-red-600 border border-red-200 animate-pulse", // Giữ pulse nhẹ ở badge để báo khẩn cấp
  },
  {
    id: "b2b",
    label: "Printz B2B",
    sublabel: "Chiết khấu đến 30%", // Incentive (Lợi ích)
    icon: Building2,
    href: "/contact",
    bg: "bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200",
    iconBg: "bg-blue-100 text-blue-600",
    badge: "PRO",
    badgeColor: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  {
    id: "event",
    label: "Theo Sự Kiện",
    sublabel: "Xu hướng mới nhất", // Discovery (Khám phá)
    icon: CalendarDays,
    href: "/inspiration",
    bg: "bg-white hover:bg-pink-50 border border-gray-100 hover:border-pink-200",
    iconBg: "bg-pink-100 text-pink-600",
    badge: null,
    badgeColor: "",
  }
];

interface ContextNavProps {
  className?: string;
  compact?: boolean;
}

export const ContextNav = ({ className = "", compact = false }: ContextNavProps) => {
  return (
    <Card className={cn("border-none shadow-none bg-transparent h-full", className)}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 mb-3 px-1">
            <LayoutGrid size={14} className="text-gray-400" />
            <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">
                Hệ sinh thái Printz
            </h3>
        </div>

        <div className="space-y-3">
            {items.map((item) => (
            <a
                key={item.id}
                href={item.href}
                className={cn(
                "group relative flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 shadow-sm hover:shadow-md",
                item.bg,
                compact && "px-3 py-2.5"
                )}
            >
                {/* Icon Container */}
                <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105",
                item.iconBg
                )}>
                    {item.id === 'fast' ? (
                        <div className="relative">
                             <item.icon size={22} strokeWidth={2} />
                             {/* Chấm đỏ thông báo khẩn cấp */}
                             <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        </div>
                    ) : (
                        <item.icon size={22} strokeWidth={2} />
                    )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-black transition-colors">
                            {item.label}
                        </span>
                        
                        {item.badge && (
                        <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] leading-none tracking-wide",
                            item.badgeColor
                        )}>
                            {item.badge}
                        </span>
                        )}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5 group-hover:text-slate-600 transition-colors">
                        {item.sublabel}
                    </div>
                </div>

                {/* Arrow Navigation */}
                <ChevronRight 
                    size={18} 
                    className="text-gray-300 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-gray-500" 
                />
            </a>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};