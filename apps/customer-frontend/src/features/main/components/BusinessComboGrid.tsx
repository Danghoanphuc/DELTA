// apps/customer-frontend/src/features/chat/components/BusinessComboGrid.tsx

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Dữ liệu mới: Dựa trên Mục đích tặng quà
const combos = [
  {
    title: "Khai Trương & Tân Gia",
    image:
      "https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?q=80&w=800&auto=format&fit=crop", // Bình hoa/Decor
    href: "/shop?collection=grand-opening",
    tag: "Phong Thủy",
    price: "Bình Hút Lộc",
  },
  {
    title: "Tri Ân Đối Tác VIP",
    image:
      "https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?q=80&w=800&auto=format&fit=crop", // Trà/Sách
    href: "/shop?collection=vip-partner",
    tag: "Bán chạy",
    price: "Trầm & Trà",
  },
  {
    title: "Sự Kiện Cuối Năm",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=800&auto=format&fit=crop", // Hộp quà đỏ
    href: "/shop?collection=year-end",
    tag: "Số lượng lớn",
    price: "Set Quà Tết",
  },
  {
    title: "Quà Tặng Sếp Nam",
    image:
      "https://images.unsplash.com/photo-1550920404-7a33dc4b9b77?q=80&w=800&auto=format&fit=crop", // Bút/Sổ da
    href: "/shop?collection=for-him",
    tag: "Đẳng cấp",
    price: "Sơn Mài & Gỗ",
  },
];

export const BusinessComboGrid = ({ className }: { className?: string }) => {
  return (
    <div className={cn("w-full py-8", className)}>
      {/* Header nhỏ */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="font-serif text-2xl font-bold text-stone-900 italic">
          Gợi ý theo Mục đích
        </h3>
        <a
          href="/shop"
          className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-stone-900 transition-colors flex items-center gap-1"
        >
          Xem tất cả <ArrowRight size={12} />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-0">
        {combos.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            className="group flex flex-col gap-4 cursor-pointer"
          >
            {/* 1. Phần Ảnh */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-xl border border-stone-100">
              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors z-10 duration-500" />

              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
              />

              {/* Tag - Style minimal */}
              <div className="absolute top-0 left-0 z-20">
                <span
                  className={cn(
                    "block px-3 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md",
                    "bg-white/90 text-stone-900 border-r border-b border-white"
                  )}
                >
                  {item.tag}
                </span>
              </div>
            </div>

            {/* 2. Phần Text */}
            <div className="space-y-1 text-center group-hover:-translate-y-1 transition-transform duration-500">
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                {item.title}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                {item.price}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
