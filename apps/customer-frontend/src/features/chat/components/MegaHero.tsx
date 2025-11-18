// features/chat/components/MegaHero.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const slides = [
  {
    eyebrow: "All-in-one Platform",
    title: "Ngành in ấn, gói trọn trong 1 chiếc app",
    bullets: [
      "Cá nhân hóa thiết kế với AI Zin",
      "Đặt in trong 60 giây, giao nhanh 24h",
      "Theo dõi trạng thái sản xuất minh bạch",
    ],
    primaryCta: { label: "Khám phá ngay", href: "/app" },
    secondaryCta: { label: "Xem bảng giá", href: "/shop" },
  },
  {
    eyebrow: "Printz Studio",
    title: "Thiết kế 3D tức thì cho mọi chiến dịch",
    bullets: [
      "Hơn 2.000 mẫu thiết kế gợi ý",
      "Preview thật trên bao bì, áo, túi",
      "Chia sẻ và duyệt mẫu online",
    ],
    primaryCta: { label: "Mở Studio AI", href: "/design-editor" },
    secondaryCta: { label: "Kho ý tưởng mới", href: "/inspiration" },
  },
  {
    eyebrow: "Printz B2B",
    title: "Kết nối 180+ nhà in Việt Nam",
    bullets: [
      "Tự động chọn nhà in gần nhất",
      "Quản lý công việc và báo giá tập trung",
      "Ưu tiên kỹ thuật – đảm bảo SLA",
    ],
    primaryCta: { label: "Đặt lịch tư vấn", href: "/contact" },
    secondaryCta: { label: "Xem câu chuyện khách hàng", href: "/policy" },
  },
];

export const MegaHero = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);
  const current = slides[index];

  return (
    <section className="px-3 sm:px-6 lg:px-0">
      <div className="max-w-7xl mx-auto">
        <Card className="border-none shadow-xl bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#2563eb] text-white rounded-[32px] overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Left column */}
              <div className="flex-1 px-6 py-8 sm:px-10 sm:py-12 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-[0.3em]">
                  <Sparkles size={14} />
                  <span>{current.eyebrow}</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                    {current.title}
                  </h1>
                  <ul className="space-y-3">
                    {current.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-base sm:text-lg text-white/90"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-[#0f172a] hover:bg-white/90"
                    asChild
                  >
                    <a href={current.primaryCta.href}>
                      {current.primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    asChild
                  >
                    <a href={current.secondaryCta.href}>
                      {current.secondaryCta.label}
                    </a>
                  </Button>
                </div>
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <span
                      key={`dot-${i}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === index ? "w-12 bg-white" : "w-6 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="lg:w-[380px] w-full bg-white text-slate-900">
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.3em]">
                      Kịch bản gợi ý
                    </p>
                    <h3 className="text-2xl font-bold">
                      Từ ý tưởng đến giao hàng chỉ trong 3 bước
                    </h3>
                    <ol className="space-y-3 text-sm text-slate-600">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          1
                        </span>
                        Nhập yêu cầu hoặc chọn mẫu có sẵn, Zin AI tinh chỉnh bố
                        cục, màu sắc theo brand kit.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          2
                        </span>
                        Printz chọn nhà in tối ưu về vị trí, vật liệu và SLA;
                        bạn duyệt mẫu online trong vài phút.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          3
                        </span>
                        Theo dõi tiến độ sản xuất, giao hàng realtime, dễ dàng
                        đặt lại hoặc mở rộng chiến dịch.
                      </li>
                    </ol>
                  </div>
                  <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                          Zin AI có thể làm gì?
                        </p>
                        <h4 className="text-lg font-semibold">
                          “Zin, giúp mình bộ hộp quà Tết premium”
                        </h4>
                      </div>
                      <Sparkles className="h-6 w-6 text-yellow-300" />
                    </div>
                    <p className="text-sm text-white/80">
                      Chúng tôi đề xuất 3 concept, báo giá tức thì và đảm nhận
                      khâu giao hàng đến từng cửa hàng nhượng quyền.
                    </p>
                    <Button className="w-full bg-white text-slate-900 hover:bg-white/90">
                      Dùng thử Zin ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};