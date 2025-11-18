// features/chat/components/ContextNav.tsx (TÁI CẤU TRÚC)
import { Wand2, Building2, Timer, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

const items = [
  {
    label: "Printz Studio",
    sublabel: "Thiết kế online tức thì",
    icon: Wand2,
    href: "/design-editor",
  },
  {
    label: "Printz B2B",
    sublabel: "Giải pháp cho doanh nghiệp",
    icon: Building2,
    href: "/contact",
  },
  {
    label: "In gấp 24h",
    sublabel: "Ưu tiên giao nhanh",
    icon: Timer,
    href: "/shop?fast=1",
  },
  {
    label: "Theo sự kiện",
    sublabel: "Gợi ý theo mùa lễ",
    icon: CalendarDays,
    href: "/inspiration",
  },
];

interface ContextNavProps {
  className?: string;
  compact?: boolean;
}

export const ContextNav = ({ className = "", compact = false }: ContextNavProps) => {
  return (
    <Card
      className={cn(
        "bg-white/90 border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)] h-full",
        !compact && "min-h-[360px]",
        className
      )}
    >
      <CardContent className="p-4 space-y-3">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-left hover:border-blue-200 hover:bg-blue-50/40 transition duration-200",
              compact && "px-3 py-2.5"
            )}
          >
            <span className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-[0_10px_20px_rgba(59,130,246,0.25)]">
              <item.icon size={18} />
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {item.label}
              </div>
              <div className="text-xs text-slate-500">{item.sublabel}</div>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
};