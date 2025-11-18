// features/chat/components/ContextNav.tsx (CẬP NHẬT)
import { Button } from "@/shared/components/ui/button";
import {
  Wand2,
  Building2,
  Timer,
  CalendarDays,
  Images,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card"; // ✅ Thêm Card
import { cn } from "@/shared/lib/utils"; // ✅ Thêm cn

const items = [
  { label: "Printz Studio", icon: Wand2, href: "/design-editor" },
  { label: "Printz B2B", icon: Building2, href: "/contact" },
  { label: "In gấp 24h", icon: Timer, href: "/shop?fast=1" },
  { label: "Theo sự kiện", icon: CalendarDays, href: "/inspiration" },
  { label: "Kho mẫu", icon: Images, href: "/inspiration" },
  { label: "Deal rẻ hôm nay", icon: Tag, href: "/shop?deal=today" },
];

export const ContextNav = () => {
  return (
    // ❌ Xóa: max-w-7xl mx-auto px-4 md:px-6 mt-4 (Vì component cha đã có)
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((it) => (
          // ✅ THAY THẾ: Dùng Card thay vì Button
          <a href={it.href} key={it.label} className="group">
            <Card
              className={cn(
                "hover:bg-blue-50 hover:border-blue-300 transition-all",
                "border-gray-200 shadow-sm"
              )}
            >
              <CardContent
                className="flex flex-col items-center justify-center p-4 h-20" // ✅ Tăng chiều cao
              >
                <it.icon
                  size={20}
                  className="text-blue-600 mb-1.5 flex-shrink-0"
                />
                <span className="text-xs font-medium text-center text-gray-700 group-hover:text-blue-700">
                  {it.label}
                </span>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};