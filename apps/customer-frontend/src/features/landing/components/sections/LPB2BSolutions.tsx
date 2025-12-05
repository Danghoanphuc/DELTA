import { useState } from "react";
import {
  Gift,
  Calendar,
  PartyPopper,
  Trophy,
  Leaf,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

// Mock Data - Cần thay thế bằng API từ backend hoặc Sanity CMS
const CATEGORIES = [
  { id: "intro", label: "Giới thiệu chung", icon: Info },
  { id: "client", label: "Quà tặng Khách hàng", icon: Gift },
  { id: "event", label: "Sự kiện Doanh nghiệp", icon: Calendar },
  { id: "birthday", label: "Sinh nhật & Nhân sự", icon: PartyPopper },
  { id: "anniversary", label: "Kỷ niệm & Tri ân", icon: Trophy },
  { id: "eco", label: "Sống xanh (Eco)", icon: Leaf },
];

const SOLUTIONS_DATA: Record<
  string,
  Array<{
    title: string;
    client: string;
    image: string;
    desc: string;
  }>
> = {
  intro: [
    {
      title: "Think It Kit",
      client: "Notion",
      image:
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      desc: "Bộ Kit Canvas tối giản, định hình phong cách làm việc hiện đại.",
    },
    {
      title: "Eco-Luxe Bottle",
      client: "Spotify",
      image:
        "https://images.unsplash.com/photo-1602143407151-11115cd4e69b?auto=format&fit=crop&q=80&w=800",
      desc: "Bình giữ nhiệt vỏ tre khắc laser, cam kết bền vững.",
    },
    {
      title: "Tech Backpack",
      client: "VNG",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      desc: "Balo chống sốc cao cấp, đồng hành cùng Developer.",
    },
  ],
  client: [
    // Placeholder data for client logic
    {
      title: "VIP Welcome Box",
      client: "Techcombank",
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800",
      desc: "Hộp quà sơn mài cao cấp dành cho khách hàng Private Banking.",
    },
    {
      title: "Signature Pen",
      client: "MB Bank",
      image:
        "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800",
      desc: "Bút ký kim loại khắc tên riêng, khẳng định vị thế.",
    },
    {
      title: "Leather Folio",
      client: "VinFast",
      image:
        "https://images.unsplash.com/photo-1606293926075-69a00febfbd2?auto=format&fit=crop&q=80&w=800",
      desc: "Bìa da đựng tài liệu thủ công, tinh tế từng đường kim mũi chỉ.",
    },
  ],
  // Các case khác sẽ map tương tự, fallback về mảng rỗng nếu chưa có data
};

export function LPB2BSolutions() {
  const [activeTab, setActiveTab] = useState("intro");

  // Fallback data nếu tab chưa có nội dung
  const activeItems = SOLUTIONS_DATA[activeTab] || SOLUTIONS_DATA["intro"];

  return (
    <section className="py-24 bg-white text-[#1a1a1a]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* 1. Header: Soft Magazine Style */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-[#999] uppercase mb-4">
            Printz Case Study
          </p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
            Giải pháp Quà tặng & Ấn phẩm <br className="hidden md:block" />
            <span className="italic text-[#BA2525]">
              cho mọi điểm chạm thương hiệu.
            </span>
          </h2>
          <p className="text-[#666] text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Từ quà tặng khách hàng cao cấp đến bộ kit chào đón nhân sự. Hãy chọn
            một danh mục để xem cách chúng tôi hiện thực hóa ý tưởng.
          </p>
        </div>

        {/* 2. Tabs Navigation (Pills) - Mô phỏng ảnh SwagUp */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-20">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "group flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-bold tracking-wide uppercase transition-all duration-300",
                  isActive
                    ? "border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]"
                    : "border-[#e5e5e5] bg-white text-[#999] hover:border-[#BA2525] hover:text-[#BA2525]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-[#BA2525]" : "text-current"
                  )}
                />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3. Grid Showcase */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {activeItems.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col h-full cursor-pointer"
            >
              {/* Image Card */}
              <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F0] aspect-[4/5] mb-6 border border-[#e5e5e5]">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Client Badge - Top Left */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm border border-black/5">
                    {item.client}
                  </span>
                </div>

                {/* CTA Overlay - Bottom Right */}
                <div className="absolute bottom-4 right-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-[#BA2525] text-white p-3 rounded-full shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Content Info */}
              <div className="flex flex-col flex-grow">
                <h3 className="font-serif text-2xl text-[#1a1a1a] mb-2 group-hover:text-[#BA2525] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Footer CTA */}
        <div className="mt-20 text-center border-t border-[#1a1a1a]/10 pt-12">
          <p className="text-[#1a1a1a] text-lg font-medium mb-6">
            Bạn chưa tìm thấy ý tưởng phù hợp?
          </p>
          <Button
            variant="outline"
            className="h-12 px-8 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white font-bold tracking-widest uppercase transition-all"
          >
            Tư vấn giải pháp riêng (1:1)
          </Button>
        </div>
      </div>
    </section>
  );
}
