// apps/customer-frontend/src/features/chat/components/BusinessComboGrid.tsx

import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const combos = [
  {
    title: "Gói Khởi Nghiệp",
    image:
      "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=800&auto=format&fit=crop",
    href: "/shop?collection=startup",
    tag: "Cơ bản",
    price: "Từ 5.000.000₫",
  },
  {
    title: "Ngành F&B",
    image:
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800&auto=format&fit=crop",
    href: "/shop?collection=fnb",
    tag: "Bán chạy",
    price: "Thiết kế riêng",
  },
  {
    title: "Sự Kiện & Hội Nghị",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    href: "/shop?collection=event",
    tag: "Mùa lễ hội",
    price: "Ưu đãi -20%",
  },
  {
    title: "Quà Tặng Cao Cấp",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    href: "/shop?collection=gift",
    tag: "Giới hạn",
    price: "Premium",
  },
];

export const BusinessComboGrid = ({ className }: { className?: string }) => {
  return (
    <div className={cn("w-full py-8", className)}>
      <div className="mb-6 px-4 md:px-0">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Giải pháp Ngành hàng
        </h3>
      </div>

      {/* Grid Layout thay vì Scroll ngang */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
        {combos.map((item, idx) => (
          <a key={idx} href={item.href} className="group flex flex-col gap-3">
            {/* 1. Phần Ảnh: Sạch sẽ, bo góc mềm */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Badge nhỏ gọn góc trên */}
              <div className="absolute top-3 left-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border",
                    item.tag === "Bán chạy"
                      ? "bg-amber-400 text-white border-amber-300"
                      : "bg-white/90 text-stone-600 border-white"
                  )}
                >
                  {item.tag}
                </span>
              </div>

              {/* Nút Action ảo (chỉ hiện khi hover) */}
              <div className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <ArrowRight size={14} className="text-primary" />
              </div>
            </div>

            {/* 2. Phần Text: Đưa ra ngoài cho thoáng */}
            <div className="space-y-0.5">
              <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="font-sans text-xs font-medium text-stone-400">
                {item.price}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
