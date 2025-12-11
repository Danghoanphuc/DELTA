import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Package,
  Gift,
  Warehouse,
  Paintbrush,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Services Data
const SERVICES = [
  {
    id: "kitting",
    icon: Package,
    title: "Đóng gói trải nghiệm",
    tagline: "Kitting & Fulfillment",
    description:
      "Combo quà tặng khách hàng/ nhân viên mới (Sổ, bút, bình, áo...).",
    longDesc:
      "Upload file Excel danh sách → Printz đóng gói từng bộ quà → Ship đến tận tay từng người.",
    benefits: [
      "Đóng gói chuyên nghiệp",
      "Cá nhân hóa từng người (in tên riêng)",
      "Trải nghiệm unboxing ấn tượng",
      "Giao hàng đúng hẹn",
    ],
    useCases: [
      "Bộ quà chào mừng nhân viên mới",
      "Quà tặng sự kiện, hội nghị",
      "Quà tri ân khách hàng VIP",
      "Bộ quà Tết cho nhân viên",
    ],
    image:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80",
    href: "/solutions/kitting",
    color: "emerald",
  },
  {
    id: "corporate-gifting",
    icon: Gift,
    title: "Quà tặng Doanh nghiệp",
    tagline: "Corporate Gifting Program",
    description:
      "Giải pháp quà tặng trọn gói cho mọi dịp: Tết, sinh nhật, tri ân.",
    longDesc:
      "Một nền tảng cho mọi dịp tặng quà. Catalog có sẵn hoặc tùy chỉnh. Giải pháp trọn gói từ A-Z.",
    benefits: [
      "Tăng sự gắn kết nhân viên",
      "Xây dựng thương hiệu",
      "Tiết kiệm thời gian",
      "Quản lý tập trung",
    ],
    useCases: [
      "Tết Nguyên Đán: Bao lì xì, Lịch tết",
      "Sinh nhật công ty: Áo kỷ niệm, Sổ tay",
      "Tri ân khách hàng: Hộp quà VIP",
      "Chào mừng nhân viên: Welcome Kit",
    ],
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    href: "/solutions/corporate-gifting",
    color: "rose",
  },
  {
    id: "warehousing",
    icon: Warehouse,
    title: "Lưu kho & Phân phối",
    tagline: "Warehousing & Distribution",
    description: "In số lượng lớn giá rẻ → Gửi Printz giữ hộ → Cần là giao.",
    longDesc:
      "In số lượng lớn để được giá tốt → Printz giữ hộ miễn phí tại nhà máy → Ship theo nhu cầu, không lo tồn kho.",
    benefits: [
      "Giảm 40% chi phí lưu kho",
      "Ship trong 24h",
      "Bảo quản chuẩn ISO",
      "Theo dõi tồn kho realtime",
    ],
    useCases: [
      "Công ty có nhiều chi nhánh",
      "Doanh nghiệp in số lượng lớn",
      "Startup không có kho riêng",
      "Giao hàng linh hoạt theo nhu cầu",
    ],
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    href: "/solutions/warehousing",
    color: "blue",
  },
  {
    id: "design",
    icon: Paintbrush,
    title: "Thiết kế & Dựng mẫu",
    tagline: "Design & Prototyping",
    description: "Team thiết kế chuyên nghiệp hỗ trợ làm file in chuẩn.",
    longDesc:
      "Đội ngũ designer chuyên nghiệp giúp bạn thiết kế file in chuẩn, dựng mẫu 3D, và tư vấn vật liệu phù hợp.",
    benefits: [
      "File in chuẩn kỹ thuật",
      "Dựng mẫu 3D trước khi in",
      "Tư vấn vật liệu phù hợp",
      "Revision không giới hạn",
    ],
    useCases: [
      "Thiết kế bao bì sản phẩm",
      "Thiết kế catalogue, brochure",
      "Thiết kế standee, backdrop",
      "Thiết kế quà tặng độc đáo",
    ],
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    href: "/contact",
    color: "purple",
  },
];

const STATS = [
  { value: "500+", label: "Doanh nghiệp tin dùng" },
  { value: "50K+", label: "Bộ quà đã giao" },
  { value: "98%", label: "Khách hàng hài lòng" },
  { value: "24h", label: "Thời gian xử lý" },
];

export function ServicesPage() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white will-change-scroll">
      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-stone-50 to-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Dịch vụ & Giải pháp
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 italic leading-tight">
            Giải pháp trọn gói
            <br />
            <span className="text-emerald-800">cho doanh nghiệp.</span>
          </h1>

          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Từ đóng gói quà tặng, lưu kho phân phối, đến thiết kế chuyên nghiệp.
            Printz đồng hành cùng bạn từ A đến Z.
          </p>

          <Button
            onClick={() => navigate("/contact")}
            className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-10 py-6 font-bold uppercase text-sm"
          >
            Liên hệ tư vấn miễn phí
          </Button>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-5xl text-emerald-800 mb-2 italic">
                  {stat.value}
                </div>
                <div className="text-sm text-stone-600 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-stone-900 italic mb-4">
              Dịch vụ của chúng tôi
            </h2>
            <p className="text-stone-600 text-lg">
              Giải pháp toàn diện cho mọi nhu cầu in ấn và quà tặng
            </p>
          </div>

          <div className="space-y-8">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={service.id}
                  className={cn(
                    "group bg-white border-2 border-stone-200 hover:border-emerald-800 transition-all overflow-hidden",
                    "grid md:grid-cols-2 gap-0"
                  )}
                >
                  {/* Image */}
                  <div
                    className={cn(
                      "relative h-80 md:h-auto overflow-hidden",
                      !isEven && "md:order-2"
                    )}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-10 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-stone-100 group-hover:bg-emerald-900 flex items-center justify-center transition-colors">
                        <Icon
                          className="w-7 h-7 text-stone-600 group-hover:text-white transition-colors"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                          {service.tagline}
                        </div>
                        <h3 className="font-serif text-3xl text-stone-900 italic">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-stone-600 text-lg mb-6 leading-relaxed">
                      {service.longDesc}
                    </p>

                    {/* Benefits */}
                    <div className="mb-8">
                      <h4 className="font-bold text-stone-900 mb-3 uppercase text-xs tracking-wider">
                        Lợi ích
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-start gap-2 text-sm text-stone-600"
                          >
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0"
                              strokeWidth={2}
                            />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Use Cases */}
                    <div className="mb-8">
                      <h4 className="font-bold text-stone-900 mb-3 uppercase text-xs tracking-wider">
                        Phù hợp cho
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.useCases.slice(0, 3).map((useCase) => (
                          <span
                            key={useCase}
                            className="px-3 py-1 bg-stone-100 text-stone-700 text-xs"
                          >
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(service.href)}
                      className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-6 py-5 font-bold uppercase text-xs w-fit group-hover:translate-x-1 transition-transform"
                    >
                      Tìm hiểu thêm
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl italic mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-stone-300 mb-10 leading-relaxed">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn giải pháp phù hợp
            nhất cho doanh nghiệp của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white hover:bg-stone-100 text-stone-900 rounded-none px-8 py-6 font-bold uppercase text-sm"
            >
              Liên hệ ngay
            </Button>
            <Button
              onClick={() => navigate("/shop")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-stone-900 rounded-none px-8 py-6 font-bold uppercase text-sm"
            >
              Xem sản phẩm
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

export default ServicesPage;
