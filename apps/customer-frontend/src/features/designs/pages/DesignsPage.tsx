import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Search,
  Gift,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Package,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Gift Collections Data
const GIFT_COLLECTIONS = [
  {
    id: "welcome-kit",
    title: "Bộ chào mừng nhân viên mới",
    description: "Sổ tay in logo, Bút ký cao cấp, Áo đồng phục, Bình giữ nhiệt",
    price: "Từ 500.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    items: ["Sổ tay", "Bút ký", "Áo polo", "Bình nước"],
    popular: true,
  },
  {
    id: "event-kit",
    title: "Bộ quà tặng Sự kiện",
    description:
      "Dây đeo thẻ in logo, Sticker thương hiệu, Bình nước, Túi tote",
    price: "Từ 300.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    items: ["Dây đeo thẻ", "Sticker", "Bình nước", "Túi tote"],
    popular: true,
  },
  {
    id: "client-appreciation",
    title: "Bộ quà tri ân khách hàng",
    description: "Hộp quà cao cấp, Lịch để bàn, Sổ tay da, Bút ký kim loại",
    price: "Từ 800.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80",
    items: ["Hộp quà", "Lịch", "Sổ da", "Bút kim loại"],
    popular: false,
  },
  {
    id: "tet-gift",
    title: "Bộ quà Tết doanh nghiệp",
    description: "Lịch tết, Bao lì xì in logo, Hộp quà tết, Thiệp chúc mừng",
    price: "Từ 600.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80",
    items: ["Lịch tết", "Bao lì xì", "Hộp quà", "Thiệp"],
    popular: false,
  },
];

const GIFT_CATEGORIES = [
  {
    icon: Users,
    title: "Quà nhân viên",
    desc: "Chào mừng, sinh nhật, kỷ niệm",
    href: "/shop?category=corporate-gifts&useCase=employee-gift",
  },
  {
    icon: Sparkles,
    title: "Quà khách hàng",
    desc: "Tri ân, VIP, dịp lễ",
    href: "/shop?category=corporate-gifts&useCase=customer-gift",
  },
  {
    icon: Calendar,
    title: "Quà sự kiện",
    desc: "Hội nghị, triển lãm, workshop",
    href: "/shop?category=corporate-gifts&useCase=event-giveaway",
  },
  {
    icon: Package,
    title: "Quà tùy chỉnh",
    desc: "Thiết kế riêng theo yêu cầu",
    href: "/contact",
  },
];

export function DesignsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-white will-change-scroll">
      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-stone-50 to-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
            <Gift className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Quà tặng Doanh nghiệp
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 italic leading-tight">
            Quà tặng không còn là
            <br />
            <span className="text-emerald-800">đau đầu.</span>
          </h1>

          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Bộ quà sẵn có hoặc tùy chỉnh theo nhu cầu. Từ 100 bộ trở lên, giao
            hàng toàn quốc trong 5-7 ngày.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-3"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Tìm quà tặng... (VD: bình giữ nhiệt, sổ tay, áo đồng phục)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-none border-2 border-stone-200 focus:border-emerald-800 text-base"
              />
            </div>
            <Button
              type="submit"
              className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-8 h-14 font-bold uppercase text-sm"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>
      </section>

      {/* GIFT CATEGORIES */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-stone-900 italic mb-4">
              Dịp tặng quà
            </h2>
            <p className="text-stone-600 text-lg">Chọn theo mục đích sử dụng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GIFT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.title}
                  onClick={() => navigate(cat.href)}
                  className="group p-8 border-2 border-stone-200 hover:border-emerald-800 transition-all text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-stone-100 group-hover:bg-emerald-900 flex items-center justify-center mb-6 transition-colors">
                    <Icon
                      className="w-7 h-7 text-stone-600 group-hover:text-white transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CURATED COLLECTIONS */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-stone-900 italic mb-4">
              Bộ quà được yêu thích
            </h2>
            <p className="text-stone-600 text-lg">
              Combo sẵn có, giao ngay trong 5-7 ngày
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {GIFT_COLLECTIONS.map((collection) => (
              <div
                key={collection.id}
                className="group bg-white border-2 border-stone-200 hover:border-emerald-800 transition-all overflow-hidden"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {collection.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-800 text-white text-xs font-bold uppercase">
                      Phổ biến
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <h3 className="font-serif text-2xl text-stone-900 mb-3 italic">
                    {collection.title}
                  </h3>
                  <p className="text-stone-600 mb-4 leading-relaxed">
                    {collection.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {collection.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-emerald-800">
                      {collection.price}
                    </span>
                    <Button
                      onClick={() => navigate("/contact")}
                      className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-6 py-5 font-bold uppercase text-xs group-hover:translate-x-1 transition-transform"
                    >
                      Liên hệ báo giá
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl italic mb-6">
            Cần tư vấn quà tặng?
          </h2>
          <p className="text-xl text-stone-300 mb-10 leading-relaxed">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn chọn quà phù
            hợp với ngân sách và mục đích.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white hover:bg-stone-100 text-stone-900 rounded-none px-8 py-6 font-bold uppercase text-sm"
            >
              Liên hệ tư vấn
            </Button>
            <Button
              onClick={() => navigate("/shop?category=corporate-gifts")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-stone-900 rounded-none px-8 py-6 font-bold uppercase text-sm"
            >
              Xem tất cả quà tặng
            </Button>
          </div>
        </div>
      </section>

      {/* Scroll To Top */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-lg bg-stone-900 text-white hover:bg-emerald-900 transition-all duration-300 z-40",
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        )}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={20} />
      </Button>
    </div>
  );
}

export default DesignsPage;
