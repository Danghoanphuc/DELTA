import { useState } from "react";
import {
  Gift,
  Calendar,
  PartyPopper,
  Trophy,
  Leaf,
  ArrowRight,
  Info,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import { SampleRequestModal } from "../SampleRequestModal";

// Hero Component
export function LPHero() {
  const navigate = useNavigate();
  const [showSampleModal, setShowSampleModal] = useState(false);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-emerald-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 py-20 text-center">
        {/* Main Heading */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-900 mb-8 leading-tight">
          Xây dựng thương hiệu
          <br />
          <span className="italic text-emerald-700">qua từng điểm chạm.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
          Từ thiết kế đến sản xuất, từ kho vận đến giao hàng.
          <br className="hidden md:block" />
          Printz đồng hành cùng doanh nghiệp hiện thực hóa ý tưởng thương hiệu.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/shop")}
            className="h-14 px-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-medium text-base shadow-lg hover:shadow-xl transition-all"
          >
            Khám phá sản phẩm
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={() => setShowSampleModal(true)}
            variant="outline"
            className="h-14 px-8 border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white rounded-full font-medium text-base transition-all"
          >
            Nhận mẫu thử miễn phí
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>500+ Doanh nghiệp tin dùng</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>10,000+ Đơn hàng hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
            <span>Giao hàng toàn quốc</span>
          </div>
        </div>
      </div>

      <SampleRequestModal
        open={showSampleModal}
        onOpenChange={setShowSampleModal}
      />
    </section>
  );
}

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
};

export function LPB2BSolutions() {
  const [activeTab, setActiveTab] = useState("intro");
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const activeItems = SOLUTIONS_DATA[activeTab] || SOLUTIONS_DATA["intro"];

  return (
    <section className="py-24 bg-white text-[#1a1a1a]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
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

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {activeItems.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col h-full cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#F5F5F0] aspect-[4/5] mb-6 border border-[#e5e5e5]">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10" />
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm border border-black/5">
                    {item.client}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-[#BA2525] text-white p-3 rounded-full shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

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

        <div className="mt-20 text-center border-t border-[#1a1a1a]/10 pt-12">
          <p className="text-[#1a1a1a] text-lg font-medium mb-6">
            Bạn chưa tìm thấy ý tưởng phù hợp?
          </p>
          <Button
            onClick={() => setShowConsultationModal(true)}
            variant="outline"
            className="h-12 px-8 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white font-bold tracking-widest uppercase transition-all"
          >
            Tư vấn giải pháp riêng (1:1)
          </Button>
        </div>
      </div>

      <SampleRequestModal
        open={showConsultationModal}
        onOpenChange={setShowConsultationModal}
        title="Tư vấn giải pháp riêng biệt"
        subtitle="Chúng tôi sẽ tư vấn 1:1 để tìm giải pháp phù hợp nhất cho doanh nghiệp của bạn"
        message="Yêu cầu tư vấn giải pháp riêng (1:1) từ Landing Page"
        buttonText="Đặt lịch tư vấn"
        icon={<MessageCircle className="w-10 h-10 text-white" />}
      />
    </section>
  );
}
