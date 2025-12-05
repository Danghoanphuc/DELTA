import { Header, Footer } from "@/features/landing/components";
import { LPSocialProof } from "@/features/landing/components/sections/LPSocialProof";
import { Button } from "@/shared/components/ui/button";
import {
  Check,
  Gift,
  MousePointerClick,
  UserCheck,
  Truck,
  Sparkles,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CorporateGiftingPage() {
  const navigate = useNavigate();

  // FLOW "REDEEM LINK" ĐƯỢC VIỆT HÓA
  const steps = [
    {
      icon: Gift,
      number: "01",
      title: "Bạn chọn 'Combo'",
      desc: "Thay vì đoán mò, bạn tạo một danh sách quà (Ví dụ: Áo + Sổ + Bình nước).",
    },
    {
      icon: Send,
      number: "02",
      title: "Gửi 'Đường Dẫn Thần Kỳ'",
      desc: "Gửi 1 đường link cho toàn công ty. Không cần hỏi địa chỉ, không cần thu thập size áo từng người.",
    },
    {
      icon: UserCheck,
      number: "03",
      title: "Người nhận tự điền",
      desc: "Nhân viên click link -> Tự chọn màu/size -> Tự điền địa chỉ nhận. Printz lo phần còn lại.",
    },
  ];

  // LỢI ÍCH TẬP TRUNG VÀO NỖI ĐAU "EXCEL" CỦA HR
  const benefits = [
    {
      icon: MousePointerClick,
      title: "Tạm biệt file Excel",
      desc: "Không còn cảnh copy-paste 500 dòng địa chỉ và số điện thoại thủ công dễ sai sót.",
    },
    {
      icon: Sparkles,
      title: "Vừa vặn tuyệt đối",
      desc: "Người nhận tự chọn size áo và màu sắc họ thích. Không còn cảnh tặng áo size L cho người size S.",
    },
    {
      icon: Truck,
      title: "Bảo mật riêng tư",
      desc: "Nhân viên không cần công khai địa chỉ nhà riêng cho HR. Họ tự nhập trực tiếp vào hệ thống bảo mật.",
    },
  ];

  const occasions = [
    {
      title: "Tết & Lễ Hội",
      items: [
        "Hộp quà Tết sum vầy",
        "Lịch để bàn độc quyền",
        "Bao lì xì in nhũ vàng",
      ],
    },
    {
      title: "Onboarding (Nhân viên mới)",
      items: [
        "Welcome Kit (Sổ, Bút, Áo)",
        "Cốc sứ in tên riêng",
        "Thẻ nhân viên cao cấp",
      ],
    },
    {
      title: "Tri ân Khách hàng/Đối tác",
      items: [
        "Set quà VIP Doanh nhân",
        "Bút ký kim loại khắc tên",
        "Sạc dự phòng in logo",
      ],
    },
    {
      title: "Sự kiện & Hội nghị",
      items: [
        "Túi vải Canvas (Tote bag)",
        "Dây đeo thẻ sự kiện",
        "Quà lưu niệm gọn nhẹ",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      <Header />

      {/* HERO - EMOTIONAL HOOK */}
      <section className="pt-40 pb-20 px-6 text-center bg-gradient-to-b from-blue-50 to-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Gift className="w-4 h-4 text-blue-800" />
            <span className="text-sm font-bold text-blue-800 uppercase tracking-wider">
              Quà tặng Doanh nghiệp 4.0
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-8 leading-tight">
            Tặng quà 1.000 người <br />
            <span className="italic text-blue-800">
              chỉ bằng một đường Link
            </span>
          </h1>

          <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Quên đi cảnh thu thập địa chỉ thủ công hay nỗi lo tặng nhầm size áo.
            Trao quyền chọn lựa cho người nhận. Tối ưu thời gian cho người tặng.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-stone-900 hover:bg-blue-800 text-white rounded-full px-10 py-7 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              Tạo chiến dịch quà tặng
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="border-2 border-stone-200 text-stone-900 hover:border-stone-900 hover:bg-stone-50 rounded-full px-10 py-7 text-lg font-bold shadow-sm hover:shadow-md transition-all"
            >
              Xem mẫu quà
            </Button>
          </div>
        </div>
      </section>

      {/* THE "MAGIC" FLOW - REDEEM LINK EXPLAINED */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-blue-800 uppercase mb-4 block">
              Cách hoạt động
            </span>
            <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-6 italic">
              Trao quyền chọn quà <br /> cho người nhận
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Công nghệ "Cổng Quà Tặng" độc quyền của Printz giúp bạn gửi quà
              đến hàng nghìn người mà không cần biết địa chỉ của họ trước.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Line nối các bước trên Desktop */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-blue-100 -z-10" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative bg-white pt-4">
                  <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-24 h-24 mx-auto bg-blue-50 border-2 border-blue-100 group-hover:border-blue-800 group-hover:bg-blue-800 rounded-full flex items-center justify-center mb-6 transition-all shadow-sm">
                      <Icon
                        className="w-10 h-10 text-blue-800 group-hover:text-white transition-colors"
                        strokeWidth={1.5}
                      />
                    </div>

                    <span className="font-serif text-6xl font-bold text-stone-100 absolute top-0 right-[20%] -z-10 select-none">
                      {step.number}
                    </span>

                    <h3 className="font-bold text-2xl text-stone-900 mb-3 px-4">
                      {step.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed px-4">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAIN POINT & BENEFITS */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 italic">
              Tại sao HR yêu thích Printz?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-white border border-stone-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mb-6 text-stone-900">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <LPSocialProof />

      {/* OCCASIONS - KEEPING THIS AS IT IS GOOD CONTEXT */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-stone-900 mb-6 italic">
              Một nền tảng cho mọi dịp
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Không cần tìm 10 nhà cung cấp khác nhau. Printz có đủ quà cho cả
              năm hoạt động của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {occasions.map((occasion, i) => (
              <div
                key={i}
                className="p-6 bg-stone-50 rounded-xl border border-stone-200 hover:border-blue-800 hover:bg-blue-50/30 transition-all"
              >
                <h3 className="font-bold text-lg text-stone-900 mb-4 pb-3 border-b border-stone-200/60">
                  {occasion.title}
                </h3>
                <ul className="space-y-3">
                  {occasion.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-stone-700 text-sm font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-blue-900 text-white border-y border-blue-800 overflow-hidden relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-blue-800/50">
            <div className="p-4">
              <div className="text-5xl font-serif font-bold text-blue-200 mb-2">
                500+
              </div>
              <p className="text-blue-100 font-medium tracking-wide uppercase text-sm">
                Doanh nghiệp tin dùng
              </p>
            </div>
            <div className="p-4">
              <div className="text-5xl font-serif font-bold text-blue-200 mb-2">
                50K+
              </div>
              <p className="text-blue-100 font-medium tracking-wide uppercase text-sm">
                Hộp quà được trao
              </p>
            </div>
            <div className="p-4">
              <div className="text-5xl font-serif font-bold text-blue-200 mb-2">
                99%
              </div>
              <p className="text-blue-100 font-medium tracking-wide uppercase text-sm">
                Nhận hàng đúng hạn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - HIGH CONTRAST & DEPTH */}
      <section className="py-24 bg-stone-950 text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl mb-6 italic text-white">
            Bạn đã sẵn sàng đổi mới cách tặng quà?
          </h2>
          <p className="text-xl text-stone-400 mb-10 leading-relaxed">
            Đừng để việc tặng quà trở thành gánh nặng của bộ phận Hành chính.{" "}
            <br />
            Hãy biến nó thành niềm vui với công nghệ của Printz.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white text-stone-950 hover:bg-blue-400 hover:text-stone-950 rounded-full px-12 py-8 text-lg font-bold shadow-xl transition-all border-2 border-transparent"
            >
              Tư vấn miễn phí
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="bg-transparent border-2 border-stone-700 text-stone-300 hover:text-white hover:border-white rounded-full px-12 py-8 text-lg font-bold transition-all"
            >
              Xem Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
